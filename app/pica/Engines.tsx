import { useEffect, useRef, useState } from "react";
import { pop, press, shake } from "./anim";
import { sfx, speak } from "./audio";
import { BY, DIC, MIXED, SETS } from "./data";
import { IconMcard } from "./icons";
import { randInt, shuffle, svgOf } from "./questions";
import type { GameDef, Item } from "./types";

/**
 * The five stateful game engines (seri 2): memory, puzzle, simon, color and
 * build. Each owns its round state and reports a 0–8 score via onDone.
 * Ported from kila-games-phase2.html.
 */
export function EngineGame({
	game,
	level,
	onDone,
}: {
	game: GameDef;
	level: number;
	onDone: (score: number) => void;
}) {
	if (game.t === "memory") return <MemoryGame level={level} onDone={onDone} />;
	if (game.t === "puzzle") return <PuzzleGame game={game} level={level} onDone={onDone} />;
	if (game.t === "simon") return <SimonGame game={game} level={level} onDone={onDone} />;
	if (game.t === "color") return <ColorGame onDone={onDone} />;
	return <BuildGame onDone={onDone} />;
}

/* ─── mesin memori ───────────────────────────────────────────────────── */

type MemCard = { id: string; svg: string; matched: boolean };

function MemoryGame({ level, onDone }: { level: number; onDone: (score: number) => void }) {
	const pairs = [2, 3, 4, 6, 8][level - 1];
	const cols = pairs <= 2 ? 2 : pairs <= 3 ? 3 : 4;
	const [deck, setDeck] = useState<MemCard[]>(() => {
		const pool = shuffle(MIXED).slice(0, pairs);
		return shuffle(pool.flatMap((it) => [it, it]).map((it) => ({ id: it.id, svg: svgOf(it), matched: false })));
	});
	const [open, setOpen] = useState<number | null>(null);
	const [pending, setPending] = useState<[number, number] | null>(null);
	const [moves, setMoves] = useState(0);
	const [matched, setMatched] = useState(0);
	const busyRef = useRef(false);
	const gridRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const t = window.setTimeout(() => speak("Ingat pasangannya!"), 400);
		return () => window.clearTimeout(t);
	}, []);

	function onCard(i: number, el: HTMLButtonElement) {
		if (busyRef.current) return;
		const c = deck[i];
		if (c.matched) return;
		sfx.pop();
		if (open === null) {
			setOpen(i);
			return;
		}
		if (open === i) return;
		const o = open;
		setOpen(null);
		const first = deck[o];
		const newMoves = moves + 1;
		setMoves(newMoves);
		if (first.id === c.id) {
			setDeck((prev) => prev.map((x, k) => (k === i || k === o ? { ...x, matched: true } : x)));
			const nm = matched + 1;
			setMatched(nm);
			sfx.ok();
			pop(el);
			if (nm >= pairs) onDone(Math.max(3, 8 - Math.max(0, newMoves - pairs - 2)));
		} else {
			setPending([o, i]);
			sfx.bad();
			shake(el);
			const openEl = gridRef.current?.querySelectorAll<HTMLButtonElement>(".mcard")[o];
			if (openEl) shake(openEl);
			busyRef.current = true;
			window.setTimeout(() => {
				busyRef.current = false;
				setPending(null);
			}, 780);
		}
	}

	return (
		<>
			<div className="rounds">
				{matched} / {pairs} pasang ditemukan
			</div>
			<div className="stage">
				<div className="mgrid" ref={gridRef} style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
					{deck.map((c, i) => {
						const up = c.matched || open === i || (pending !== null && (pending[0] === i || pending[1] === i));
						return (
							<button
								key={i}
								type="button"
								className={`mcard${up ? " up" : ""}${c.matched ? " matched" : ""}`}
								onClick={(e) => onCard(i, e.currentTarget)}
								aria-label={`Kartu ${i + 1}`}
							>
								<span className="mface mback">
									<IconMcard />
								</span>
								<span className="mface mfront" dangerouslySetInnerHTML={{ __html: c.svg }} />
							</button>
						);
					})}
				</div>
			</div>
		</>
	);
}

/* ─── mesin puzzle ───────────────────────────────────────────────────── */

const SCENES: Record<string, string> = {
	rumah:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="#EFF6FF"/><circle cx="204" cy="42" r="20" fill="#FCD34D"/><path d="M24 128 L120 36 L216 128 L202 128 L202 216 L38 216 L38 128 Z" fill="#FDE68A"/><path d="M24 128 L120 36 L216 128" stroke="#D97706" stroke-width="8" fill="none" stroke-linejoin="round"/><rect x="46" y="142" width="148" height="74" rx="6" fill="#F9A8D4"/><rect x="76" y="168" width="42" height="48" rx="4" fill="#92400E"/><rect x="128" y="168" width="40" height="48" rx="4" fill="#92400E"/><rect x="150" y="150" width="24" height="24" rx="4" fill="#BFDBFE" stroke="#60A5FA" stroke-width="3"/><rect x="60" y="150" width="24" height="24" rx="4" fill="#BFDBFE" stroke="#60A5FA" stroke-width="3"/></svg>',
	ikan:
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240"><rect width="240" height="240" fill="#E0F2FE"/><path d="M30 176 C80 190 160 190 210 176" stroke="#7DD3FC" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M30 120 C80 134 160 134 210 120" stroke="#7DD3FC" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="40" cy="48" r="8" fill="#7DD3FC" opacity=".8"/><circle cx="70" cy="30" r="6" fill="#7DD3FC" opacity=".8"/><ellipse cx="132" cy="110" rx="54" ry="38" fill="#60A5FA"/><path d="M80 110 L52 84 L52 136 Z" fill="#3B82F6"/><path d="M96 84 L122 62 L136 88 Z" fill="#2563EB"/><circle cx="146" cy="104" r="9" fill="#1E3A8A"/><circle cx="149" cy="101" r="3" fill="#fff"/></svg>',
};

const sceneUrl = (name: string) => `url("data:image/svg+xml;utf8,${encodeURIComponent(SCENES[name])}")`;

function PuzzleGame({
	game,
	level,
	onDone,
}: {
	game: GameDef;
	level: number;
	onDone: (score: number) => void;
}) {
	const isNine = game.id === "puzzle-6-9";
	const n = isNine ? [6, 6, 9, 9, 9][level - 1] : [4, 4, 6, 6, 6][level - 1];
	const cols = n === 4 ? 2 : 3;
	const rows = n / cols;
	const cell = n === 4 ? 112 : n === 6 ? 84 : 80;
	const [scene] = useState(() => Object.keys(SCENES)[randInt(0, 1)]);
	const [tiles, setTiles] = useState<number[]>(() => shuffle(Array.from({ length: n }, (_, i) => i)));
	const [sel, setSel] = useState<number | null>(null);
	const movesRef = useRef(0);
	const W = cols * cell;
	const H = rows * cell;
	const url = sceneUrl(scene);

	useEffect(() => {
		const t = window.setTimeout(() => speak("Pasang potongannya!"), 400);
		return () => window.clearTimeout(t);
	}, []);

	function onPzl(i: number) {
		if (tiles[i] === i) return;
		if (sel === null) {
			setSel(i);
			sfx.pop();
			return;
		}
		if (sel === i) {
			setSel(null);
			return;
		}
		const a = sel;
		const next = [...tiles];
		next[a] = tiles[i];
		next[i] = tiles[a];
		movesRef.current += 1;
		setTiles(next);
		setSel(null);
		sfx.ok();
		if (next.every((t, k) => t === k)) {
			onDone(Math.max(3, 8 - Math.max(0, movesRef.current - n)));
		}
	}

	return (
		<>
			<div className="rounds">Ketuk dua potongan untuk menukarnya</div>
			<div className="stage">
				<div className="pzl-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, width: W }}>
					{Array.from({ length: n }, (_, i) => {
						const o = tiles[i];
						const r = Math.floor(o / cols);
						const c = o % cols;
						return (
							<button
								key={i}
								type="button"
								className={`pzl-cell${o === i ? " correct" : ""}${sel === i ? " sel" : ""}`}
								style={{
									backgroundImage: url,
									backgroundSize: `${W}px ${H}px`,
									backgroundPosition: `-${c * cell}px -${r * cell}px`,
								}}
								onClick={() => onPzl(i)}
								aria-label="Potongan puzzle"
							/>
						);
					})}
				</div>
			</div>
		</>
	);
}

/* ─── mesin simon (piano / drum) ─────────────────────────────────────── */

type Pad = { c: string; l?: string; n?: string; f?: number };

const PIANO: Pad[] = [
	{ f: 261.63, c: "#F59E0B", l: "Do" },
	{ f: 293.66, c: "#F97316", l: "Re" },
	{ f: 329.63, c: "#EF4444", l: "Mi" },
	{ f: 349.23, c: "#F472B6", l: "Fa" },
	{ f: 392.0, c: "#8B5CF6", l: "Sol" },
	{ f: 440.0, c: "#3B82F6", l: "La" },
	{ f: 493.88, c: "#0EA5E9", l: "Si" },
	{ f: 523.25, c: "#34D399", l: "Do" },
];

const DRUM: Pad[] = [
	{ n: "dum", c: "#EF4444" },
	{ n: "tak", c: "#F59E0B" },
	{ n: "sss", c: "#60A5FA" },
	{ n: "deng", c: "#34D399" },
	{ n: "tir", c: "#A78BFA" },
	{ n: "pak", c: "#F472B6" },
];

function SimonGame({
	game,
	level,
	onDone,
}: {
	game: GameDef;
	level: number;
	onDone: (score: number) => void;
}) {
	const isPiano = game.id === "piano";
	const pads = isPiano ? PIANO : DRUM;
	const lenMax = [3, 4, 5, 6, 8][level - 1];
	const [seq, setSeq] = useState<number[]>(() => [randInt(0, pads.length - 1)]);
	const [phase, setPhase] = useState<"idle" | "show" | "input">("idle");
	const [idx, setIdx] = useState(0);
	const mistakesRef = useRef(0);
	const timersRef = useRef<number[]>([]);
	const gridRef = useRef<HTMLDivElement>(null);

	function later(fn: () => void, ms: number) {
		const id = window.setTimeout(fn, ms);
		timersRef.current.push(id);
		return id;
	}

	useEffect(() => {
		timersRef.current.forEach((t) => window.clearTimeout(t));
		timersRef.current = [];
		const t = later(() => playSeq(), 900);
		return () => {
			timersRef.current.forEach((x) => window.clearTimeout(x));
			void t;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	function flashPad(pi: number) {
		const el = gridRef.current?.querySelectorAll<HTMLButtonElement>("[data-i]")[pi];
		if (!el) return;
		el.classList.add("lit");
		window.setTimeout(() => el.classList.remove("lit"), 420);
	}

	function padSound(pi: number) {
		const p = pads[pi];
		if (isPiano && p.f) sfx.note(p.f);
		else if (p.n) sfx.drum(p.n);
	}

	function playSeq() {
		setPhase("show");
		setIdx(0);
		seq.forEach((pi, i) => {
			later(() => {
				flashPad(pi);
				padSound(pi);
			}, i * 620);
		});
		later(() => setPhase("input"), seq.length * 620 + 250);
	}

	function onPad(i: number, el: HTMLButtonElement) {
		if (phase !== "input") return;
		flashPad(i);
		padSound(i);
		if (i === seq[idx]) {
			const ni = idx + 1;
			if (ni >= seq.length) {
				sfx.ok();
				if (seq.length >= lenMax) {
					onDone(Math.min(8, seq.length));
					return;
				}
				const next = [...seq, randInt(0, pads.length - 1)];
				setSeq(next);
				setIdx(0);
				later(() => {
					// Replay with the grown sequence.
					setPhase("show");
					next.forEach((pi, k) => {
						later(() => {
							flashPad(pi);
							padSound(pi);
						}, k * 620);
					});
					later(() => setPhase("input"), next.length * 620 + 250);
				}, 550);
			} else {
				setIdx(ni);
			}
		} else {
			mistakesRef.current += 1;
			sfx.bad();
			shake(el);
			if (mistakesRef.current >= 3) {
				onDone(Math.max(1, seq.length - 1));
			} else {
				later(() => playSeq(), 900);
			}
		}
	}

	return (
		<>
			<div className="rounds">Nada ke-{seq.length}</div>
			<div className="stage">
				<div ref={gridRef}>
					{isPiano ? (
						<div className="keys">
							{pads.map((p, i) => (
								<button
									key={i}
									type="button"
									className="key"
									style={{ background: p.c }}
									data-i={i}
									onClick={(e) => onPad(i, e.currentTarget)}
									aria-label={`Nada ${p.l}`}
								>
									{p.l}
								</button>
							))}
						</div>
					) : (
						<div className="simon-grid">
							{pads.map((p, i) => (
								<button
									key={i}
									type="button"
									className="pad"
									style={{ background: p.c }}
									data-i={i}
									onClick={(e) => onPad(i, e.currentTarget)}
									aria-label={`Pad ${p.n}`}
								>
									<svg className="i" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: DIC[p.n!] }} />
									<span className="pad-n">{p.n}</span>
								</button>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}

/* ─── mesin mewarnai ─────────────────────────────────────────────────── */

const PALETTE = ["#F59E0B", "#F97316", "#EF4444", "#F472B6", "#A78BFA", "#3B82F6", "#0EA5E9", "#34D399"];

const COLOR_SCENES: { id: string; regs: string[]; svg: string }[] = [
	{
		id: "ikan",
		regs: ["bg", "tail", "body", "fin", "eye"],
		svg:
			'<svg viewBox="0 0 320 260"><rect class="reg" data-reg="bg" width="320" height="260" fill="#EDEFF3"/><circle cx="52" cy="48" r="10" fill="#EDEFF3"/><circle cx="96" cy="30" r="7" fill="#EDEFF3"/><path class="reg" data-reg="tail" d="M96 130 L40 96 L40 164 Z" fill="#EDEFF3"/><ellipse class="reg" data-reg="body" cx="176" cy="130" rx="78" ry="56" fill="#EDEFF3"/><path class="reg" data-reg="fin" d="M168 80 Q200 60 226 92 Q200 96 180 96 Z" fill="#EDEFF3"/><circle class="reg" data-reg="eye" cx="212" cy="120" r="13" fill="#EDEFF3"/></svg>',
	},
	{
		id: "bunga",
		regs: ["bg", "stem", "leafL", "leafR", "petals", "center"],
		svg:
			'<svg viewBox="0 0 320 300"><rect class="reg" data-reg="bg" width="320" height="300" fill="#EDEFF3"/><path class="reg" data-reg="stem" d="M156 210 Q150 150 156 96 L180 96 Q186 150 180 210 Z" fill="#EDEFF3"/><path class="reg" data-reg="leafL" d="M156 170 Q118 160 96 132 Q132 126 156 150 Z" fill="#EDEFF3"/><path class="reg" data-reg="leafR" d="M180 188 Q222 186 244 158 Q206 150 180 168 Z" fill="#EDEFF3"/><path class="reg" data-reg="petals" d="M168 26 Q208 34 218 74 Q178 70 168 40 Z M136 34 Q102 64 106 104 Q138 92 144 62 Z M96 108 Q80 146 112 168 Q124 132 122 98 Z M148 168 Q186 194 222 170 Q192 142 164 142 Z M216 120 Q238 92 224 56 Q204 88 208 118 Z" fill="#EDEFF3"/><circle class="reg" data-reg="center" cx="168" cy="110" r="34" fill="#EDEFF3"/></svg>',
	},
	{
		id: "rumah",
		regs: ["bg", "sun", "roof", "wall", "door", "window"],
		svg:
			'<svg viewBox="0 0 320 300"><rect class="reg" data-reg="bg" width="320" height="300" fill="#EDEFF3"/><circle class="reg" data-reg="sun" cx="258" cy="52" r="34" fill="#EDEFF3"/><path class="reg" data-reg="roof" d="M36 150 L160 34 L284 150 L258 150 L258 152 L62 152 Z" fill="#EDEFF3"/><rect class="reg" data-reg="wall" x="58" y="150" width="204" height="110" fill="#EDEFF3"/><rect class="reg" data-reg="door" x="120" y="196" width="54" height="64" rx="6" fill="#EDEFF3"/><rect class="reg" data-reg="window" x="196" y="176" width="40" height="40" rx="6" fill="#EDEFF3"/></svg>',
	},
];

function ColorGame({ onDone }: { onDone: (score: number) => void }) {
	const [scene] = useState(() => COLOR_SCENES[randInt(0, COLOR_SCENES.length - 1)]);
	const [color, setColor] = useState(0);
	const filledRef = useRef<Record<string, number>>({});
	const lockedRef = useRef(false);
	const sceneRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const t = window.setTimeout(() => speak("Warnai gambarnya!"), 400);
		const sc = sceneRef.current;
		if (sc) {
			sc.querySelectorAll(".reg").forEach((el) => {
				el.setAttribute("tabindex", "0");
				el.setAttribute("role", "button");
				el.setAttribute("aria-label", `Warnai bagian ${el.getAttribute("data-reg") ?? ""}`);
			});
		}
		return () => window.clearTimeout(t);
	}, [scene]);

	function onReg(el: SVGElement) {
		const id = el.getAttribute("data-reg");
		if (!id || lockedRef.current) return;
		sfx.pop();
		press(el);
		el.setAttribute("fill", PALETTE[color]);
		el.classList.add("done");
		if (!filledRef.current[id]) filledRef.current[id] = 1;
		const filled = Object.keys(filledRef.current).length;
		if (filled >= scene.regs.length) {
			lockedRef.current = true;
			onDone(Math.round((filled / scene.regs.length) * 8));
		}
	}

	function onSceneClick(e: React.MouseEvent<HTMLDivElement>) {
		const reg = (e.target as Element).closest(".reg");
		if (reg) onReg(reg as SVGElement);
	}

	function clearColor() {
		sceneRef.current?.querySelectorAll(".reg").forEach((el) => {
			el.setAttribute("fill", "#EDEFF3");
			el.classList.remove("done");
		});
		filledRef.current = {};
		sfx.tap();
	}

	return (
		<>
			<div className="rounds">Pilih warna, lalu ketuk gambarnya</div>
			<div className="stage">
				<div className="color-scene" ref={sceneRef} onClick={onSceneClick} dangerouslySetInnerHTML={{ __html: scene.svg }} />
				<div className="color-pal">
					{PALETTE.map((h, i) => (
						<button
							key={i}
							type="button"
							className={`cbtn${i === color ? " sel" : ""}`}
							style={{ background: h }}
							onClick={() => {
								setColor(i);
								sfx.pop();
							}}
							aria-label={`Warna ${i + 1}`}
						/>
					))}
				</div>
				<div className="color-tools">
					<button type="button" className="btn btn-ghost" onClick={clearColor}>
						Hapus Warna
					</button>
				</div>
			</div>
		</>
	);
}

/* ─── mesin shape builder ────────────────────────────────────────────── */

const BUILD_SLOTS: { need: string; label: string }[] = [
	{ need: "segitiga", label: "Atap" },
	{ need: "kotak", label: "Dinding" },
	{ need: "persegi-panjang", label: "Pintu" },
	{ need: "lingkaran", label: "Matahari" },
	{ need: "bintang", label: "Bintang" },
];

function BuildGame({ onDone }: { onDone: (score: number) => void }) {
	const [tray] = useState<Item[]>(() => shuffle(SETS.bentuk.slice()));
	const [idx, setIdx] = useState(0);
	const lockedRef = useRef(false);

	useEffect(() => {
		const t = window.setTimeout(() => speak("Pasang bentuknya!"), 400);
		return () => window.clearTimeout(t);
	}, []);

	function onBld(v: string, el: HTMLButtonElement) {
		if (idx >= BUILD_SLOTS.length || lockedRef.current) return;
		sfx.tap();
		press(el);
		if (v === BUILD_SLOTS[idx].need) {
			sfx.ok();
			pop(el);
			const ni = idx + 1;
			setIdx(ni);
			if (ni >= BUILD_SLOTS.length) {
				lockedRef.current = true;
				onDone(Math.round((ni / BUILD_SLOTS.length) * 8));
			}
		} else {
			sfx.bad();
			shake(el);
		}
	}

	return (
		<>
			<div className="rounds">Pilih bentuk yang pas untuk setiap slot</div>
			<div className="stage">
				<div className="build-scene">
					{BUILD_SLOTS.map((s, i) => (
						<div key={s.need} className={`build-slot${i < idx ? " filled" : ""}`}>
							<span className="sil" dangerouslySetInnerHTML={{ __html: svgOf(BY[s.need]) }} />
							{i < idx ? null : <span className="slot-label">{s.label}</span>}
						</div>
					))}
				</div>
				<div className="build-tray">
					{tray.map((it) => (
						<button
							key={it.id}
							type="button"
							className="build-opt"
							onClick={(e) => onBld(it.id, e.currentTarget)}
							aria-label={it.name}
							dangerouslySetInnerHTML={{ __html: svgOf(it) }}
						/>
					))}
				</div>
			</div>
		</>
	);
}
