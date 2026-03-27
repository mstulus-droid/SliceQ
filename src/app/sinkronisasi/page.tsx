import Link from "next/link";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import { getSyncOverview } from "@/lib/excel-sync";
import { SyncForm } from "./sync-form";

export const metadata = {
  title: "Sinkronisasi Excel | SliceQ",
};

function formatDate(value: string | null) {
  if (!value) {
    return "Tidak diketahui";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function SyncPage() {
  let overview;

  try {
    overview = await getSyncOverview();
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ef_0%,#f7f3ea_100%)] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.7)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                Sinkronisasi
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Perbarui database dari file Excel
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Alurnya sekarang sederhana: edit file Excel, lalu klik tombol sinkronisasi ini untuk mengirim perubahan ke Supabase.
              </p>
            </div>
            <Link href="/" className="text-sm font-semibold text-emerald-300">
              Kembali ke beranda
            </Link>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Sumber Data
            </p>
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.25rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Nama file</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {overview.excelFileName}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Lokasi file</p>
                <p className="mt-1 break-all text-sm leading-7 text-slate-800">
                  {overview.excelPath}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                <p className="text-sm text-slate-500">Terakhir diubah</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">
                  {formatDate(overview.excelUpdatedAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
              Database
            </p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-[1.25rem] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-sm text-slate-600">Surat aktif</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {overview.databaseSurahCount}
                </p>
              </div>
              <div className="rounded-[1.25rem] bg-emerald-50 p-4 ring-1 ring-emerald-100">
                <p className="text-sm text-slate-600">Ayat aktif</p>
                <p className="mt-2 text-2xl font-semibold text-slate-950">
                  {overview.databaseVerseCount}
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] bg-[#faf7ef] p-5 ring-1 ring-amber-100">
              <p className="text-sm leading-7 text-slate-700">
                Klik tombol di bawah setiap kali kamu selesai mengedit file Excel.
                Proses ini akan mengganti isi tabel surat, ayat, dan analisis dengan versi terbaru dari file itu.
              </p>
              <div className="mt-5">
                <SyncForm />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
