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
    { label: "Total surat", value: `${stats.surahCount}`, note: "Navigasi lengkap seluruh surat" },
    { label: "Total ayat", value: `${stats.verseCount}`, note: "Siap dibaca per surat atau per ayat" },
    {
      label: "Ayat beranotasi",
      value: `${stats.analysisCount}`,
      note: "Topik, kritik, dan konteks tersedia",
    },
  ];

  const primaryActions = [
    {
      href: "/cari",
      title: "Cari tema atau kata kunci",
      body: "Masuk cepat ke pencarian lintas ayat berdasarkan terjemahan, topik, atau kritik.",
      style:
        "border-emerald-200 bg-emerald-50/80 text-emerald-950 hover:border-emerald-300 hover:bg-emerald-100",
    },
    {
      href: "/surat",
      title: "Telusuri per surat",
      body: "Buka daftar surat lalu lanjutkan ke pembacaan ayat per ayat dengan struktur yang jelas.",
      style:
        "border-amber-200 bg-amber-50/80 text-amber-950 hover:border-amber-300 hover:bg-amber-100",
    },
    {
      href: "/bookmark",
      title: "Lanjutkan dari bookmark",
      body: "Kumpulkan ayat penting dan kembali ke daftar simpanan tanpa harus mencari ulang.",
      style:
        "border-slate-200 bg-white text-slate-950 hover:border-slate-300 hover:bg-slate-50",
    },
  ];

  const workflowSteps = [
    "Cari ayat berdasarkan kata, topik, atau surat.",
    "Buka detail ayat untuk membaca konteks, kritik, dan anotasi.",
    "Simpan ayat penting ke bookmark untuk dibuka lagi nanti.",
  ];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dff4e7,transparent_28%),radial-gradient(circle_at_top_right,#fde8bf,transparent_22%),linear-gradient(180deg,#f9f3e6_0%,#fffdf8_42%,#f3efe6_100%)] px-5 py-6 text-slate-900 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/70 bg-white/70 px-5 py-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
              SliceQ
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Quran explorer yang fokus ke navigasi ayat, konteks, dan anotasi.
            </p>
          </div>
          <nav className="flex flex-wrap gap-2 text-sm font-semibold">
            <Link
              href="/cari"
              className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800"
            >
              Cari Ayat
            </Link>
            <Link
              href="/surat"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 transition hover:bg-slate-50"
            >
              Daftar Surat
            </Link>
            <Link
              href="/bookmark"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 transition hover:bg-slate-50"
            >
              Bookmark
            </Link>
          </nav>
        </header>

        <section className="overflow-hidden rounded-[2.25rem] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(248,251,246,0.82))] p-6 shadow-[0_30px_90px_-32px_rgba(20,34,24,0.4)] backdrop-blur sm:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-emerald-700">
                Home Base
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Lebih cepat menemukan ayat, tema, dan konteks yang ingin kamu baca.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
                Homepage sekarang diarahkan untuk memulai aksi utama secepat mungkin:
                cari ayat, buka surat, lalu lanjutkan ke detail ayat dengan anotasi yang sudah tersusun.
              </p>

              <form
                action="/cari"
                className="mt-7 rounded-[1.75rem] bg-slate-950 p-4 text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.75)] sm:p-5"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                  Mulai dari pencarian
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <div className="min-w-0 flex-1 rounded-[1rem] bg-white px-4 py-3">
                    <input
                      name="q"
                      placeholder="Contoh: pembalasan, rahmat, munafik, waris"
                      className="w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Cari sekarang
                  </button>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                  {["tauhid", "hukum", "kiamat", "moral", "syirik"].map((item) => (
                    <Link
                      key={item}
                      href={`/cari?q=${encodeURIComponent(item)}`}
                      className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/10"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </form>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                {statCards.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-[1.6rem] border border-emerald-100 bg-white/80 p-4 shadow-[0_16px_40px_-32px_rgba(15,23,42,0.55)]"
                  >
                    <p className="text-sm text-slate-600">{stat.label}</p>
                    <p className="mt-2 text-3xl font-semibold text-slate-950">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{stat.note}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[1.8rem] border border-slate-200 bg-[linear-gradient(180deg,#fffaf0_0%,#fffdf8_100%)] p-5">
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">
                  Cara Pakai
                </p>
                <div className="mt-4 grid gap-3">
                  {workflowSteps.map((step, index) => (
                    <div
                      key={step}
                      className="flex items-start gap-3 rounded-[1.25rem] bg-white/80 p-3 ring-1 ring-amber-100"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-900">
                        {index + 1}
                      </span>
                      <p className="text-sm leading-7 text-slate-700">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {primaryActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className={`rounded-[1.8rem] border p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.55)] transition hover:-translate-y-0.5 ${action.style}`}
            >
              <p className="text-sm font-semibold uppercase tracking-[0.22em] opacity-70">
                Jalur Cepat
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                {action.title}
              </h2>
              <p className="mt-3 text-sm leading-7 opacity-80">{action.body}</p>
            </Link>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                  Mulai Dari Surat
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-950">
                  Enam surat pertama untuk masuk ke pembacaan
                </h2>
              </div>
              <Link
                href="/surat"
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                Semua surat
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              {surahs.map((surah) => (
                <Link
                  key={surah.id}
                  href={`/surat/${surah.id}`}
                  className="flex items-center justify-between gap-4 rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfbf9_0%,#f8f5ef_100%)] px-4 py-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
                >
                  <div>
                    <p className="text-sm text-slate-500">
                      Surat {surah.id} • {surah.revelationPlace}
                    </p>
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

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.7)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                  Ayat Sorotan
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  Cuplikan untuk langsung masuk ke detail
                </h2>
              </div>
              <Link
                href="/cari"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Buka mode cari
              </Link>
            </div>
            <div className="mt-5 grid gap-4">
              {highlightedVerses.map((verse) => (
                <article
                  key={`${verse.surahId}-${verse.ayahNumber}`}
                  className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-sm text-slate-300">
                        {verse.surahNameIndonesian} • Ayat {verse.ayahNumber}
                      </p>
                    </div>
                    <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-white/10">
                      {verse.topic || "Tanpa topik"}
                    </span>
                  </div>
                  {verse.asbabunNuzul ? (
                    <div className="mt-4 border-l-2 border-amber-300 pl-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
                        Asbabun Nuzul
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-200">
                        {verse.asbabunNuzul}
                      </p>
                    </div>
                  ) : null}
                  <Link
                    href={`/ayat/${verse.id}`}
                    className="mt-5 block rounded-[1.25rem] px-2 py-2 text-right text-3xl leading-[1.9] text-white transition hover:bg-white/8"
                  >
                    {verse.arabicText}
                  </Link>
                  <p className="mt-4 text-sm leading-7 text-slate-200">
                    {verse.translation}
                  </p>
                  {verse.critique ? (
                    <p className="mt-4 rounded-[1rem] bg-white/8 p-4 text-sm leading-7 text-slate-200 ring-1 ring-white/10">
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
                        <div className="rounded-[1.25rem] bg-amber-100/10 p-4 ring-1 ring-amber-200/15">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300">
                            Logical Fallacy
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-200">
                            {verse.logicalFallacies}
                          </p>
                        </div>
                      ) : null}
                      {verse.moralConcerns ? (
                        <div className="rounded-[1.25rem] bg-rose-100/10 p-4 ring-1 ring-rose-200/15">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-300">
                            Moral Concern
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-200">
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
