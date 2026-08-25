/**
 * Sound is synthesised with Web Audio (no assets) and speech with SpeechSynthesis.
 * `audioState.muted` is the single source of truth, synced from React state.
 */

export const audioState = { muted: false };

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
	if (typeof window === "undefined") return null;
	if (!ctx) {
		const AC =
			window.AudioContext ??
			(window as unknown as { webkitAudioContext?: typeof AudioContext })
				.webkitAudioContext;
		if (!AC) return null;
		try {
			ctx = new AC();
		} catch {
			return null;
		}
	}
	if (ctx.state === "suspended") void ctx.resume();
	return ctx;
}

function tone(
	freq: number,
	dur: number,
	type: OscillatorType,
	vol: number,
	delay = 0,
): void {
	if (audioState.muted) return;
	const a = getCtx();
	if (!a) return;
	const osc = a.createOscillator();
	const gain = a.createGain();
	osc.type = type;
	osc.frequency.value = freq;
	const start = a.currentTime + delay;
	gain.gain.setValueAtTime(0.0001, start);
	gain.gain.exponentialRampToValueAtTime(vol, start + 0.012);
	gain.gain.exponentialRampToValueAtTime(0.0001, start + dur);
	osc.connect(gain);
	gain.connect(a.destination);
	osc.start(start);
	osc.stop(start + dur + 0.05);
}

/** Short filtered-noise burst (percussion). */
function noiseBurst(dur: number, vol: number, hp: number): void {
	if (audioState.muted) return;
	const a = getCtx();
	if (!a) return;
	const len = Math.floor(a.sampleRate * 0.3);
	const buf = a.createBuffer(1, len, a.sampleRate);
	const d = buf.getChannelData(0);
	for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
	const src = a.createBufferSource();
	src.buffer = buf;
	const g = a.createGain();
	const s = a.currentTime;
	g.gain.setValueAtTime(vol, s);
	g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
	if (hp) {
		const f = a.createBiquadFilter();
		f.type = "highpass";
		f.frequency.value = hp;
		src.connect(f);
		f.connect(g);
	} else {
		src.connect(g);
	}
	g.connect(a.destination);
	src.start(s);
}

export const sfx = {
	tap: () => tone(720, 0.07, "triangle", 0.09),
	tick: () => tone(620, 0.06, "sine", 0.1),
	ok: () => {
		tone(523, 0.12, "triangle", 0.12);
		tone(659, 0.12, "triangle", 0.12, 0.09);
		tone(784, 0.18, "triangle", 0.12, 0.18);
	},
	bad: () => {
		tone(240, 0.16, "sawtooth", 0.07);
		tone(190, 0.2, "sawtooth", 0.07, 0.1);
	},
	win: () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, "triangle", 0.12, i * 0.12)),
	pop: () => tone(500, 0.05, "sine", 0.07),
	/** Piano note: a sustained triangle tone. */
	note: (f: number) => tone(f, 0.85, "triangle", 0.12),
	/** Drum pad names from the pictogram dictionary (dum/tak/sss/deng/tir/pak). */
	drum: (nm: string) => {
		if (nm === "dum") {
			tone(150, 0.25, "sine", 0.22);
			tone(55, 0.3, "sine", 0.2, 0.02);
		} else if (nm === "tak") {
			noiseBurst(0.12, 0.22, 1200);
			tone(200, 0.08, "square", 0.06);
		} else if (nm === "sss") {
			noiseBurst(0.06, 0.16, 5000);
		} else if (nm === "deng") {
			tone(130, 0.22, "sine", 0.2);
		} else if (nm === "tir") {
			noiseBurst(0.14, 0.16, 2000);
			tone(640, 0.1, "square", 0.04);
		} else {
			noiseBurst(0.08, 0.2, 1000);
			noiseBurst(0.08, 0.16, 1000);
			tone(520, 0.1, "triangle", 0.08);
		}
	},
};

export function speak(text: string | undefined): void {
	if (audioState.muted || !text) return;
	try {
		if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
		const u = new SpeechSynthesisUtterance(text);
		u.lang = "id-ID";
		u.rate = 0.85;
		window.speechSynthesis.cancel();
		window.speechSynthesis.speak(u);
	} catch {
		// speech unsupported — silent
	}
}

export function stopSpeak(): void {
	try {
		if (typeof window !== "undefined") window.speechSynthesis.cancel();
	} catch {
		// ignore
	}
}
