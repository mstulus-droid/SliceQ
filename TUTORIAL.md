# SliceQ Tutorial

Panduan singkat ini dibuat supaya workflow penting project tidak hilang saat kamu lupa langkah-langkahnya.

## 1. Menjalankan aplikasi

Buka terminal di folder project:

```powershell
cd "D:\Rhadz\Apps\Rhadzor ID\SliceQ"
npm run dev
```

Lalu buka di browser:

```text
http://localhost:3000
```

Kalau `localhost` gagal, coba:

```text
http://127.0.0.1:3000
```

## 2. Struktur data yang dipakai

Project ini memakai:

- file Excel sebagai sumber edit utama
- Supabase PostgreSQL sebagai database aplikasi
- Next.js sebagai web app yang dibuka dari laptop atau HP

Alurnya:

```text
Edit Excel -> Sinkronisasi -> Data masuk ke Supabase -> App menampilkan data terbaru
```

## 3. Lokasi file penting

- Excel utama: `surat quran.xlsx`
- Env lokal: `.env.local`
- Schema database: `db/schema.sql`
- Script import CLI: `scripts/import-excel.ts`
- Halaman sinkronisasi: `/sinkronisasi`

## 4. Isi file .env.local

File `.env.local` ada di root project.

Contoh isi:

```env
DATABASE_URL=postgresql://postgres:PASSWORD_YANG_SUDAH_DI_ENCODE@db.fmflkphtyowkayssrvrf.supabase.co:5432/postgres
EXCEL_PATH=./surat quran.xlsx
```

Catatan:

- kalau password mengandung karakter spesial, harus di-encode
- contoh encoding:
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

## 5. Cara edit konten

Kalau kamu ingin update isi aplikasi:

1. Buka dan edit file `surat quran.xlsx`
2. Simpan perubahan
3. Tutup file Excel jika masih terbuka di Microsoft Excel
4. Buka halaman:

```text
http://localhost:3000/sinkronisasi
```

5. Klik tombol `Sinkronkan dari Excel`
6. Tunggu pesan sukses

Setelah itu data di aplikasi akan ikut terbaru.

## 6. Cara sync lewat terminal

Kalau ingin lewat terminal, pakai:

```powershell
npm run import-excel
```

Kalau hanya ingin cek tanpa mengubah database:

```powershell
npm run import-excel -- --dry-run
```

## 7. Inisialisasi database dari awal

Kalau perlu menerapkan schema database lagi:

```powershell
npm run db:schema
```

Biasanya ini dipakai saat setup awal atau setelah membuat database baru.

## 8. Halaman penting di aplikasi

- Beranda: `http://localhost:3000`
- Daftar surat: `http://localhost:3000/surat`
- Detail surat contoh: `http://localhost:3000/surat/1`
- Pencarian: `http://localhost:3000/cari`
- Sinkronisasi Excel: `http://localhost:3000/sinkronisasi`

## 9. Kalau sinkronisasi gagal

Beberapa penyebab yang paling umum:

- file Excel masih terbuka dan terkunci
- isi `.env.local` salah
- `DATABASE_URL` belum benar
- password Supabase belum di-encode dengan benar

Yang perlu dicek:

1. Tutup file Excel
2. Pastikan `.env.local` ada di root project
3. Pastikan `DATABASE_URL` diawali dengan `postgresql://`
4. Pastikan karakter spesial di password sudah di-encode
5. Jalankan:

```powershell
npm run import-excel -- --dry-run
```

Kalau masih error, lihat pesan error di terminal.

## 10. Verifikasi cepat setelah sync

Setelah sinkronisasi berhasil, cek:

- beranda menampilkan statistik data
- halaman `/surat` menampilkan daftar surat
- halaman `/surat/1` menampilkan ayat Al-Fatihah
- halaman `/cari?q=pembalasan` menampilkan hasil pencarian

## 11. Catatan penting

- file `~$surat quran.xlsx` adalah file lock sementara dari Excel, itu normal
- jangan edit database langsung kalau workflow utamanya mau tetap rapi
- edit utama sebaiknya tetap dilakukan di file Excel, lalu disinkronkan

## 12. Command paling penting

Menjalankan aplikasi:

```powershell
npm run dev
```

Menerapkan schema database:

```powershell
npm run db:schema
```

Sync Excel ke database:

```powershell
npm run import-excel
```

Cek import tanpa mengubah database:

```powershell
npm run import-excel -- --dry-run
```
