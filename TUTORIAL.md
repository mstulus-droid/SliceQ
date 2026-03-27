# SliceQ Tutorial

Panduan ini dirapikan supaya cocok dengan workflow SliceQ yang sekarang:

- aplikasi online berjalan di Vercel
- domain publik ada di `https://sliceq.rhadzor.id`
- database utama ada di Supabase
- file Excel tetap diedit dari PC lokal
- update data dilakukan lewat command terminal, bukan lewat upload file ke server

## 1. Gambaran workflow

Alur kerjanya sekarang:

```text
Edit Excel di PC -> Jalankan import dari terminal -> Data masuk ke Supabase -> Website online otomatis baca data terbaru
```

Artinya:

- file Excel tetap disimpan dan diedit di komputermu
- website online tidak perlu menyimpan file Excel
- yang penting adalah command sinkronisasi dari PC berhasil

## 2. Lokasi penting

- Project folder: `D:\Rhadz\Apps\Rhadzor ID\SliceQ`
- Excel utama: `surat quran.xlsx`
- Env lokal: `.env.local`
- Contoh env: `.env.example`
- Schema database: `db/schema.sql`
- Script apply schema: `scripts/apply-schema.ts`
- Script import Excel: `scripts/import-excel.ts`

## 3. URL penting

Lokal:

- Beranda: `http://localhost:3000`
- Daftar surat: `http://localhost:3000/surat`
- Pencarian: `http://localhost:3000/cari`
- Bookmark: `http://localhost:3000/bookmark`

Online:

- Website utama: `https://sliceq.rhadzor.id`

## 4. Menjalankan aplikasi lokal

Buka PowerShell:

```powershell
cd "D:\Rhadz\Apps\Rhadzor ID\SliceQ"
npm run dev
```

Buka browser:

```text
http://localhost:3000
```

Kalau `localhost` gagal, coba:

```text
http://127.0.0.1:3000
```

## 5. Isi file .env.local

File `.env.local` ada di root project.

Contoh minimal:

```env
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD_YANG_SUDAH_DI_ENCODE@aws-1-ap-northeast-2.pooler.supabase.com:5432/postgres
EXCEL_PATH=./surat quran.xlsx
```

Catatan penting:

- gunakan connection string `pooler` dari Supabase
- jangan pakai direct host `db....supabase.co:5432` kalau koneksi lokal bermasalah
- password harus di-encode kalau mengandung karakter spesial

Contoh encoding karakter:

- `@` jadi `%40`
- `#` jadi `%23`
- `$` jadi `%24`
- `!` jadi `%21`
- `/` jadi `%2F`
- `:` jadi `%3A`

Contoh:

```text
password asli: abc!12$34#xy@z
password di URL: abc%2112%2434%23xy%40z
```

## 6. Cara update data dari Excel

Ini workflow utama yang disarankan.

1. Buka dan edit `surat quran.xlsx`
2. Simpan perubahan
3. Tutup file Excel kalau masih terbuka di Microsoft Excel
4. Jalankan:

```powershell
cd "D:\Rhadz\Apps\Rhadzor ID\SliceQ"
npm run import-excel
```

Kalau berhasil, data terbaru langsung masuk ke Supabase dan website online akan ikut menampilkan update terbaru.

## 7. Cek import tanpa mengubah database

Kalau hanya ingin validasi isi file Excel lebih dulu:

```powershell
cd "D:\Rhadz\Apps\Rhadzor ID\SliceQ"
npm run import-excel -- --dry-run
```

Ini berguna untuk memastikan parsing file aman sebelum benar-benar menulis ke database.

## 8. Inisialisasi schema database

Kalau perlu menerapkan schema database lagi:

```powershell
cd "D:\Rhadz\Apps\Rhadzor ID\SliceQ"
npm run db:schema
```

Biasanya ini dipakai saat:

- setup awal project
- database baru dibuat
- tabel perlu diterapkan ulang

## 9. Cara verifikasi setelah sync

Setelah `npm run import-excel` berhasil, cek:

- `https://sliceq.rhadzor.id`
- `https://sliceq.rhadzor.id/surat`
- `https://sliceq.rhadzor.id/surat/1`
- `https://sliceq.rhadzor.id/cari?q=pembalasan`

Yang diharapkan:

- statistik di homepage tampil
- daftar surat muncul
- detail surat tampil normal
- hasil pencarian sesuai keyword muncul

## 10. Kalau sync gagal

Penyebab paling umum:

- file Excel masih terbuka dan terkunci
- isi `.env.local` salah
- `DATABASE_URL` belum benar
- password Supabase belum di-encode dengan benar
- koneksi internet ke Supabase sedang bermasalah

Yang perlu dicek:

1. Tutup file Excel
2. Pastikan `.env.local` ada di root project
3. Pastikan `DATABASE_URL` diawali dengan `postgresql://`
4. Pastikan yang dipakai adalah `pooler connection string`
5. Pastikan karakter spesial di password sudah di-encode
6. Jalankan:

```powershell
npm run import-excel -- --dry-run
```

Kalau masih gagal, baca pesan error di terminal.

## 11. Tentang halaman /sinkronisasi

Halaman `/sinkronisasi` sekarang lebih cocok dianggap sebagai halaman informasi alur data, bukan jalur utama update production.

Untuk workflow production yang paling aman:

- edit Excel di PC
- jalankan `npm run import-excel` dari terminal

Jangan mengandalkan server online untuk membaca file Excel lokal dari komputermu.

## 12. Tentang deploy

Stack yang aktif sekarang:

- source code: GitHub
- hosting app: Vercel
- domain: Cloudflare
- database: Supabase

Kalau ada perubahan code UI/UX:

```powershell
git add .
git commit -m "Pesan commit"
git push
```

Setelah `git push`, Vercel akan deploy otomatis.

## 13. Command paling penting

Menjalankan aplikasi lokal:

```powershell
npm run dev
```

Apply schema database:

```powershell
npm run db:schema
```

Import Excel ke database:

```powershell
npm run import-excel
```

Dry run import:

```powershell
npm run import-excel -- --dry-run
```

Push perubahan code ke website online:

```powershell
git add .
git commit -m "Update aplikasi"
git push
```
