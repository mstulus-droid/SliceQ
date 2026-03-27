import Link from "next/link";
import { redirect } from "next/navigation";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import { HomeControls } from "@/app/home-controls";
import {
  type SurahListItem,
  type VerseRecord,
  getSurahs,
  getVersesBySurahId,
  searchVersesWithFilters,
} from "@/lib/quran-data";

type HomePageProps = {
  searchParams?: Promise<{
    q?: string;
    surah?: string;
    ayat?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = searchParams ? await searchParams : undefined;
  const query = params?.q?.trim() ?? "";
  const surah = params?.surah?.trim() ?? "";
  const ayat = params?.ayat?.trim() ?? "";
  const selectedSurahId = Number(surah);
  const selectedAyahNumber = Number(ayat);
  const hasSelectedSurah = Number.isFinite(selectedSurahId) && selectedSurahId > 0;
  const hasSelectedAyah = Number.isFinite(selectedAyahNumber) && selectedAyahNumber > 0;
  let surahs: SurahListItem[];
  let ayahOptions: VerseRecord[] = [];
  let verses: VerseRecord[] = [];

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

  if (hasSelectedSurah && !hasSelectedAyah) {
    redirect(`/surat/${selectedSurahId}`);
  }

  if (query) {
    try {
      verses = await searchVersesWithFilters({
        query,
        limit: 30,
      });
    } catch (error) {
      return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
    }
  }

  const quickQueries = ["rahmat", "tauhid", "waris", "munafik", "kiamat"];

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#ece8db,transparent_24%),linear-gradient(180deg,#f3efe5_0%,#ece5d8_46%,#e7dfd2_100%)] px-4 py-5 text-slate-900 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <section className="px-1 pt-1">
          <div className="flex items-center justify-center gap-4 text-center">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              <span className="text-[#b42318]">Slice</span>
              <span className="text-emerald-700">Q</span>
            </h1>
          </div>
        </section>

        <HomeControls
          quickQueries={quickQueries}
          selectedSurah={hasSelectedSurah ? String(selectedSurahId) : ""}
          selectedAyat={hasSelectedAyah ? String(selectedAyahNumber) : ""}
          surahs={surahs.map((surah) => ({
            id: surah.id,
            nameLatin: surah.nameLatin,
            meaning: surah.meaning,
          }))}
        />

        {query ? (
          <section className="rounded-[1.75rem] border border-slate-200 bg-white/92 p-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Hasil Bedah
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                  {verses.length} ayat untuk &quot;{query}&quot;
                </h2>
              </div>
              <Link
                href="/"
                className="inline-flex w-fit rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Reset
              </Link>
            </div>

            <div className="mt-4 grid gap-3">
              {verses.length > 0 ? (
                verses.map((verse) => (
                  <article
                    key={`${verse.surahId}-${verse.ayahNumber}`}
                    className="rounded-[1.4rem] border border-slate-200 bg-[linear-gradient(180deg,#fcfbf7_0%,#f6f1e8_100%)] p-4"
                  >
                    <p className="text-sm text-slate-500">
                      {verse.surahNameIndonesian} • Ayat {verse.ayahNumber}
                    </p>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-800">
                      {verse.topic || "Tanpa topik"}
                    </p>
                    <Link
                      href={`/ayat/${verse.id}`}
                      className="mt-3 block rounded-[1rem] px-2 py-2 text-right text-2xl leading-[1.9] text-slate-950 transition hover:bg-white sm:text-3xl"
                    >
                      {verse.arabicText}
                    </Link>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {verse.translation}
                    </p>
                    {verse.critique ? (
                      <p className="mt-3 rounded-[1rem] bg-white/80 p-3 text-sm leading-7 text-slate-600 ring-1 ring-slate-200">
                        {verse.critique}
                      </p>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-sm leading-7 text-slate-600">
                  Tidak ada ayat yang cocok dengan kata kunci ini.
                </div>
              )}
            </div>
          </section>
        ) : null}

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="border-b border-slate-200 bg-[#171717] px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:px-5">
            <div className="hidden grid-cols-[64px_minmax(0,1fr)_minmax(110px,auto)_70px] items-center gap-4 md:grid">
              <span>No</span>
              <span>Nama Surat</span>
              <span className="text-right">Arab</span>
              <span className="text-right">Ayat</span>
            </div>
            <div className="md:hidden">Daftar Surat</div>
          </div>

          <div className="divide-y divide-slate-200">
            {surahs.map((surah) => (
              <Link
                key={surah.id}
                href={`/surat/${surah.id}`}
                className="block px-4 py-3 transition hover:bg-[#f7f4ed] sm:px-5"
              >
                <div className="hidden grid-cols-[64px_minmax(0,1fr)_minmax(110px,auto)_70px] items-center gap-4 md:grid">
                  <span className="text-sm font-semibold text-slate-800">
                    {surah.id}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-950">
                      {surah.nameLatin}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {surah.meaning} • {surah.revelationPlace}
                    </p>
                  </div>
                  <p className="truncate text-right text-2xl text-slate-950">
                    {surah.nameArabic}
                  </p>
                  <p className="text-right text-sm text-slate-500">
                    {surah.verseCount}
                  </p>
                </div>

                <div className="flex items-center gap-3 md:hidden">
                  <span className="w-7 shrink-0 text-sm font-semibold text-slate-800">
                    {surah.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {surah.nameLatin}
                      </p>
                      <p className="truncate text-lg text-slate-950">
                        {surah.nameArabic}
                      </p>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {surah.revelationPlace} • {surah.verseCount} ayat • {surah.meaning}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
