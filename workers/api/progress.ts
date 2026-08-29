// progress.ts — GET/PUT pica_state utk sync progress cross-device (MVP simpel).
// `data` = seluruh state `pica.g.*` sebagai satu objek. Server overwrite by updated_at (last-write-wins).
import { Hono } from "hono";
import { getSessionUser } from "../lib/session";

const json = (data: unknown, status = 200) =>
	new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

export const progressApp = new Hono<{ Bindings: Env }>().basePath("/api");

// GET /api/progress → { data, updatedAt } atau { data: {} }
progressApp.get("/progress", async (c) => {
	const db = c.env.pica_db;
	const userId = await getSessionUser(db, c.req.raw);
	if (!userId) return json({ data: null }, 200); // belum login → tak ada progress server

	const row = await db
		.prepare(`SELECT data, updated_at FROM pica_state WHERE user_id = ?`)
		.bind(userId)
		.first<{ data: string; updated_at: number }>();
	if (!row) return json({ data: null, updatedAt: null });
	let parsed: Record<string, unknown> = {};
	try {
		parsed = JSON.parse(row.data);
	} catch {
		parsed = {};
	}
	return json({ data: parsed, updatedAt: row.updated_at });
});

// PUT /api/progress → simpan seluruh state (overwrite). Wajib login.
// Body: { data: {...} }
progressApp.put("/progress", async (c) => {
	const db = c.env.pica_db;
	const userId = await getSessionUser(db, c.req.raw);
	if (!userId) return json({ error: "unauthorized — login required" }, 401);

	const rawJson = (await c.req.json<Record<string, unknown>>().catch(() => ({}))) as Record<string, unknown>;
	const data = rawJson.data as Record<string, unknown> | undefined;
	if (!data || typeof data !== "object") return json({ error: "data wajib (objek)" }, 400);

	const now = Date.now();
	const serialized = JSON.stringify(data);
	await db
		.prepare(
			`INSERT INTO pica_state (user_id, data, updated_at)
			 VALUES (?, ?, ?)
			 ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at`,
		)
		.bind(userId, serialized, now)
		.run();
	return json({ ok: true, updatedAt: now });
});
