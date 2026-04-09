import { NavLink } from "@/components/nav-link";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import {
  type SurahListItem,
  type VerseRecord,
  getSurahs,
  getSurahById,
  getVersesBySurahId,
} from "@/lib/quran-data";
import { SurahContextToggle } from "./surah-context-toggle";
import { SurahFloatingControls } from "./surah-floating-controls";
import { SurahJumpControl } from "./surah-jump-control";
import { SurahSearchControl } from "./surah-search-control";
import { SurahStickyTitle } from "./surah-sticky-title";
import { SurahTopicPanel } from "./surah-topic-panel";
import { VerseAnalysisDisclosures } from "./verse-analysis-disclosures";

type PageProps = {
  params: Promise<{ surahId: string }>;
};

type VerseTopicGroup = {
  topic: string;
  verses: VerseRecord[];
};

function groupVersesByTopic(verses: VerseRecord[]): VerseTopicGroup[] {
  const groups: VerseTopicGroup[] = [];

  for (const verse of verses) {
    const normalizedTopic = verse.topic.trim();
    const lastGroup = groups[groups.length - 1];
    const previousVerse = lastGroup?.verses[lastGroup.verses.length - 1];
    const isContinuation =
      lastGroup &&
      normalizedTopic.length > 0 &&
      lastGroup.topic === normalizedTopic &&
      previousVerse &&
      previousVerse.ayahNumber + 1 === verse.ayahNumber;

    if (isContinuation) {
      lastGroup.verses.push(verse);
      continue;
    }

    groups.push({
      topic: normalizedTopic,
      verses: [verse],
    });
  }

  return groups;
}

function buildRevelationOrderText(
  surah: SurahListItem,
  previousByRevelation: SurahListItem | undefined,
  nextByRevelation: SurahListItem | undefined,
) {
  if (surah.revelationOrder <= 0) {
    return null;
  }

  return (
    <>
      Dalam urutan turunnya wahyu, surat ini turun ke-{surah.revelationOrder}
      {previousByRevelation ? (
        <>
          {" "}
          setelah{" "}
          <NavLink
            href={`/surat/${previousByRevelation.id}`}
            className="font-semibold text-emerald-200 underline decoration-white/30 underline-offset-4 transition hover:text-white"
          >
            {previousByRevelation.nameLatin}
          </NavLink>
        </>
      ) : null}
      {nextByRevelation ? (
        <>
          {" "}
          sebelum{" "}
          <NavLink
            href={`/surat/${nextByRevelation.id}`}
            className="font-semibold text-emerald-200 underline decoration-white/30 underline-offset-4 transition hover:text-white"
          >
            {nextByRevelation.nameLatin}
          </NavLink>
        </>
      ) : null}
      .
    </>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const { surahId } = await params;
  let surah = null;

  try {
    surah = await getSurahById(Number(surahId));
  } catch {
    return {
      title: "Database bermasalah | SliceQ",
    };
  }

  if (!surah) {
    return {
      title: "Surat tidak ditemukan | SliceQ",
    };
  }

  return {
    title: `${surah.nameLatin} | SliceQ`,
  };
}

export default async function SurahDetailPage({ params }: PageProps) {
  const { surahId } = await params;
  const parsedId = Number(surahId);
  let surah;
  let surahs: SurahListItem[];

  try {
    [surah, surahs] = await Promise.all([getSurahById(parsedId), getSurahs()]);
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  if (!surah) {
    notFound();
  }

  let verses;

  try {
    verses = await getVersesBySurahId(parsedId);
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  const verseGroups = groupVersesByTopic(verses);
  const surahsByRevelation = surahs
    .filter((item) => item.revelationOrder > 0)
    .sort((left, right) => left.revelationOrder - right.revelationOrder);
  const currentRevelationIndex = surahsByRevelation.findIndex((item) => item.id === surah.id);
  const previousByRevelation =
    currentRevelationIndex > 0 ? surahsByRevelation[currentRevelationIndex - 1] : undefined;
  const nextByRevelation =
    currentRevelationIndex >= 0 && currentRevelationIndex < surahsByRevelation.length - 1
      ? surahsByRevelation[currentRevelationIndex + 1]
      : undefined;
  const revelationOrderText = buildRevelationOrderText(
    surah,
    previousByRevelation,
    nextByRevelation,
  );

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ef_0%,#f8f4ea_100%)] px-3 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <SurahStickyTitle surahNumber={surah.id} title={surah.nameLatin} />
        <SurahFloatingControls
          verseCount={surah.verseCount}
          surahs={surahs.map((item) => ({
            id: item.id,
            nameLatin: item.nameLatin,
            meaning: item.meaning,
          }))}
        />
        <section className="space-y-4">
          <div
            id="surah-header"
            className="relative z-30 rounded-[2rem] bg-[radial-gradient(circle_at_top_right,#17412f,transparent_35%),linear-gradient(180deg,#0f172a_0%,#16212f_100%)] p-6 text-center text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.7)] sm:p-8"
          >
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
              Surat {surah.id}
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
              {surah.nameLatin}
            </h1>
            <p className="mt-3 text-5xl text-white/90 sm:text-6xl">
              {surah.nameArabic}
            </p>
            <div className="mt-4 space-y-2 text-sm leading-7 text-slate-300 sm:text-base">
              <p>
                {surah.meaning}, terdiri dari {surah.verseCount} ayat dan turun di {surah.revelationPlace}.
              </p>
              {revelationOrderText ? <p>{revelationOrderText}</p> : null}
            </div>
            {surah.context ? (
              <SurahContextToggle context={surah.context} />
            ) : null}

            <div className="mt-6 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:flex sm:justify-center sm:gap-3">
              <SurahSearchControl
                surahs={surahs.map((item) => ({
                  id: item.id,
                  nameLatin: item.nameLatin,
                  meaning: item.meaning,
                }))}
                className="w-full min-w-0 px-3 sm:min-w-[9.5rem] sm:px-4"
              />
              <NavLink
                href="/"
                aria-label="Kembali ke home"
                title="Kembali ke home"
                className="inline-flex h-11 w-12 items-center justify-center rounded-full border border-white/15 text-white transition hover:bg-white/10 sm:w-12"
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
                  <path d="M4 11.5L12 5l8 6.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6.5 10.5V19h11v-8.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </NavLink>
              <SurahJumpControl
                verseCount={surah.verseCount}
                className="w-full min-w-0 px-3 sm:min-w-[9.5rem] sm:px-4"
              />
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white px-4 py-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] sm:px-5">
            <p className="text-sm leading-7 text-slate-600">
              Menampilkan semua ayat dari {surah.nameLatin}. Klik lafazh Arab untuk membuka detail ayat satu per satu.
            </p>
          </div>

          <SurahTopicPanel
            topics={verseGroups
              .filter((g) => g.topic)
              .map((g, i) => ({
                id: `topic-group-${i}`,
                label: g.topic,
                startAyah: g.verses[0].ayahNumber,
                endAyah: g.verses[g.verses.length - 1].ayahNumber,
              }))}
          />

          <div className="space-y-5">
            {verseGroups.map((group, groupIndex) => (
              <section
                id={`topic-group-${groupIndex}`}
                key={`${group.topic || "tanpa-topik"}-${group.verses[0].ayahNumber}-${groupIndex}`}
                className={group.topic ? "relative sm:pl-8 scroll-mt-24" : "scroll-mt-24"}
              >
                {group.topic ? (
                  <>
                    <div className="absolute bottom-8 left-3 top-14 hidden w-px bg-emerald-200 sm:block" />
                    <div className="absolute bottom-8 left-3 hidden h-px w-5 bg-emerald-200 sm:block" />
                    <div className="sticky top-12 z-20 mb-3 mx-auto w-fit rounded-[1.25rem] border border-emerald-200/80 bg-emerald-50/92 px-4 py-3 text-center text-sm font-semibold leading-7 text-emerald-950 shadow-[0_12px_34px_-28px_rgba(6,78,59,0.5)] backdrop-blur sm:mx-0 sm:w-auto sm:text-left sm:top-14">
                      {group.verses[0].ayahNumber === group.verses[group.verses.length - 1].ayahNumber
                        ? `${group.verses[0].ayahNumber} : ${group.topic}`
                        : `${group.verses[0].ayahNumber}-${group.verses[group.verses.length - 1].ayahNumber} : ${group.topic}`}
                    </div>
                  </>
                ) : null}

                <div className="space-y-4">
                  {group.verses.map((verse) => (
                    <article
                      key={`${verse.surahId}-${verse.ayahNumber}`}
                      id={`ayat-${verse.ayahNumber}`}
                      className="scroll-mt-28 rounded-[2rem] bg-white p-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-6"
                    >
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
                        <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-900">
                          Ayat {verse.ayahNumber}
                        </p>
                        {!group.topic ? (
                          <p className="text-sm text-slate-600">
                            {verse.topic || "Tanpa topik"}
                          </p>
                        ) : null}
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

                      <NavLink
                        href={`/ayat/${verse.id}`}
                        className="mt-5 block rounded-[1.4rem] bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_100%)] px-4 py-5 ring-1 ring-slate-200 transition hover:bg-slate-50"
                      >
                        <p className="text-right text-3xl leading-[2] text-slate-950 sm:text-4xl">
                          {verse.arabicText}
                        </p>
                        <p className="mt-4 text-base leading-8 text-slate-700">
                          {verse.translation}
                        </p>
                      </NavLink>

                      <VerseAnalysisDisclosures
                        critique={verse.critique}
                        logicalFallacies={verse.logicalFallacies}
                        moralConcerns={verse.moralConcerns}
                        scientificErrors={verse.scientificErrors}
                        contradictions={verse.contradictions}
                      />
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
