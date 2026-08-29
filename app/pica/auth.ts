// auth.ts — Client helper utk sesi Google Pica (server-side cookie).
import { useEffect, useState } from "react";

export type AuthUser = { user_id: string; email: string | null; name: string | null; avatar_url: string | null };

const REFETCH_EVENT = "pica:auth";

export async function fetchMe(): Promise<AuthUser | null> {
	try {
		const res = await fetch("/api/auth/me", { credentials: "same-origin" });
		if (!res.ok) return null;
		const data = (await res.json()) as { user?: AuthUser | null };
		return data.user ?? null;
	} catch {
		return null;
	}
}

/** Hook sesi — refresh pada mount + event auth change. */
export function useAuth(): { user: AuthUser | null; loading: boolean; refresh: () => void } {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [loading, setLoading] = useState(true);

	const refresh = async () => {
		const u = await fetchMe();
		setUser(u);
		setLoading(false);
	};

	useEffect(() => {
		void refresh();
		const onAuth = () => void refresh();
		window.addEventListener(REFETCH_EVENT, onAuth);
		return () => window.removeEventListener(REFETCH_EVENT, onAuth);
	}, []);

	return { user, loading, refresh };
}

export function notifyAuthChange(): void {
	if (typeof window === "undefined") return;
	window.dispatchEvent(new Event(REFETCH_EVENT));
}

export function googleLoginUrl(returnTo?: string): string {
	return `/api/auth/google${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;
}

export async function logout(): Promise<void> {
	try {
		await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
	} finally {
		notifyAuthChange();
	}
}

/** Tarik seluruh scope localStorage `pica.g.*` sebagai satu objek. */
export function readAllLocalState(): Record<string, unknown> {
	if (typeof window === "undefined") return {};
	const out: Record<string, unknown> = {};
	try {
		for (let i = 0; i < window.localStorage.length; i++) {
			const k = window.localStorage.key(i);
			if (!k || !k.startsWith("pica.g.") || k === "pica.g.muted") continue;
			const raw = window.localStorage.getItem(k);
			if (raw == null) continue;
			try {
				out[k.slice("pica.g.".length)] = JSON.parse(raw);
			} catch {
				out[k.slice("pica.g.".length)] = raw;
			}
		}
	} catch {
		/* ignore */
	}
	return out;
}

/** Tulis objek state ke localStorage (scope pica.g.*). Tidak menghapus key lain. */
export function restoreAllLocalState(data: Record<string, unknown>): void {
	if (typeof window === "undefined") return;
	try {
		for (const [k, v] of Object.entries(data)) {
			window.localStorage.setItem("pica.g." + k, JSON.stringify(v));
		}
	} catch {
		/* ignore */
	}
}

/** Upload seluruh state lokal ke server (perlu login). Return {ok, updatedAt}. */
export async function pushProgress(): Promise<{ ok: boolean; updatedAt?: number }> {
	try {
		const res = await fetch("/api/progress", {
			method: "PUT",
			headers: { "content-type": "application/json" },
			credentials: "same-origin",
			body: JSON.stringify({ data: readAllLocalState() }),
		});
		if (!res.ok) return { ok: false };
		const j = (await res.json()) as { ok?: boolean; updatedAt?: number };
		return { ok: j.ok !== false, updatedAt: j.updatedAt };
	} catch {
		return { ok: false };
	}
}

/** Tarik state server → restore ke localStorage. Return {ok, hadData}. */
export async function pullProgress(): Promise<{ ok: boolean; hadData: boolean; updatedAt?: number | null }> {
	try {
		const res = await fetch("/api/progress", { credentials: "same-origin" });
		if (!res.ok) return { ok: false, hadData: false };
		const j = (await res.json()) as { data?: Record<string, unknown> | null; updatedAt?: number | null };
		if (j.data && typeof j.data === "object") {
			restoreAllLocalState(j.data);
			return { ok: true, hadData: true, updatedAt: j.updatedAt };
		}
		return { ok: true, hadData: false };
	} catch {
		return { ok: false, hadData: false };
	}
}
