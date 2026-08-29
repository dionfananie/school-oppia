// env.d.ts — Deklarasi global Env utk worker Pica (binding D1 + secrets runtime).
declare global {
	interface Env {
		pica_db: D1Database;
		// Secrets (wrangler secret put) — tidak di wrangler.json
		GOOGLE_CLIENT_ID?: string;
		GOOGLE_CLIENT_SECRET?: string;
		GOOGLE_REDIRECT_URI?: string;
	}
}

export {};
