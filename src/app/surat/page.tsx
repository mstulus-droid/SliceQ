import Link from "next/link";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import { getSurahs } from "@/lib/quran-data";

export const metadata = {
  title: "Daftar Surat | SliceQ",
};

export default async function SurahIndexPage() {
  let surahs;

  try {
    surahs = await getSurahs();
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#eef6ef,transparent_24%),linear-gradient(180deg,#f8f3e8_0%,#f4efe7_100%)] px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                Surat
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Daftar Surat Al-Quran
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Jelajahi seluruh surat dengan tampilan yang lebih ringan untuk mobile dan cepat untuk dipindai.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Kembali ke beranda
            </Link>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white">
            <div className="hidden grid-cols-[88px_1.2fr_0.9fr_120px_120px] gap-4 bg-slate-950 px-5 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 md:grid">
              <span>Nomor</span>
              <span>Nama Surat</span>
              <span>Nama Arab</span>
              <span>Tempat</span>
              <span>Ayat</span>
            </div>

            <div className="divide-y divide-slate-200">
              {surahs.map((surah) => (
                <Link
                  key={surah.id}
                  href={`/surat/${surah.id}`}
                  className="group block bg-white px-4 py-4 transition hover:bg-slate-50 sm:px-5"
                >
                  <div className="flex flex-col gap-4 md:grid md:grid-cols-[88px_1.2fr_0.9fr_120px_120px] md:items-center md:gap-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-800 ring-1 ring-emerald-100">
                        {surah.id}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 md:hidden">
                        {surah.revelationPlace}
                      </span>
                    </div>

                    <div>
                      <p className="text-lg font-semibold text-slate-950">
                        {surah.nameLatin}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {surah.meaning}
                      </p>
                    </div>

                    <div className="text-right md:text-left">
                      <p className="text-[1.8rem] text-slate-950 sm:text-2xl">{surah.nameArabic}</p>
                    </div>

                    <div className="hidden md:block">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {surah.revelationPlace}
                      </span>
                    </div>

                    <div className="flex items-center justify-between md:block">
                      <span className="text-sm text-slate-500">
                        {surah.verseCount} ayat
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
