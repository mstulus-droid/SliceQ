# SliceQ — Update Pack (Prio 1–3)

Replace these files into your local `SliceQ/` repo. Path-nya identik
dengan tujuan, tinggal extract & timpa.

## File yang berubah / baru

```
src/app/globals.css                                     ← REPLACE  (utility paper, ornament, similarity, progress)
src/app/layout.tsx                                      ← REPLACE  (+ Scheherazade New, + Source Serif 4)
src/app/page.tsx                                        ← REPLACE  (badge Makkiyah/Madaniyah)
src/app/highlighted-text.tsx                            ← REPLACE  (animated underline)
src/app/actions.ts                                      ← REPLACE  (return ScoredVerseRecord[])
src/app/home-client-wrapper.tsx                         ← REPLACE  (similarity bar di hasil cari)
src/app/reading-progress.tsx                            ← NEW      (top progress bar component)
src/app/surat/[surahId]/page.tsx                        ← REPLACE  (mount ReadingProgress, font-arabic)
src/app/ayat/[verseId]/page.tsx                         ← REPLACE  (mount ReadingProgress)
src/app/ayat/[verseId]/use-reading-prefs.tsx            ← NEW      (size toggle hook + UI)
src/app/ayat/[verseId]/verse-reader-card.tsx            ← REPLACE  (reading width, font controls, ornament)
```

## Yang TIDAK disentuh
- `src/app/initial-splash.tsx` — sudah di-set ke varian Breath di sesi sebelumnya, dibiarkan apa adanya.
- Semua data layer (`src/lib/*`), DB schema, server-actions selain `actions.ts`.
- Komponen surat lain (sticky-title, jump, search, stats, topic, analysis disclosures, floating controls).

## Catatan kompatibilitas

1. **`actions.ts`** — `searchVersesAction` sekarang return `ScoredVerseRecord[]` (`= VerseRecord & { score; maxScore }`).
   Karena ini superset dari `VerseRecord`, semua pemanggil yang hanya
   membaca field VerseRecord tetap aman.
2. **Font tambahan** dimuat lewat `next/font/google` (Scheherazade New
   subset arabic, Source Serif 4 subset latin). Tidak butuh konfig
   tambahan; pertama kali run akan re-compile font cache.
3. **Reading progress bar** dipasang fixed di top, z-60, tinggi 2px.
   Kalau bentrok dengan sticky title yang sudah ada, naikkan `top` di
   sticky title sedikit (tidak diubah otomatis biar tidak break visual).
4. **Class `font-arabic` & `font-serif-reading`** didefinisikan di
   `globals.css` — bisa dipakai di komponen lain manapun.
5. **Reading size pref** disimpan di `localStorage` key
   `sliceq-reading-prefs`.

## Cara apply (Windows)

```
cd D:\Rhadz\Apps\Rhadzor ID\SliceQ
# extract zip lalu copy-paste folder src\app\ ke project, override semua
npm run dev   # restart kalau perlu, font baru akan di-fetch sekali
```

Tidak perlu install dependency baru — `next/font/google` sudah ada.
