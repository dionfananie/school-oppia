import { useEffect, useRef, useState } from "react";
import { audioState, sfx, speak, stopSpeak } from "./audio";
import { GAMES, totalStars, unlocked } from "./data";
import { GameScreen } from "./GameScreen";
import { Hub } from "./Hub";
import { ParentScreen } from "./ParentScreen";
import { load, save } from "./storage";
import {
	logout,
	pullProgress,
	pushProgress,
	useAuth,
	notifyAuthChange,
	googleLoginUrl,
	type AuthUser,
} from "./auth";
import type { GameDef } from "./types";
import { IconLock, IconStar } from "./icons";
import "./pica.css";

type Screen = { name: "hub" } | { name: "parent" } | { name: "game"; game: GameDef };

export function PicaGames() {
	const [muted, setMuted] = useState(false);
	const [screen, setScreen] = useState<Screen>({ name: "hub" });
	const [round, setRound] = useState(0);
	const [lockInfo, setLockInfo] = useState<GameDef | null>(null);
	const { user, loading: authLoading } = useAuth();
	const syncedInitialRef = useRef(false);

	// Read the saved mute preference only after hydration, so the server-rendered
	// markup matches the first client render. Mutations happen in toggleMute.
	useEffect(() => {
		const saved = load("muted", false);
		audioState.muted = saved;
		setMuted(saved);
	}, []);

	// First sync when logged in: push local up, then pull server down & restore.
	// This keeps cross-device progress roughly in sync (last-write-wins by upload time).
	useEffect(() => {
		if (authLoading || !user || syncedInitialRef.current) return;
		syncedInitialRef.current = true;
		async function initialSync() {
			if (user) {
				await pushProgress();
				await pullProgress();
			}
		}
		void initialSync();
	}, [authLoading, user]);

	// Upload progress whenever the player returns to the hub (after finishing a game)
	// while signed in.
	useEffect(() => {
		if (!user || screen.name !== "hub") return;
		void pushProgress();
	}, [user, screen]);

	function toggleMute() {
		const next = !muted;
		if (next) stopSpeak();
		audioState.muted = next;
		setMuted(next);
		save("muted", next);
	}

	async function handleLogout() {
		await logout();
		syncedInitialRef.current = false;
		notifyAuthChange();
	}

	function openGame(id: string) {
		const game = GAMES.find((g) => g.id === id);
		if (!game) return;
		stopSpeak();
		if (!unlocked(id)) {
			sfx.bad();
			speak("Kumpulkan bintang dulu ya!");
			setLockInfo(game);
			return;
		}
		setScreen({ name: "game", game });
		setRound((r) => r + 1);
	}

	function backToHub() {
		stopSpeak();
		setScreen({ name: "hub" });
	}

	// Re-keying the screen forces a fresh round (new questions, score reset).
	function restart() {
		setRound((r) => r + 1);
	}

	return (
		<div className="pica">
			<div className={`app${screen.name === "game" ? " app-game" : ""}`}>
				{screen.name === "hub" ? (
					<Hub
						onOpenGame={openGame}
						onOpenParent={() => setScreen({ name: "parent" })}
						user={user}
						onLogout={() => void handleLogout()}
						muted={muted}
						onToggleMute={toggleMute}
					/>
				) : screen.name === "parent" ? (
					<ParentScreen
						user={user}
						onLogout={() => void handleLogout()}
						muted={muted}
						onToggleMute={toggleMute}
						onBack={backToHub}
					/>
				) : (
					<GameScreen
						key={`${screen.game.id}-${round}`}
						game={screen.game}
						muted={muted}
						onToggleMute={toggleMute}
						onBack={backToHub}
						onRestart={restart}
					/>
				)}
			</div>

			{lockInfo && (
				<LockPopup
					game={lockInfo}
					stars={totalStars()}
					user={user}
					onClose={() => setLockInfo(null)}
				/>
			)}
		</div>
	);
}

/** Popup saat anak mencoba game yang masih terkunci bintang. */
function LockPopup({
	game,
	stars,
	user,
	onClose,
}: {
	game: GameDef;
	stars: number;
	user: AuthUser | null;
	onClose: () => void;
}) {
	const need = game.u ?? 0;
	const left = Math.max(0, need - stars);
	const done = Math.min(1, need === 0 ? 1 : stars / need);

	return (
		<div
			className="lock-pop-backdrop"
			role="dialog"
			aria-modal="true"
			aria-label={`${game.name} masih terkunci`}
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="lock-pop">
				<div className="lock-pop-head">
					<span className="lock-pop-ic">
						<IconLock />
					</span>
					<h2>{game.name} masih terkunci</h2>
				</div>

				<p className="lock-pop-text">
					Kumpulkan <b>{need} bintang</b> dulu untuk membukanya.
				</p>

				<div className="lock-stars" aria-hidden>
					<span className="lock-stars-bar">
						<span className="lock-stars-fill" style={{ width: `${done * 100}%` }} />
					</span>
					<span className="lock-stars-txt">
						<IconStar />
						{stars} / {need} bintang
						{left > 0 ? ` · kurang ${left}` : ""}
					</span>
				</div>

				{!user ? (
					<a href={googleLoginUrl("/")} className="btn btn-primary lock-login">
						Login supaya progresmu tersimpan
					</a>
				) : (
					<p className="lock-hint">Kamu masih perlu {left} bintang lagi.</p>
				)}

				<button type="button" className="btn btn-ghost lock-close" onClick={onClose}>
					Tutup
				</button>
			</div>
		</div>
	);
}
