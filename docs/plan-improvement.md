# Plan Improvement — Pica Games (school-oppia)

Status: **PLANNED** — 2026-08-29
Repo: `~/project/school-oppia` (npm, React Router 7 + Tailwind v4, CF Worker + D1 `pica_db`). Live: `https://pica.oppia.world`.
Dibuat berdasar telisik struktur project saat ini (belum ada implementasi).

## 1. Google Auth (login) — cross-device progress
- OAuth client project `oppia-world` utk `pica.oppia.world` (reuse pola Moozhaf `quran-hadis/workers/api/odoj.ts` + `workers/lib/session.ts`).
- Tambah Hono app di worker Pica (saat ini `workers/app.ts` murni SSR pass-through):
  - `GET /api/auth/google` → redirect Google (state CSRF + returnTo).
  - `GET /api/auth/google/callback` → tukar code → userinfo (`sub`, email) → session cookie → upsert user.
  - `GET /api/auth/me` → sesi saat ini.
  - `POST /api/auth/logout`.
- Migration baru: tabel `users` (id = Google sub) — catatan: migration `0001_pica_state.sql` saat ini TIDAK punya tabel users.
- Skenario hybrid (dari plan pica-progress-sync.md): game dasar bebas tanpa login (progress localStorage); sync cross-device + laporan ortu butuh login Google.
- Frontend: tombol login Google di `Hub` / `ParentScreen`; sesi cookie HttpOnly.
- Login → progress di-up-sync ke `pica-db` (tabel `pica_state` sudah ada).

## 2. Endpoint /api/progress + merge sync (dari plan pica-progress-sync.md)
- `GET /api/progress` → baca `pica_state` utk user login.
- `PUT /api/progress` → tulis `pica_state` (overwrite by updated_at, MVP simpel).
- Client: saat login/load, tarik state dari D1; saat selesai main/ubah progress, upload seluruh `pica.g.*` state lokal → D1. Tanpa merge per-field rumit (server simpan versi terbaru by updated_at).
- `pica_events` (opsional): catat skor/aktivitas utk laporan ortu.

---

## Blockers / catatan
- Set secrets via `wrangler secret put`: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `SESSION_SECRET`.
- Migration users belum ada di Pica (buat `0002_users.sql`).
- Jangan commit secret.
- Perencanaan lebih detail + status progres di-update saat mulai implement.

## Status progress
- [x] Telisik struktur project (routes, workers, root/theme, Hub/PicaGames, migration, DB)
- [ ] Tabap A: backend auth Google Hono (/api/auth/*) + migration users
- [ ] Tabap B: UI login Google + sesi di PicaGames (hybrid)
- [ ] Tabap C: endpoint /api/progress (GET/PUT, overwrite by updated_at)
- [ ] Build/test/deploy ke pica.oppia.world
