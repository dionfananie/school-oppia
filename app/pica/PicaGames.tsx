import { useEffect, useState } from "react";
import { audioState, sfx, speak, stopSpeak } from "./audio";
import { GAMES, unlocked } from "./data";
import { GameScreen } from "./GameScreen";
import { Hub } from "./Hub";
import { ParentScreen } from "./ParentScreen";
import { load, save } from "./storage";
import type { GameDef } from "./types";
import "./pica.css";

type Screen = { name: "hub" } | { name: "parent" } | { name: "game"; game: GameDef };

export function PicaGames() {
	const [muted, setMuted] = useState(false);
	const [screen, setScreen] = useState<Screen>({ name: "hub" });
	const [round, setRound] = useState(0);

	// Read the saved mute preference only after hydration, so the server-rendered
	// markup matches the first client render. Mutations happen in toggleMute.
	useEffect(() => {
		const saved = load("muted", false);
		audioState.muted = saved;
		setMuted(saved);
	}, []);

	function toggleMute() {
		const next = !muted;
		if (next) stopSpeak();
		audioState.muted = next;
		setMuted(next);
		save("muted", next);
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
			<div className="app">
				{screen.name === "hub" ? (
					<Hub
						onOpenGame={openGame}
						onOpenParent={() => setScreen({ name: "parent" })}
						muted={muted}
						onToggleMute={toggleMute}
					/>
				) : screen.name === "parent" ? (
					<ParentScreen muted={muted} onToggleMute={toggleMute} onBack={backToHub} />
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
