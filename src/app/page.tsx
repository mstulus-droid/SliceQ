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
  getSurahsStats,
} from "@/lib/quran-data";

type HomePageProps = {
  searchParams?: Promise<{
    q?: string;
    surah?: string;
    ayat?: string;
  }>;
};

type RevelationKind = "makkiyah" | "madaniyah" | null;

function classifyRevelation(place: string): RevelationKind {
  const normalized = place.trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes("makk") || normalized.includes("mekk") || normalized.includes("mecca")) {
    return "makkiyah";
  }
  if (normalized.includes("madin") || normalized.includes("medin")) {
    return "madaniyah";
  }
  return null;
}

function RevelationBadge({ kind, size = "md" }: { kind: RevelationKind; size?: "sm" | "md" }) {
  if (!kind) return null;
  const isMakkiyah = kind === "makkiyah";
  const sizeClasses =
    size === "sm"
      ? "gap-0.5 rounded-full px-1.5 py-0 text-[8px] tracking-[0.1em]"
      : "gap-1 rounded-full px-2 py-0.5 text-[10px] tracking-[0.14em]";
  const dotSize = size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5";
  return (
    <span
      className={`inline-flex shrink-0 items-center font-semibold uppercase ring-1 ${sizeClasses} ${
        isMakkiyah
          ? "bg-amber-50 text-amber-800 ring-amber-200"
          : "bg-emerald-50 text-emerald-800 ring-emerald-200"
      }`}
    >
      <span
        className={`rounded-full ${dotSize} ${
          isMakkiyah ? "bg-amber-500" : "bg-emerald-500"
        }`}
        aria-hidden
      />
      {isMakkiyah ? "Makkiyah" : "Madaniyah"}
    </span>
  );
}

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
  let surahStats = [];
  try {
    [surahs, ayahOptions, surahStats] = await Promise.all([
      getSurahs(),
      hasSelectedSurah ? getVersesBySurahId(selectedSurahId) : Promise.resolve([]),
      getSurahsStats(),
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
            <CommitInfoPopup surahStats={surahStats}>
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
              {surahs.map((surah) => {
                const kind = classifyRevelation(surah.revelationPlace);
                return (
                  <NavLink
                    key={surah.id}
                    href={`/surat/${surah.id}`}
                    className="block px-4 py-3 transition hover:bg-[#f7f4ed] sm:px-5"
                  >
                    <div className="hidden grid-cols-[64px_minmax(0,1fr)_minmax(140px,auto)] items-center gap-4 md:grid">
                      <span className="text-sm font-semibold text-slate-800">
                        {surah.id}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-lg font-semibold text-slate-950">
                          {surah.nameLatin}
                        </p>
                        <p className="truncate text-sm text-slate-500">
                          {surah.meaning} • {surah.verseCount} ayat
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="font-arabic truncate text-3xl text-slate-950">
                          {surah.nameArabic}
                        </p>
                        <RevelationBadge kind={kind} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 md:hidden">
                      <span className="w-7 shrink-0 text-sm font-semibold text-slate-800">
                        {surah.id}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-semibold text-slate-950">
                          {surah.nameLatin}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {surah.meaning} • {surah.verseCount} ayat
                        </p>
                      </div>
                      <div className="flex flex-[2] min-w-0 items-center gap-2">
                        <p className="font-arabic flex-1 truncate text-right text-3xl text-slate-950">
                          {surah.nameArabic}
                        </p>
                        {kind ? (
                          <RevelationBadge kind={kind} size="sm" />
                        ) : (
                          <span className="invisible inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0 text-[8px] font-semibold uppercase tracking-[0.1em] ring-1">
                            <span className="h-1 w-1 rounded-full" aria-hidden />
                            Madaniyah
                          </span>
                        )}
                      </div>
                    </div>
                  </NavLink>
                );
              })}
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
