# Pica Games (school-oppia)

Aplikasi belajar sambil bermain untuk anak **2-7 tahun**, bagian dari ekosistem Oppia World. Tanpa iklan, antarmuka bahasa Indonesia, memakai ikon SVG flat dan suara. Live di **https://pica.oppia.world**.

## Fitur

**Puluhan game dalam 6 kategori (total 34 game):**

- **Kenali** (8) - tebak hewan, warna, buah, kendaraan
- **Cocokkan** (5) - cocokkan warna, hewan, pasangan, hewan-rumah, hewan-makanan
- **Hitung** (4) - hitung hewan/buah, pilih angka, lebih banyak
- **Logika & Memori** (8) - memory card, cari yang berbeda, urutkan angka, lanjutkan pola, mana yang hilang, puzzle 2-4 dan 6-9 potong
- **Huruf & Kata** (5) - tebak huruf, huruf besar-kecil, huruf awal, dengarkan & pilih, susun kata
- **Kreatif** (4) - mewarnai, piano, drum, shape builder

**Sistem bintang & unlock:**
- Satu ronde berisi 8 pertanyaan; skor 0-8 bintang per game disimpan di perangkat (`localStorage`).
- **Seri 1** selalu terbuka. **Seri 2** terbuka setelah anak mengumpulkan sejumlah bintang (ambang 0-28) dari seluruh game. Ada mode bebas yang membuka semua.
- 10 penghargaan (achievement) dari aktifitas belajar.
- Progress bisa disinkronkan lintas perangkat lewat login Google.

**Ramah anak & orang tua:** menu orang tua (laporan, reset progres), toggle suara, animasi, dan audio edukatif.

## Cara Kerja

Semua game dikelola lewat mesin pertanyaan di `app/pica/`. Tiap game memiliki generator soal sendiri (kenal, cocokkan, hitung, bandingkan, cari-beda, urutkan, pola, hilang, angka/huruf, mewarnai, simon, bangun) yang dirender `GameScreen`.

## Struktur Folder

```
app/pica/            Logika permainan
  data.ts            Game, kategori, kumpulan benda, penghargaan
  questions.ts       Generator soal
  Engines.tsx        Mesin untuk memory/odd/order/pat/miss/puzzle/letter/color/simon/build
  GameScreen.tsx     Layar bermain + skor
  Hub.tsx            Menu pemilihan game
  ParentScreen.tsx   Menu orang tua
  auth.ts            Login Google + sync progres
  storage.ts         Progress lokal
  audio.ts, icons.tsx
app/routes/home.tsx  Aplikasi shell (route tunggal)
workers/             Cloudflare Worker: app, api/auth, api/progress, lib
migrations/          Skema D1 (pica_db)
public/              Aset PWA (manifest, service worker)
```

## Teknologi

- React Router 7 + React 19 (SSR) + TypeScript
- Tailwind CSS v4
- Cloudflare Workers + D1 database (`pica-db`) + Google OAuth
- PWA: dapat diinstal & dibuka offline

## Scripts

| Perintah            | Deskripsi                          |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Jalankan dev server dengan HMR     |
| `npm run build`     | Build produksi                     |
| `npm run typecheck` | Typegen + `tsc -b`                 |
| `npm run check`     | Typecheck + build + wrangler dry-run |
| `npm run deploy`    | Deploy ke Cloudflare Workers       |

## Deployment

Push ke cabang `master` memicu auto-deploy ke https://pica.oppia.world. Bagian dari keluarga produk Oppia World di bawah oppia.world.

---

© Oppia World. All Rights Reserved.
