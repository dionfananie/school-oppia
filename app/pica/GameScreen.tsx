import { useEffect, useMemo, useRef, useState } from "react";
import { animate, pop, popStars, press, reducedMotion, shake } from "./anim";
import { sfx, speak, stopSpeak } from "./audio";
import { checkAch, ICON_MISS, NQ } from "./data";
import type { Ach } from "./data";
import { EngineGame } from "./Engines";
import { IconBack, IconMute, IconSound, IconSpeak, IconStar, IconTrophy } from "./icons";
import { Pic, Target, svgMarkup } from "./Pic";
import { generateQuestions, isCorrect, svgOf } from "./questions";
import { load, save } from "./storage";
import type { CountGroup, GameDef, Item, LetterOption, OrderCell, Question } from "./types";

type Result = { leveled: boolean; newLevel: number };
type OptState = "idle" | "right" | "wrong" | "disabled";

const ENGINE_TYPES = new Set(["memory", "puzzle", "simon", "color", "build"]);

export function GameScreen({
	game,
	muted,
	onToggleMute,
	onBack,
	onRestart,
}: {
	game: GameDef;
	muted: boolean;
	onToggleMute: () => void;
	onBack: () => void;
	onRestart: () => void;
}) {
	const level = useMemo(() => load(`lv.${game.id}`, 1), [game.id]);
	const isEngine = ENGINE_TYPES.has(game.t);
	const [questions] = useState<Question[]>(() => generateQuestions(game, level));
	const [qIdx, setQIdx] = useState(0);
	const [score, setScore] = useState(0);
	const scoreRef = useRef(0);
	const [answer, setAnswer] = useState<{ value: string; ok: boolean } | null>(null);
	const [wrong, setWrong] = useState<ReadonlySet<string>>(new Set());
	const [result, setResult] = useState<Result | null>(null);
	const [achNews, setAchNews] = useState<Ach[]>([]);
	const [showConfetti, setShowConfetti] = useState(false);
	const starsRef = useRef<HTMLDivElement>(null);
	const finishedRef = useRef(false);

	const q = questions[qIdx];

	// Read the spoken instruction at the top of every round.
	useEffect(() => {
		if (result || !game.inst) return;
		const t = window.setTimeout(() => speak(game.inst), 350);
		return () => window.clearTimeout(t);
	}, [game.inst, result]);

	// Sounds & speech for the current question.
	useEffect(() => {
		if (result || isEngine) return;
		const timers: number[] = [];
		if (q.type === "count") {
			for (let i = 0; i < q.n; i++) timers.push(window.setTimeout(() => sfx.tick(), 260 + i * 90));
		} else if ((q.type === "pick" || q.type === "pair") && q.audio) {
			timers.push(window.setTimeout(() => speak(q.speakText), 420));
		} else if (q.type === "letter" && q.audio) {
			timers.push(window.setTimeout(() => speak(`Mana huruf ${q.ans}?`), 420));
		}
		return () => timers.forEach((t) => window.clearTimeout(t));
	}, [q, result, isEngine]);

	// Pop the star counter whenever a point lands.
	useEffect(() => {
		if (score > 0 && starsRef.current) popStars(starsRef.current);
	}, [score]);

	// Let the confetti finish, then take it down.
	useEffect(() => {
		if (!showConfetti) return;
		const t = window.setTimeout(() => setShowConfetti(false), 3400);
		return () => window.clearTimeout(t);
	}, [showConfetti]);

	function finish(finalScore: number) {
		if (finishedRef.current) return;
		finishedRef.current = true;
		const s = Math.max(0, finalScore);
		const oldLv = load(`lv.${game.id}`, 1);
		let newLevel = oldLv;
		let leveled = false;
		if (s >= 6 && oldLv < 5) {
			newLevel = oldLv + 1;
			leveled = true;
			save(`lv.${game.id}`, newLevel);
		}
		const best = load(`st.${game.id}`, 0);
		if (s > best) save(`st.${game.id}`, s);
		save(`pl.${game.id}`, load(`pl.${game.id}`, 0) + 1);
		save("last", game.id);
		const now = new Date();
		const day = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
		const days = load<string[]>("days", []);
		if (!days.includes(day)) {
			days.push(day);
			save("days", days);
		}
		const news = checkAch();
		sfx.win();
		setResult({ leveled, newLevel });
		setAchNews(news);
		setShowConfetti(true);
	}

	function advance() {
		if (qIdx + 1 >= NQ) finish(scoreRef.current);
		else {
			setQIdx(qIdx + 1);
			setAnswer(null);
			setWrong(new Set());
		}
	}

	function onAnswer(value: string, el: HTMLButtonElement) {
		if (result || answer || wrong.has(value)) return;
		const ok = isCorrect(q, value);
		sfx.tap();
		press(el);
		if (ok) {
			stopSpeak();
			sfx.ok();
			scoreRef.current += 1;
			setScore(scoreRef.current);
			setAnswer({ value, ok: true });
			window.setTimeout(advance, 780);
		} else {
			sfx.bad();
			if (q.type === "pat") {
				// Pattern puzzles keep retryable: flash the miss, don't lock it out.
				el.classList.add("right");
				window.setTimeout(() => el.classList.remove("right"), 600);
				return;
			}
			shake(el);
			setWrong((prev) => new Set(prev).add(value));
		}
	}

	function onOrderDone(ok: boolean) {
		if (result || answer) return;
		if (ok) {
			scoreRef.current += 1;
			setScore(scoreRef.current);
		}
		setAnswer({ value: ok ? "order-ok" : "order-bad", ok });
		window.setTimeout(advance, 760);
	}

	function optState(value: string): OptState {
		if (answer && isCorrect(q, value)) return "right";
		if (wrong.has(value)) return "wrong";
		if (answer) return "disabled";
		return "idle";
	}

	return (
		<>
			<header className="top">
				<button type="button" className="tbtn" onClick={onBack} aria-label="Kembali ke daftar permainan">
					<IconBack />
				</button>
				<div className="top-t">
					<span className="top-name">{game.name}</span>
					<span className="pill">Level {level}</span>
				</div>
				<div className="stars-line" ref={starsRef} aria-live="polite">
					<IconStar />
					<span>{score}</span>
				</div>
				<button
					type="button"
					className="tbtn"
					onClick={onToggleMute}
					aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
				>
					{muted ? <IconMute /> : <IconSound />}
				</button>
			</header>

			{result ? (
				<Celebrate score={score} result={result} achNews={achNews} onRestart={onRestart} onBack={onBack} />
			) : isEngine ? (
				<EngineGame
					game={game}
					level={level}
					onDone={(s) => {
						setScore(s);
						finish(s);
					}}
				/>
			) : (
				<>
					<ProgressDots qIdx={qIdx} />
					{/* key remounts the stage each question so CSS entry animations replay */}
					<div className="stage" key={qIdx}>
						<QuestionStage
							q={q}
							hideName={game.hideName === true}
							inst={game.inst}
							optState={optState}
							onAnswer={onAnswer}
							onOrderDone={onOrderDone}
						/>
					</div>
				</>
			)}

			{showConfetti && <Confetti />}
		</>
	);
}

function ProgressDots({ qIdx }: { qIdx: number }) {
	return (
		<div
			className="prog"
			role="progressbar"
			aria-label="Kemajuan soal"
			aria-valuenow={qIdx + 1}
			aria-valuemin={1}
			aria-valuemax={NQ}
		>
			{Array.from({ length: NQ }, (_, i) => (
				<span key={i} className={`dot${i < qIdx ? " done" : i === qIdx ? " cur" : ""}`} />
			))}
		</div>
	);
}

function QuestionStage({
	q,
	hideName,
	inst,
	optState,
	onAnswer,
	onOrderDone,
}: {
	q: Question;
	hideName: boolean;
	inst?: string;
	optState: (value: string) => OptState;
	onAnswer: (value: string, el: HTMLButtonElement) => void;
	onOrderDone: (ok: boolean) => void;
}) {
	if (q.type === "letter") return <LetterStage q={q} optState={optState} onAnswer={onAnswer} />;
	if (q.type === "odd") return <OddStage q={q} optState={optState} onAnswer={onAnswer} />;
	if (q.type === "order") return <OrderStage q={q} inst={inst} onDone={onOrderDone} />;
	if (q.type === "pat") return <PatStage q={q} optState={optState} onAnswer={onAnswer} />;
	if (q.type === "miss") return <MissStage q={q} optState={optState} onAnswer={onAnswer} />;

	if (q.type === "count") {
		return (
			<div className="qa">
				<div className="count-group">
					{Array.from({ length: q.n }, (_, i) => (
						<span key={i} className="obj" style={{ animationDelay: `${i * 90}ms` }}>
							<Pic item={q.item} />
						</span>
					))}
				</div>
				<p className="q-text">Berapa banyak?</p>
				<div className="opts opts-num">
					{q.opts.map((n) => {
						const v = String(n);
						return (
							<button
								key={n}
								type="button"
								className={`opt num${optState(v) === "right" ? " right" : ""}`}
								disabled={optState(v) !== "idle"}
								onClick={(e) => onAnswer(v, e.currentTarget)}
							>
								{n}
							</button>
						);
					})}
				</div>
			</div>
		);
	}

	if (q.type === "compare") {
		return (
			<div className="qa">
				<p className="q-text">Yang mana lebih banyak?</p>
				<div className="opts opts-grp">
					<GroupButton label="A" group={q.A} state={optState("A")} onAnswer={(el) => onAnswer("A", el)} />
					<GroupButton label="B" group={q.B} state={optState("B")} onAnswer={(el) => onAnswer("B", el)} />
				</div>
			</div>
		);
	}

	const target = q.type === "pair" ? q.from : q.target;
	const isPair = q.type === "pair";
	return (
		<div className="qa">
			{q.audio ? (
				<>
					<button
						type="button"
						className="speak-btn"
						onClick={() => {
							sfx.pop();
							speak(target.name);
						}}
						aria-label="Dengar nama"
					>
						<IconSpeak />
					</button>
					<p className="q-text">
						{isPair ? <>Manakah pasangan <b>{target.name}</b>?</> : <>Manakah <b>{target.name}</b>?</>}
					</p>
				</>
			) : (
				<>
					<div className="target">
						<Target item={target} />
					</div>
					<p className="q-text">{isPair ? "Pilih pasangannya" : "Manakah yang sama?"}</p>
				</>
			)}
			<div className="opts">
				{q.opts.map((o, i) => {
					const item = "item" in o ? o.item : o;
					const color = "c" in o ? o.c : undefined;
					return (
						<OptionButton
							key={i}
							item={item}
							color={color}
							hideName={hideName}
							state={optState(item.id)}
							onAnswer={onAnswer}
						/>
					);
				})}
			</div>
		</div>
	);
}

/* ─── Seri 2: renderer pertanyaan ────────────────────────────────────── */

function LetterStage({
	q,
	optState,
	onAnswer,
}: {
	q: Extract<Question, { type: "letter" }>;
	optState: (value: string) => OptState;
	onAnswer: (value: string, el: HTMLButtonElement) => void;
}) {
	let head;
	if (q.mode === "besar-kecil") {
		head = (
			<>
				<div className="target target-letter">{q.big}</div>
				<p className="q-text">
					Manakah <b>huruf kecilnya</b>?
				</p>
			</>
		);
	} else if (q.mode === "awal") {
		head = (
			<>
				<div className="target target-word">
					{q.word?.pic && <span className="w-pic" dangerouslySetInnerHTML={{ __html: svgOf(q.word.pic) }} />}
					<span className="w-text">{q.word?.w}</span>
				</div>
				<p className="q-text">
					Apa <b>huruf awalnya</b>?
				</p>
			</>
		);
	} else if (q.audio) {
		head = (
			<>
				<button
					type="button"
					className="speak-btn"
					onClick={() => {
						sfx.pop();
						speak(`Mana huruf ${q.ans}?`);
					}}
					aria-label="Dengar nama huruf"
				>
					<IconSpeak />
				</button>
				<p className="q-text">
					Manakah huruf <b>{q.ans}</b>?
				</p>
			</>
		);
	} else {
		head = (
			<>
				<div className="target target-letter">{q.ans}</div>
				<p className="q-text">
					Temukan huruf yang <b>sama</b>!
				</p>
			</>
		);
	}
	return (
		<div className="qa">
			{head}
			<div className="opts">
				{q.opts.map((o) => {
					const st = optState(o.v);
					return (
						<button
							key={o.v}
							type="button"
							className={`opt letter${st === "right" ? " right" : st === "wrong" ? " wrong" : ""}`}
							disabled={st === "disabled" || st === "wrong"}
							onClick={(e) => onAnswer(o.v, e.currentTarget)}
						>
							<span className="lbig">{o.d}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function OddStage({
	q,
	optState,
	onAnswer,
}: {
	q: Extract<Question, { type: "odd" }>;
	optState: (value: string) => OptState;
	onAnswer: (value: string, el: HTMLButtonElement) => void;
}) {
	const [oddPos] = useState(() => Math.floor(Math.random() * q.size));
	const cols = q.size >= 12 ? 4 : q.size >= 6 ? 3 : 2;
	return (
		<div className="qa">
			<p className="q-text">
				Temukan yang <b>berbeda</b>!
			</p>
			<div className="odd-grid" style={{ gridTemplateColumns: `repeat(${cols},1fr)` }}>
				{Array.from({ length: q.size }, (_, i) => {
					const isOdd = i === oddPos;
					const v = isOdd ? "odd" : `n${i}`;
					const st = optState(v);
					return (
						<button
							key={i}
							type="button"
							className={`odd-cell${isOdd ? ` ${q.cls}` : ""}${st === "right" ? " right" : st === "wrong" ? " wrong" : ""}`}
							disabled={st === "disabled" || st === "wrong"}
							onClick={(e) => onAnswer(v, e.currentTarget)}
							aria-label={isOdd ? "Pilihan yang berbeda" : "Pilihan sama"}
						>
							<span dangerouslySetInnerHTML={{ __html: isOdd ? q.odd : q.others }} />
						</button>
					);
				})}
			</div>
		</div>
	);
}

function OrderStage({
	q,
	inst,
	onDone,
}: {
	q: Extract<Question, { type: "order" }>;
	inst?: string;
	onDone: (ok: boolean) => void;
}) {
	const [idx, setIdx] = useState(0);
	const [mistakes, setMistakes] = useState(0);
	const doneRef = useRef(false);

	function finish(ok: boolean) {
		if (doneRef.current) return;
		doneRef.current = true;
		onDone(ok);
	}

	function onCell(it: OrderCell, el: HTMLButtonElement) {
		if (doneRef.current) return;
		sfx.tap();
		press(el);
		if (it.k === q.order[idx]) {
			sfx.ok();
			pop(el);
			const ni = idx + 1;
			if (ni >= q.order.length) finish(mistakes <= 1);
			else setIdx(ni);
		} else {
			const nm = mistakes + 1;
			setMistakes(nm);
			sfx.bad();
			shake(el);
			if (nm > 1) finish(false);
		}
	}

	return (
		<div className="qa">
			<p className="q-text">{inst}</p>
			<div className="order-row">
				{q.shown.map((it, i) => {
					const placed = q.order.indexOf(it.k);
					const done = placed < idx;
					return (
						<button
							key={`${it.k}-${it._i}`}
							type="button"
							className={`order-item${done ? " done" : ""}`}
							onClick={(e) => onCell(it, e.currentTarget)}
						>
							{it.kind === "obj" && it.it ? (
								<span className="pic" style={{ width: it.w, height: it.w }} dangerouslySetInnerHTML={{ __html: svgOf(it.it) }} />
							) : (
								it.d
							)}
						</button>
					);
				})}
			</div>
		</div>
	);
}

function PatStage({
	q,
	optState,
	onAnswer,
}: {
	q: Extract<Question, { type: "pat" }>;
	optState: (value: string) => OptState;
	onAnswer: (value: string, el: HTMLButtonElement) => void;
}) {
	return (
		<div className="qa">
			<p className="q-text">
				Lanjutkan <b>polanya</b>!
			</p>
			<div className="pat-row">
				{q.seq.map((s, i) => (
					<span key={i} className="pat-chip" dangerouslySetInnerHTML={{ __html: svgOf(s) }} />
				))}
				<span className="pat-chip q" dangerouslySetInnerHTML={{ __html: ICON_MISS }} />
			</div>
			<div className="pat-opts">
				{q.opts.map((s) => {
					const st = optState(s.id);
					return (
						<button
							key={s.id}
							type="button"
							className={`pat-opt${st === "right" ? " right" : st === "wrong" ? " wrong" : ""}`}
							disabled={st === "disabled" || st === "wrong"}
							onClick={(e) => onAnswer(s.id, e.currentTarget)}
							aria-label={s.name}
							dangerouslySetInnerHTML={{ __html: svgOf(s) }}
						/>
					);
				})}
			</div>
		</div>
	);
}

function MissStage({
	q,
	optState,
	onAnswer,
}: {
	q: Extract<Question, { type: "miss" }>;
	optState: (value: string) => OptState;
	onAnswer: (value: string, el: HTMLButtonElement) => void;
}) {
	const [hidden, setHidden] = useState(false);
	useEffect(() => {
		const t = window.setTimeout(() => setHidden(true), 1500);
		return () => window.clearTimeout(t);
	}, []);
	return (
		<div className="qa">
			<p className="q-text">
				Yang mana yang <b>hilang</b>?
			</p>
			<div className="miss-row">
				{q.items.map((it) => (
					<span
						key={it.id}
						className={`miss-item${hidden && it.id === q.hidden ? " hidden" : ""}`}
						dangerouslySetInnerHTML={{ __html: svgOf(it) }}
					/>
				))}
			</div>
			<div className="opts">
				{q.items.map((it) => {
					const st = optState(it.id);
					return (
						<button
							key={it.id}
							type="button"
							className={`opt${st === "right" ? " right" : st === "wrong" ? " wrong" : ""}`}
							disabled={st === "disabled" || st === "wrong"}
							onClick={(e) => onAnswer(it.id, e.currentTarget)}
						>
							<span className="pic" dangerouslySetInnerHTML={{ __html: svgOf(it) }} />
							<span className="opt-name">{it.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}

function OptionButton({
	item,
	color,
	hideName,
	state,
	onAnswer,
}: {
	item: Item;
	color?: string;
	hideName: boolean;
	state: OptState;
	onAnswer: (value: string, el: HTMLButtonElement) => void;
}) {
	const disabled = state === "disabled" || state === "wrong";
	const cls = `opt${state === "right" ? " right" : state === "wrong" ? " wrong" : ""}`;
	return (
		<button
			type="button"
			className={cls}
			disabled={disabled}
			onClick={(e) => onAnswer(item.id, e.currentTarget)}
		>
			{item.hex ? (
				<>
					<span className="color-block" style={{ background: item.hex }} />
					{!hideName && <span className="opt-name">{item.name}</span>}
				</>
			) : (
				<>
					<span className="pic" dangerouslySetInnerHTML={{ __html: svgMarkup(item, color) }} />
					{!hideName && <span className="opt-name">{item.name}</span>}
				</>
			)}
		</button>
	);
}

function GroupButton({
	label,
	group,
	state,
	onAnswer,
}: {
	label: string;
	group: CountGroup;
	state: OptState;
	onAnswer: (el: HTMLButtonElement) => void;
}) {
	const cls = `opt grp${state === "right" ? " right" : state === "wrong" ? " wrong" : ""}`;
	return (
		<button type="button" className={cls} disabled={state !== "idle"} onClick={(e) => onAnswer(e.currentTarget)}>
			<span className="grp-badge">{label}</span>
			<span className="grp-items">
				{Array.from({ length: group.n }, (_, i) => (
					<Pic key={i} item={group.item} />
				))}
			</span>
		</button>
	);
}

function Celebrate({
	score,
	result,
	achNews,
	onRestart,
	onBack,
}: {
	score: number;
	result: Result;
	achNews: Ach[];
	onRestart: () => void;
	onBack: () => void;
}) {
	const msg =
		score >= 7 ? "Luar biasa!" : score >= 5 ? "Hebat sekali!" : score >= 3 ? "Bagus!" : "Ayo coba lagi!";
	return (
		<div className="stage stage-end">
			<div className="end-card">
				<div className="end-stars">
					{Array.from({ length: NQ }, (_, i) => (
						<span
							key={i}
							className={`star${i < score ? " on" : ""}`}
							style={{ animationDelay: `${i * 50}ms` }}
						>
							<IconStar />
						</span>
					))}
				</div>
				<h2>{msg}</h2>
				<p>
					Kamu mendapat <b>{score}</b> bintang dari {NQ}.
				</p>
				{result.leveled && <div className="level-up">Naik ke Level {result.newLevel}!</div>}
				{achNews.length > 0 && (
					<div className="ach-new">
						<IconTrophy />
						Penghargaan baru: <b>{achNews.map((a) => a.name).join(", ")}</b>
					</div>
				)}
				<div className="end-actions">
					<button type="button" className="btn btn-primary" onClick={onRestart}>
						Main Lagi
					</button>
					<button type="button" className="btn btn-ghost" onClick={onBack}>
						Game Lain
					</button>
				</div>
			</div>
		</div>
	);
}

function Confetti() {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (reducedMotion()) return;
		const el = ref.current;
		if (!el) return;
		const cols = ["#F59E0B", "#10B981", "#F87171", "#3B82F6", "#8B5CF6", "#EC4899", "#FACC15"];
		for (let i = 0; i < 30; i++) {
			const piece = document.createElement("span");
			piece.style.cssText =
				`left:${Math.random() * 100}%;width:${6 + Math.random() * 6}px;` +
				`height:${10 + Math.random() * 8}px;background:${cols[i % cols.length]};`;
			el.appendChild(piece);
			animate(
				piece,
				[
					{ transform: "translateY(-8vh) rotate(0deg)", opacity: 1 },
					{ transform: `translateY(108vh) rotate(${360 + Math.random() * 360}deg)`, opacity: 0.7 },
				],
				{
					duration: 1600 + Math.random() * 1200,
					delay: Math.random() * 300,
					easing: "cubic-bezier(.25,.46,.45,.94)",
				},
			);
		}
	}, []);
	return <div className="confetti" ref={ref} />;
}
