import { BY, LET, MIXED, NQ, SETS, SHAPE_COLORS, SIM, WORDS } from "./data";
import type { GameDef, Item, LetterMode, OrderCell, PickOption, Question } from "./types";

export const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pick = <T,>(arr: readonly T[]): T => arr[randInt(0, arr.length - 1)];

/** Pictogram markup for an item — shape items draw themselves, everything else has `svg`. */
export const svgOf = (it: Item): string => it.svg ?? (it.draw ? it.draw(it.c ?? "#000") : "");

export function shuffle<T>(a: T[]): T[] {
	const arr = [...a];
	for (let i = arr.length - 1; i > 0; i--) {
		const j = randInt(0, i);
		[arr[i], arr[j]] = [arr[j], arr[i]];
	}
	return arr;
}

const setOf = (g: GameDef): readonly Item[] => {
	if (g.set === "campur") return MIXED;
	return SETS[g.set ?? ""] ?? [];
};

/** The handful of numbers near `n` (so a counting answer isn't a giveaway). */
function distinctNumbers(n: number, count: number): number[] {
	const s = new Set<number>([n]);
	const cand = shuffle(
		[n - 2, n - 1, n + 1, n + 2, n + 3].filter(
			(x) => x >= 1 && x <= 8 && x !== n,
		),
	);
	for (const c of cand) {
		if (s.size >= count) break;
		s.add(c);
	}
	return shuffle([...s]);
}

function genPick(g: GameDef, lv: number): Question {
	const set = setOf(g);
	const target = pick(set);
	const optN = Math.min(lv + 1, 4);

	// "Cocokkan Warna" at level 3+: offer visually-similar shades of the target.
	if (g.similar && lv >= 3 && target.near) {
		const near = shuffle(target.near.slice());
		const opts: PickOption[] = [{ item: { id: target.id, hex: target.hex } }];
		let ni = 0;
		while (opts.length < optN && ni < near.length) {
			opts.push({ item: { id: `near${++ni}`, hex: near[ni - 1] } });
		}
		for (const c of set) {
			if (opts.length >= optN) break;
			if (c.id === target.id) continue;
			opts.push({ item: { id: c.id, hex: c.hex } });
		}
		return { type: "pick", target, opts: shuffle(opts), audio: false };
	}

	const opts: PickOption[] = [{ item: target }];
	for (const c of set) {
		if (opts.length >= optN) break;
		if (c.id === target.id) continue;
		opts.push({ item: c, c: g.vary ? pick(SHAPE_COLORS) : undefined });
	}
	return {
		type: "pick",
		target,
		opts: shuffle(opts),
		audio: g.audio !== false && lv >= 4,
		speakText: target.name,
	};
}

function genPair(g: GameDef, lv: number): Question {
	const pair = pick(g.pairs!);
	const optN = Math.min(lv + 1, 4);
	const opts = [pair.to];
	for (const c of shuffle(g.toPool!)) {
		if (opts.length >= optN) break;
		if (c.id === pair.to.id) continue;
		opts.push(c);
	}
	return {
		type: "pair",
		from: pair.from,
		to: pair.to,
		opts: shuffle(opts),
		audio: g.audio !== false && lv >= 4,
		speakText: pair.from.name,
	};
}

function genCount(g: GameDef, lv: number): Question {
	const hi = [2, 3, 4, 5, 6][lv - 1];
	const n = randInt(1, hi);
	return {
		type: "count",
		n,
		item: pick(setOf(g)),
		opts: distinctNumbers(n, Math.min(lv + 1, 4)),
	};
}

function genCompare(g: GameDef, lv: number): Question {
	const hi = [4, 5, 6, 7, 7][lv - 1];
	let nA = randInt(2, hi - 1);
	let nB = randInt(nA + 1, hi);
	const item = pick(setOf(g));
	let A = { item, n: nA };
	let B = { item, n: nB };
	if (Math.random() < 0.5) [A, B] = [B, A];
	return { type: "compare", A, B, answer: A.n >= B.n ? "A" : "B" };
}

/* ─── Seri 2: pertanyaan (letter / odd / order / pat / miss) ─────────── */
function genLetter(g: GameDef, lv: number): Question {
	const optN = Math.min(lv + 1, 5);
	if (g.sub === "besar-kecil") {
		const t = pick(LET);
		const opts = shuffle([t, ...shuffle(LET.filter((x) => x !== t)).slice(0, optN - 1)]).map((x) => ({ v: x.toLowerCase(), d: x.toLowerCase() }));
		return { type: "letter", mode: "besar-kecil", ans: t.toLowerCase(), big: t, opts };
	}
	if (g.sub === "awal") {
		const w = pick(WORDS);
		const f = w.w[0];
		const opts = shuffle([f, ...shuffle(LET.filter((x) => x !== f)).slice(0, optN - 1)]).map((x) => ({ v: x, d: x }));
		return { type: "letter", mode: "awal", ans: f, word: w, opts };
	}
	const t = pick(LET);
	const audioOn = g.sub === "dengar" || lv >= 4;
	const opts = shuffle([t, ...shuffle(LET.filter((x) => x !== t)).slice(0, optN - 1)]).map((x) => ({ v: x, d: x }));
	return { type: "letter", mode: (g.sub ?? "tebak") as LetterMode, ans: t, opts, audio: audioOn };
}

/**
 * Pick a second item whose pictogram is guaranteed to differ visually from a
 * given one. Mirror tricks (`scaleX(-1)`) are invisible for horizontally
 * symmetric drawings and SIM only covers 4 pairs, so for "type"/"mirror"
 * rounds we fall back to a genuinely different item — an odd tile the child
 * can actually see. `big` (scale/size) stays as the subtle variant.
 */
function distinctOdd(t: Item): { oddSvg: string; cls: string } {
	const others = svgOf(t);
	// Prefer an item from MIXED whose markup differs — guaranteed visible.
	for (const cand of shuffle(MIXED)) {
		if (cand.id === t.id) continue;
		if (svgOf(cand) !== others) return { oddSvg: svgOf(cand), cls: "big" };
	}
	// No visibly-different item exists (degenerate) — nudge size so it stands out.
	return { oddSvg: others, cls: "big" };
}

function genOdd(_g: GameDef, lv: number): Question {
	const size = [4, 6, 9, 12, 16][lv - 1];
	const t = pick(MIXED);
	const others = svgOf(t);
	let oddSvg = others,
		cls = "";
	const mode = lv === 3 ? "type" : lv % 2 === 0 ? "big" : "mirror";
	if (mode === "type") {
		const sim = pick(SIM.filter((p) => p[0] === t.id || p[1] === t.id));
		if (sim) {
			const oid = sim[0] === t.id ? sim[1] : sim[0];
			if (BY[oid] && svgOf(BY[oid]) !== others) {
				// A genuinely different-but-similar pair — great for lv3.
				oddSvg = svgOf(BY[oid]);
				cls = "big";
			} else {
				// Fallback: definitely-different item.
				({ oddSvg, cls } = distinctOdd(t));
			}
		} else {
			// Item not in the pair list — swap in a guaranteed-different odd tile.
			({ oddSvg, cls } = distinctOdd(t));
		}
	} else if (mode === "mirror") {
		// Mirror (`scaleX(-1)`) is invisible on horizontally-symmetric drawings,
		// which would make the grid look identical and block the child from
		// spotting a difference. Instead of guessing which items are symmetric,
		// always fall back to a genuinely visible different odd tile.
		({ oddSvg, cls } = distinctOdd(t));
	} else {
		cls = "big";
	}
	return { type: "odd", others, odd: oddSvg, cls, size };
}

function genOrder(g: GameDef, lv: number): Question {
	const n = [3, 4, 5, 6, 7][lv - 1];
	let order: OrderCell[] = [];
	if (g.sub === "angka") {
		const start = randInt(1, 11 - n);
		for (let i = 0; i < n; i++) order.push({ k: String(start + i), d: String(start + i), kind: "num", _i: i });
	} else if (g.sub === "besar") {
		const it = pick(MIXED);
		const scales = [0.5, 0.62, 0.74, 0.86, 0.98, 1.1, 1.22];
		for (let i = 0; i < n; i++) order.push({ k: it.id + "-" + i, d: String(i), kind: "obj", it, w: Math.round(30 + scales[i] * 36), _i: i });
	} else {
		const len = [3, 4, 4, 5, 5][lv - 1];
		const cand = WORDS.filter((x) => x.w.length === len && new Set(x.w).size === len);
		const w = pick(cand).w;
		order = w.split("").map((ch, i) => ({ k: ch, d: ch, kind: "let", _i: i }));
	}
	const shown = shuffle(order.map((it, i) => ({ ...it, _i: i })));
	return { type: "order", order: order.map((it) => it.k), shown };
}

function genPat(_g: GameDef, lv: number): Question {
	const n = [4, 5, 5, 6, 6][lv - 1];
	const t = pick(["AB", "AABB", "ABC", "AAB"]);
	const pool = shuffle(SETS.bentuk.slice());
	const a = pool[0], b = pool[1], c = pool[2];
	const at = (i: number): Item => {
		if (t === "AB") return i % 2 ? b : a;
		if (t === "AABB") return Math.floor(i / 2) % 2 ? b : a;
		if (t === "ABC") return [a, b, c][i % 3];
		return i % 3 === 2 ? b : a;
	};
	const seq: Item[] = [];
	for (let i = 0; i < n - 1; i++) seq.push(at(i));
	const ans = at(n - 1);
	const opts = shuffle([ans, ...shuffle(SETS.bentuk.filter((x) => x.id !== ans.id)).slice(0, 2)]);
	return { type: "pat", seq, ans, opts };
}

function genMiss(_g: GameDef, lv: number): Question {
	const n = [3, 4, 5, 6, 6][lv - 1];
	const items = shuffle(MIXED).slice(0, n);
	const hidden = pick(items);
	return { type: "miss", items, hidden: hidden.id };
}

function genOne(g: GameDef, lv: number): Question {
	switch (g.t) {
		case "pick":
			return genPick(g, lv);
		case "pair":
			return genPair(g, lv);
		case "count":
			return genCount(g, lv);
		case "compare":
			return genCompare(g, lv);
		case "letter":
			return genLetter(g, lv);
		case "odd":
			return genOdd(g, lv);
		case "order":
			return genOrder(g, lv);
		case "pat":
			return genPat(g, lv);
		case "miss":
			return genMiss(g, lv);
	}
	// Engine games (memory/puzzle/simon/color/build) never reach here.
	return genPick(g, lv);
}

/** A fresh batch of questions for one round. */
export function generateQuestions(g: GameDef, lv: number, count = NQ): Question[] {
	return Array.from({ length: count }, () => genOne(g, lv));
}

/** Whether an option value (item id, number, "A"/"B", or letter) is the right answer. */
export function isCorrect(q: Question, value: string): boolean {
	if (q.type === "pick") return value === q.target.id;
	if (q.type === "pair") return value === q.to.id;
	if (q.type === "count") return parseInt(value, 10) === q.n;
	if (q.type === "compare") return value === q.answer;
	if (q.type === "letter") return value.toLowerCase() === q.ans.toLowerCase();
	if (q.type === "odd") return value === "odd";
	if (q.type === "pat") return value === q.ans.id;
	if (q.type === "miss") return value === q.hidden;
	return false; // "order" is scored by the dedicated component, not this helper.
}
