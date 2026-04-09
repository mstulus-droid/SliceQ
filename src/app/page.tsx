import Image from "next/image";
import { NavLink } from "@/components/nav-link";
import { CommitInfoPopup } from "@/components/commit-info-popup";
import { redirect } from "next/navigation";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { HomeFooter } from "@/app/home-footer";
import { getDatabaseErrorInfo } from "@/lib/db";
import { HomeClientWrapper } from "./home-client-wrapper";
import {
  type SurahListItem,
  type VerseRecord,
  getSurahs,
  getVersesBySurahId,
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
  const surah = params?.surah?.trim() ?? "";
  const ayat = params?.ayat?.trim() ?? "";
  const selectedSurahId = Number(surah);
  const selectedAyahNumber = Number(ayat);
  const hasSelectedSurah = Number.isFinite(selectedSurahId) && selectedSurahId > 0;
  const hasSelectedAyah = Number.isFinite(selectedAyahNumber) && selectedAyahNumber > 0;
  let surahs: SurahListItem[];
  let ayahOptions: VerseRecord[] = [];
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

  return (
    <main className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,#ece8db,transparent_24%),linear-gradient(180deg,#f3efe5_0%,#ece5d8_46%,#e7dfd2_100%)] px-4 py-5 text-slate-900 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4">
        <section className="px-1 pt-1">
          <div className="flex flex-col items-center justify-center gap-3 text-center">
            <CommitInfoPopup>
              <div className="relative block h-[72px] w-[260px] sm:h-[88px] sm:w-[320px]">
                <Image
                  src="/brand/sliceq-samping.webp"
                  alt="SliceQ"
                  fill
                  priority
                  sizes="(max-width: 640px) 260px, 320px"
                  className="object-contain"
                />
              </div>
            </CommitInfoPopup>
            <p className="max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Sebuah arsip baca untuk tafsir, kritik, dan kontradiksi.
            </p>
          </div>
        </section>

        <HomeClientWrapper
          selectedSurah={hasSelectedSurah ? String(selectedSurahId) : ""}
          selectedAyat={hasSelectedAyah ? String(selectedAyahNumber) : ""}
          surahs={surahs.map((surah) => ({
            id: surah.id,
            nameLatin: surah.nameLatin,
            meaning: surah.meaning,
          }))}
          list={
            <div className="divide-y divide-slate-200">
              {surahs.map((surah) => (
                <NavLink
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
                </NavLink>
              ))}
            </div>
          }
        />

        <div className="mt-auto">
          <HomeFooter />
        </div>
      </div>
    </main>
  );
}
