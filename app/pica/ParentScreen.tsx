import { useState } from "react";
import { sfx } from "./audio";
import { ACH, CATS, GAMES, plOf, stOf, totalStars } from "./data";
import { IconBack, IconMute, IconSound, IconStar, IconTrophy } from "./icons";
import { load, save } from "./storage";

export function ParentScreen({
	muted,
	onToggleMute,
	onBack,
}: {
	muted: boolean;
	onToggleMute: () => void;
	onBack: () => void;
}) {
	const [free, setFree] = useState(() => load("free", false));
	const [resetStep, setResetStep] = useState(false);

	const ts = totalStars();
	const played = GAMES.filter((g) => plOf(g.id) > 0).length;
	const done = GAMES.filter((g) => stOf(g.id) > 0).length;
	const achGot = ACH.filter((a) => load(`ach.${a.id}`, false)).length;

	const favs = GAMES.map((g) => ({ name: g.name, s: stOf(g.id) }))
		.filter((x) => x.s > 0)
		.sort((a, b) => b.s - a.s)
		.slice(0, 3);

	function toggleFree() {
		const v = !free;
		sfx.tap();
		setFree(v);
		save("free", v);
	}

	function onReset() {
		if (!resetStep) {
			sfx.tap();
			setResetStep(true);
			window.setTimeout(() => setResetStep(false), 2600);
			return;
		}
		try {
			Object.keys(window.localStorage).forEach((k) => {
				if (k.indexOf("pica.g.") === 0 && k !== "pica.g.muted") {
					window.localStorage.removeItem(k);
				}
			});
		} catch {
			// storage blocked — nothing to reset
		}
		sfx.tap();
		window.location.reload();
	}

	return (
		<>
			<header className="top">
				<button type="button" className="tbtn" onClick={onBack} aria-label="Kembali">
					<IconBack />
				</button>
				<div className="top-t">
					<span className="top-name">Untuk Orang Tua</span>
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

			<div className="parent-card">
				<h2>Laporan Belajar</h2>
				<div className="pstats">
					<div className="pstat">
						<b>{ts}</b>
						<span>Total bintang</span>
					</div>
					<div className="pstat">
						<b>{played}</b>
						<span>Game dimainkan</span>
					</div>
					<div className="pstat">
						<b>{done}</b>
						<span>Game selesai</span>
					</div>
					<div className="pstat">
						<b>
							{achGot}/{ACH.length}
						</b>
						<span>Penghargaan</span>
					</div>
				</div>

				<h2 style={{ fontSize: 16 }}>Kemajuan per kategori</h2>
				{CATS.map((c) => {
					const gl = GAMES.filter((g) => g.cat === c.id);
					const cd = gl.filter((g) => stOf(g.id) > 0).length;
					const cs = gl.reduce((s, g) => s + stOf(g.id), 0);
					return (
						<div key={c.id}>
							<div className="pcat">
								<span>{c.name}</span>
								<span>
									{cd}/{gl.length} game · {cs} bintang
								</span>
							</div>
							<div className="pbar">
								<div className="pstrip-bar">
									<div className="pstrip-fill" style={{ width: `${Math.round((cd / gl.length) * 100)}%` }} />
								</div>
							</div>
						</div>
					);
				})}

				<h2 style={{ fontSize: 16 }}>Game favorit</h2>
				{favs.length ? (
					favs.map((f) => (
						<div className="fav-row" key={f.name}>
							<span className="g-ic tile-sun">
								<IconStar />
							</span>
							<span style={{ flex: 1 }}>{f.name}</span>
							<b>{f.s}</b>
						</div>
					))
				) : (
					<p className="pnote">Belum ada favorit — bintang dari game akan muncul di sini.</p>
				)}

				<h2 style={{ fontSize: 16 }}>
					Penghargaan ({achGot}/{ACH.length})
				</h2>
				<div className="ach-list">
					{ACH.map((a) => {
						const got = load(`ach.${a.id}`, false);
						return (
							<span key={a.id} className={`ach-chip${got ? " got" : ""}`}>
								<IconTrophy /> {a.name}
								{got ? "" : ` · ${a.desc}`}
							</span>
						);
					})}
				</div>

				<div className="ptools">
					<button type="button" className="btn btn-ghost" onClick={toggleFree}>
						Mode Bebas: {free ? "Nyala" : "Mati"}
					</button>
					<button type="button" className="btn btn-ghost" onClick={onReset}>
						{resetStep ? "Yakin? Tekan lagi" : "Hapus Progres"}
					</button>
				</div>

				<p className="pnote">
					Mode Bebas membuka semua game tanpa mengumpulkan bintang. "Hapus Progres"
					menghapus bintang, penghargaan & jumlah main — pengaturan suara tetap aman.
				</p>
			</div>
		</>
	);
}
