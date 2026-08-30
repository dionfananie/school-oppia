import { useEffect, useRef, useState } from "react";
import { audioState, sfx, speak, stopSpeak } from "./audio";
import { GAMES, unlocked } from "./data";
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
} from "./auth";
import type { GameDef } from "./types";
import "./pica.css";

type Screen = { name: "hub" } | { name: "parent" } | { name: "game"; game: GameDef };

export function PicaGames() {
	const [muted, setMuted] = useState(false);
	const [screen, setScreen] = useState<Screen>({ name: "hub" });
	const [round, setRound] = useState(0);
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
		</div>
	);
}
