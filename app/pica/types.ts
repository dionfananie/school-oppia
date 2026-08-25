/** A single thing a child sees: a pictogram (animal, fruit, shape…) or a colour block. */
export type Item = {
	id: string;
	/** Optional: ad-hoc colour options built at question time have no label. */
	name?: string;
	/** Solid colour (colour items) — rendered as a colour block instead of a pictogram. */
	hex?: string;
	/** Visually-similar colours used for harder "cocokkan warna" levels. */
	near?: string[];
	/** Fixed pictogram colour (e.g. shapes). */
	c?: string;
	/** Draws a pictogram for a given colour; returns full `<svg>` markup. */
	draw?: (color: string) => string;
	/** Pre-built pictogram `<svg>` markup. */
	svg?: string;
};

/** Series 2 (phase 2) game engines; series 1 is pick/pair/count/compare. */
export type GameType =
	| "pick"
	| "pair"
	| "count"
	| "compare"
	| "memory"
	| "odd"
	| "order"
	| "pat"
	| "miss"
	| "puzzle"
	| "letter"
	| "color"
	| "simon"
	| "build";

export type CategoryId =
	| "kenali"
	| "cocokkan"
	| "hitung"
	| "logika"
	| "huruf"
	| "kreatif";

export type Chip = "sun" | "mint" | "coral" | "sky" | "grape" | "pink";

export type PairSpec = { from: Item; to: Item };

export type GameDef = {
	id: string;
	cat: CategoryId;
	name: string;
	t: GameType;
	/** Sub-mode for games with several variants (order: angka/besar/kata; letter: tebak/besar-kecil/awal/dengar). */
	sub?: string | null;
	/** Series 2 games unlock once the player holds this many stars across both series. */
	u?: number;
	/** Short spoken instruction read when a round starts. */
	inst?: string;
	set?: string;
	audio?: boolean;
	similar?: boolean;
	hideName?: boolean;
	vary?: boolean;
	pairs?: PairSpec[];
	fromPool?: Item[];
	toPool?: Item[];
	/** Full `<svg>` markup shown on the hub card. */
	icon: string;
};

export type Category = {
	id: CategoryId;
	name: string;
	desc: string;
	chip: Chip;
	/** Full `<svg>` markup shown on the hub category strip. */
	icon: string;
};

export type PickOption = { item: Item; c?: string };
export type CountGroup = { item: Item; n: number };

/** A word for "Susun Kata" / "Huruf Awal"; pic is a pictogram when the word names a thing. */
export type Word = { w: string; pic?: Item | null };

export type LetterMode = "tebak" | "besar-kecil" | "awal" | "dengar";
export type LetterOption = { v: string; d: string };

/** One draggable/tappable cell in an "urutkan" row. */
export type OrderCell = {
	k: string;
	d: string;
	kind: "num" | "let" | "obj";
	it?: Item;
	w?: number;
	_i: number;
};

export type Question =
	| {
			type: "pick";
			target: Item;
			opts: PickOption[];
			audio: boolean;
			speakText?: string;
	  }
	| {
			type: "pair";
			from: Item;
			to: Item;
			opts: Item[];
			audio: boolean;
			speakText?: string;
	  }
	| { type: "count"; n: number; item: Item; opts: number[] }
	| { type: "compare"; A: CountGroup; B: CountGroup; answer: "A" | "B" }
	| {
			type: "letter";
			mode: LetterMode;
			ans: string;
			big?: string;
			word?: Word;
			opts: LetterOption[];
			audio?: boolean;
	  }
	| { type: "odd"; others: string; odd: string; cls: string; size: number }
	| { type: "order"; order: string[]; shown: OrderCell[] }
	| { type: "pat"; seq: Item[]; ans: Item; opts: Item[] }
	| { type: "miss"; items: Item[]; hidden: string };
