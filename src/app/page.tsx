import Link from "next/link";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import {
  getHighlightedVerses,
  getHomeStats,
  getSurahs,
} from "@/lib/quran-data";

export default async function Home() {
  let stats;
  let surahs;
  let highlightedVerses;

  try {
    [stats, surahs, highlightedVerses] = await Promise.all([
      getHomeStats(),
      getSurahs(6),
      getHighlightedVerses(3),
    ]);
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  const statCards = [
    { label: "Total surat", value: `${stats.surahCount}`, note: "Data dari sheet Surat" },
    { label: "Total ayat", value: `${stats.verseCount}`, note: "Sudah masuk ke database" },
    {
      label: "Ayat beranotasi",
      value: `${stats.analysisCount}`,
      note: "Topik, kritik, atau analisis",
    },
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e7f7ee,transparent_30%),linear-gradient(180deg,#fcf6ea_0%,#fffdf7_45%,#f6f1e8_100%)] px-5 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/80 p-6 shadow-[0_30px_80px_-30px_rgba(27,46,30,0.35)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">
                SliceQ Live Data
              </p>
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Explorer Quran berbasis ayat dengan lapisan analisis, kritik,
                dan konteks.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                Sekarang halaman ini membaca langsung dari database Supabase yang
                berasal dari file Excel milikmu. Jadi perubahan data bisa masuk
                lewat proses sync, bukan hardcode.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[26rem]">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-emerald-100 bg-emerald-50/70 p-4"
                >
                  <p className="text-sm text-slate-600">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{stat.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/surat"
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Lihat Daftar Surat
            </Link>
            <Link
              href="/bookmark"
              className="inline-flex items-center justify-center rounded-full border border-amber-300 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              Lihat Bookmark
            </Link>
            <Link
              href="/sinkronisasi"
              className="inline-flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
            >
              Sinkronkan Excel
            </Link>
            <Link
              href="/cari"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Buka Mode Cari
            </Link>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Fondasi Data
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Struktur yang sekarang sudah aktif
                </h2>
              </div>
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                Excel -&gt; Supabase
              </span>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[
                {
                  title: "surahs",
                  body: "Master data surat: nomor, nama Arab, nama Indonesia, arti, jumlah ayat.",
                },
                {
                  title: "verses",
                  body: "Data inti ayat: surat, ayat, lafazh, terjemahan, dan tempat turunnya.",
                },
                {
                  title: "verse_analyses",
                  body: "Lapisan analisis: topik, kritik, asbabun nuzul, sesat pikir, dan concern moral.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200"
                >
                  <p className="font-mono text-sm text-emerald-700">
                    {item.title}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-slate-700">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.7)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Fitur MVP
            </p>
            <div className="mt-4 space-y-4">
              {[
                "Daftar surat dengan ringkasan ayat dan tempat turunnya.",
                "Halaman detail surat yang sudah membaca ayat asli dari database.",
                "Pencarian lintas ayat berdasarkan terjemahan, topik, kritik, atau analisis.",
                "Alur edit data lewat Excel lalu sinkronisasi dengan satu command.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                  Surat Awal
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Navigasi surat dari database
                </h2>
              </div>
              <Link
                href="/surat"
                className="text-sm font-semibold text-emerald-700"
              >
                Semua surat
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {surahs.map((surah) => (
                <Link
                  key={surah.id}
                  href={`/surat/${surah.id}`}
                  className="flex items-center justify-between rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <p className="text-sm text-slate-500">Surat {surah.id}</p>
                    <p className="mt-1 text-lg font-semibold text-slate-950">
                      {surah.nameLatin}
                    </p>
                    <p className="text-sm text-slate-600">{surah.meaning}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl text-slate-950">{surah.nameArabic}</p>
                    <p className="text-sm text-slate-500">
                      {surah.verseCount} ayat
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
              Contoh Kartu Ayat
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Cuplikan ayat langsung dari data asli
            </h2>
            <div className="mt-5 grid gap-4">
              {highlightedVerses.map((verse) => (
                <article
                  key={`${verse.surahId}-${verse.ayahNumber}`}
                  className="rounded-[1.5rem] bg-[#faf7ef] p-5 ring-1 ring-amber-100"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-sm text-slate-500">
                        {verse.surahNameIndonesian} • Ayat {verse.ayahNumber}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                      {verse.topic || "Tanpa topik"}
                    </span>
                  </div>
                  {verse.asbabunNuzul ? (
                    <div className="mt-4 border-l-2 border-amber-300 pl-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                        Asbabun Nuzul
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {verse.asbabunNuzul}
                      </p>
                    </div>
                  ) : null}
                  <Link
                    href={`/ayat/${verse.id}`}
                    className="mt-5 block rounded-[1.25rem] px-2 py-2 text-right text-3xl leading-[1.9] text-slate-950 transition hover:bg-white/70"
                  >
                    {verse.arabicText}
                  </Link>
                  <p className="mt-4 text-sm leading-7 text-slate-700">
                    {verse.translation}
                  </p>
                  {verse.critique ? (
                    <p className="mt-4 rounded-[1rem] bg-white/80 p-4 text-sm leading-7 text-slate-700 ring-1 ring-amber-100">
                      {verse.critique}
                    </p>
                  ) : null}
                  {verse.logicalFallacies || verse.moralConcerns ? (
                    <div
                      className={`mt-4 grid gap-4 ${
                        verse.logicalFallacies && verse.moralConcerns
                          ? "lg:grid-cols-2"
                          : ""
                      }`}
                    >
                      {verse.logicalFallacies ? (
                        <div className="rounded-[1.25rem] bg-amber-50 p-4 ring-1 ring-amber-100">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
                            Logical Fallacy
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-700">
                            {verse.logicalFallacies}
                          </p>
                        </div>
                      ) : null}
                      {verse.moralConcerns ? (
                        <div className="rounded-[1.25rem] bg-rose-50 p-4 ring-1 ring-rose-100">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-800">
                            Moral Concern
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-700">
                            {verse.moralConcerns}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
