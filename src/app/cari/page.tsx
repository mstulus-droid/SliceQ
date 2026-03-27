import Link from "next/link";
import { redirect } from "next/navigation";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import { getSurahs, getVersesBySurahId, searchVersesWithFilters } from "@/lib/quran-data";

export const metadata = {
  title: "Cari Ayat | SliceQ",
};

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    surah?: string;
    ayat?: string;
  }>;
};

function ActiveFilter({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
      {label}: {value}
    </span>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? "";
  const surah = params?.surah?.trim() ?? "";
  const ayat = params?.ayat?.trim() ?? "";

  const selectedSurahId = Number(surah);
  const selectedAyahNumber = Number(ayat);
  const hasSelectedSurah = Number.isFinite(selectedSurahId) && selectedSurahId > 0;
  const hasSelectedAyah = Number.isFinite(selectedAyahNumber) && selectedAyahNumber > 0;

  let surahs;
  let ayahOptions;

  try {
    [surahs, ayahOptions] = await Promise.all([
      getSurahs(),
      hasSelectedSurah ? getVersesBySurahId(selectedSurahId) : Promise.resolve([]),
    ]);
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  if (hasSelectedSurah && hasSelectedAyah) {
    const matchedVerse = ayahOptions.find((item) => item.ayahNumber === selectedAyahNumber);
    if (matchedVerse) {
      redirect(`/ayat/${matchedVerse.id}`);
    }
  }

  let verses;

  try {
    verses = await searchVersesWithFilters({
      query,
      limit: query ? 40 : 12,
    });
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  const quickQueries = ["rahmat", "munafik", "waris", "pembalasan", "tauhid"];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#edf7ef,transparent_26%),linear-gradient(180deg,#f7f3e8_0%,#f4efe6_100%)] px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_-38px_rgba(15,23,42,0.4)] backdrop-blur sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-700">
                Mode Cari
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Cari ayat atau lompat cepat
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Mulai dari kata kunci, atau langsung pilih surat dan ayat jika kamu sudah tahu tujuanmu.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Kembali ke beranda
            </Link>
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <form className="rounded-[1.75rem] bg-slate-950 p-4 text-white shadow-[0_20px_60px_-35px_rgba(15,23,42,0.8)] sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Pencarian
              </p>
              <div className="mt-4 flex flex-col gap-3">
                <div className="min-w-0 rounded-[1rem] bg-white px-4 py-3">
                  <input
                    name="q"
                    defaultValue={query}
                    placeholder="Cari terjemahan, topik, kritik, atau anotasi"
                    className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Cari
                  </button>
                  <Link
                    href="/cari"
                    className="rounded-full border border-white/20 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    Reset
                  </Link>
                </div>
                <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                  {quickQueries.map((item) => (
                    <Link
                      key={item}
                      href={`/cari?q=${encodeURIComponent(item)}`}
                      className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/10"
                    >
                      {item}
                    </Link>
                  ))}
                </div>
              </div>
            </form>

            <form className="rounded-[1.75rem] bg-[#faf7ef] p-4 ring-1 ring-amber-100 sm:p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Shortcut Ayat
              </p>
              <div className="mt-4 grid gap-3">
                <select
                  name="surah"
                  defaultValue={hasSelectedSurah ? String(selectedSurahId) : ""}
                  className="min-w-0 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none"
                >
                  <option value="">Pilih surat</option>
                  {surahs.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.id}. {item.nameLatin}
                    </option>
                  ))}
                </select>

                <select
                  name="ayat"
                  defaultValue={hasSelectedAyah ? String(selectedAyahNumber) : ""}
                  className="min-w-0 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none"
                >
                  <option value="">Pilih ayat</option>
                  {ayahOptions.map((item) => (
                    <option key={item.id} value={item.ayahNumber}>
                      Ayat {item.ayahNumber}
                    </option>
                  ))}
                </select>

                <button
                  type="submit"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-fit"
                >
                  Buka
                </button>
              </div>
            </form>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {query ? <ActiveFilter label="Kata kunci" value={query} /> : null}
          </div>

          <div className="mt-4 rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            {query
              ? `Menampilkan ${verses.length} ayat sesuai pencarian.`
              : "Gunakan pencarian untuk menjelajah isi ayat, atau pakai shortcut untuk langsung membuka surat dan ayat tertentu."}
          </div>

          <div className="mt-6 grid gap-4">
            {verses.map((verse) => (
              <article
                key={`${verse.surahId}-${verse.ayahNumber}`}
                className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfbf9_0%,#f8f5ef_100%)] p-4 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.55)] sm:p-5"
              >
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm text-slate-500">
                      {verse.surahNameIndonesian} • Ayat {verse.ayahNumber}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-950">
                      {verse.topic || "Tanpa topik"}
                    </p>
                  </div>
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
                  className="mt-4 block rounded-[1.25rem] px-2 py-2 text-right text-2xl leading-[1.9] text-slate-950 transition hover:bg-white sm:text-3xl"
                >
                  {verse.arabicText}
                </Link>
                <p className="mt-4 text-sm leading-7 text-slate-700">
                  {verse.translation}
                </p>

                {verse.critique ? (
                  <p className="mt-4 rounded-[1rem] bg-white/80 p-4 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">
                    {verse.critique}
                  </p>
                ) : null}

                {verse.logicalFallacies || verse.moralConcerns ? (
                  <div
                    className={`mt-4 grid gap-4 ${
                      verse.logicalFallacies && verse.moralConcerns ? "lg:grid-cols-2" : ""
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
        </section>
      </div>
    </main>
  );
}
