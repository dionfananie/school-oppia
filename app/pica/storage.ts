import { useEffect, useState } from "react";

const PREFIX = "pica.g.";

/**
 * True once the component has mounted in the browser.
 * Storage is a client-only concept, so anything read from it must wait for
 * hydration — otherwise the server-rendered markup can't match.
 */
export function useHydrated(): boolean {
	const [hydrated, setHydrated] = useState(false);
	useEffect(() => setHydrated(true), []);
	return hydrated;
}

/** Read a JSON value from localStorage, falling back when missing or corrupt. */
export function load<T>(key: string, fallback: T): T {
	if (typeof window === "undefined") return fallback;
	try {
		const raw = window.localStorage.getItem(PREFIX + key);
		if (raw == null) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

/** Write a JSON value to localStorage. Never throws. */
export function save(key: string, value: unknown): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
	} catch {
		// storage full or blocked — the game still works, progress just isn't kept
	}
}

/** Remove a key from localStorage. Never throws. */
export function remove(key: string): void {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.removeItem(PREFIX + key);
	} catch {
		// ignore
	}
}
