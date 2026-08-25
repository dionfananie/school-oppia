import type { ComponentType } from "react";
import { CATS, GAMES, totalStars, unlocked } from "./data";
import { load, useHydrated } from "./storage";
import {
	IconCatHuruf,
	IconCatKreatif,
	IconCatLogic,
	IconCocok,
	IconHitung,
	IconKenali,
	IconLock,
	IconMute,
	IconSound,
	IconStar,
	IconUser,
} from "./icons";
import type { CategoryId, GameDef } from "./types";

const CAT_ICONS: Record<CategoryId, ComponentType> = {
	kenali: IconKenali,
	cocokkan: IconCocok,
	hitung: IconHitung,
	logika: IconCatLogic,
	huruf: IconCatHuruf,
	kreatif: IconCatKreatif,
};

export function Hub({
	onOpenGame,
	onOpenParent,
	muted,
	onToggleMute,
}: {
	onOpenGame: (id: string) => void;
	onOpenParent: () => void;
	muted: boolean;
	onToggleMute: () => void;
}) {
	// Progress lives in localStorage, which only exists in the browser. Until the
	// component has hydrated we render the defaults so the server markup matches.
	const hydrated = useHydrated();
	const lastId = hydrated ? load<string | null>("last", null) : null;
	const last = lastId ? GAMES.find((g) => g.id === lastId) : undefined;
	const ts = hydrated ? totalStars() : 0;
	const next = hydrated ? GAMES.filter((g) => !unlocked(g.id)).sort((a, b) => a.u! - b.u!)[0] : undefined;
	const pct = Math.min(100, Math.round((ts / 28) * 100));

	return (
		<>
			<header className="brand-row">
				<div className="brand">
					<span className="brand-dot" />
					Pica
				</div>
				<span className="tagline">Seri 2 · belajar & bermain</span>
				<button type="button" className="tbtn" onClick={onOpenParent} aria-label="Menu orang tua">
					<IconUser />
				</button>
				<button
					type="button"
					className="tbtn"
					onClick={onToggleMute}
					aria-label={muted ? "Nyalakan suara" : "Matikan suara"}
				>
					{muted ? <IconMute /> : <IconSound />}
				</button>
			</header>

			{last && <ResumeCard game={last} level={load(`lv.${last.id}`, 1)} onOpen={onOpenGame} />}

			<div className="pstrip">
				<IconStar />
				<div className="pstrip-bar">
					<div className="pstrip-fill" style={{ width: `${pct}%` }} />
				</div>
				<span className="pstrip-txt">
					{ts} bintang{next ? ` · buka ${next.name}` : " · semua terbuka!"}
				</span>
			</div>

			<p className="hub-note">
				17 permainan baru: memori, logika, huruf, mewarnai & musik. Kumpulkan bintang
				untuk membuka game berikutnya — bintang dari semua game ikut dihitung.
			</p>

			<div className="hub">
				{CATS.map((c) => {
					const Icon = CAT_ICONS[c.id];
					const games = GAMES.filter((g) => g.cat === c.id);
					return (
						<section className="cat" key={c.id}>
							<div className="cat-head">
								<span className={`cat-chip chip-${c.chip}`}>
									<Icon />
								</span>
								<span className="cat-name">{c.name}</span>
								<span className="cat-desc">{c.desc}</span>
							</div>
							<div className="grid">
								{games.map((g) => (
									<GameCard
										key={g.id}
										game={g}
										chip={c.chip}
										level={hydrated ? load(`lv.${g.id}`, 1) : 1}
										stars={hydrated ? load(`st.${g.id}`, 0) : 0}
										open={hydrated ? unlocked(g.id) : true}
										onOpen={onOpenGame}
									/>
								))}
							</div>
						</section>
					);
				})}
			</div>

			<p className="foot">
				Pica — tanpa iklan, aman untuk anak 2–7 tahun. Cek laporan orang tua lewat tombol
				orang tua di atas.
			</p>
		</>
	);
}

function ResumeCard({
	game,
	level,
	onOpen,
}: {
	game: GameDef;
	level: number;
	onOpen: (id: string) => void;
}) {
	return (
		<button type="button" className="resume" onClick={() => onOpen(game.id)}>
			<span className="g-ic tile-coral" dangerouslySetInnerHTML={{ __html: game.icon }} />
			<span className="resume-txt">
				<span className="resume-l">Lanjut bermain: {game.name}</span>
				<span className="resume-s">Level {level} · mulai ronde baru</span>
			</span>
			<IconStar />
		</button>
	);
}

function GameCard({
	game,
	chip,
	level,
	stars,
	open,
	onOpen,
}: {
	game: GameDef;
	chip: string;
	level: number;
	stars: number;
	open: boolean;
	onOpen: (id: string) => void;
}) {
	if (!open) {
		return (
			<button type="button" className="gcard locked" onClick={() => onOpen(game.id)}>
				<span className={`g-ic tile-${chip}`}>
					<span className="lock-g">
						<IconLock />
					</span>
				</span>
				<span className="g-body">
					<span className="g-name">{game.name}</span>
					<span className="g-meta">Kunci · {game.u} bintang</span>
				</span>
			</button>
		);
	}
	return (
		<button type="button" className="gcard" onClick={() => onOpen(game.id)}>
			<span className={`g-ic tile-${chip}`} dangerouslySetInnerHTML={{ __html: game.icon }} />
			<span className="g-body">
				<span className="g-name">{game.name}</span>
				<span className="g-meta">
					Level {level}
					{stars > 0 && (
						<span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
							<IconStar />
							{stars}
						</span>
					)}
				</span>
			</span>
		</button>
	);
}
