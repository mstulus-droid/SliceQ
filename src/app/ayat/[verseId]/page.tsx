import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import {
  getVerseById,
  getVerseNeighbors,
  isVerseBookmarked,
} from "@/lib/quran-data";
import { VerseReaderCard } from "./verse-reader-card";

type PageProps = {
  params: Promise<{ verseId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { verseId } = await params;
  let verse = null;

  try {
    verse = await getVerseById(Number(verseId));
  } catch {
    return {
      title: "Database bermasalah | SliceQ",
    };
  }

  if (!verse) {
    return {
      title: "Ayat tidak ditemukan | SliceQ",
    };
  }

  return {
    title: `${verse.surahNameIndonesian} Ayat ${verse.ayahNumber} | SliceQ`,
  };
}

export default async function VerseDetailPage({ params }: PageProps) {
  const { verseId } = await params;
  const parsedId = Number(verseId);
  let verse;

  try {
    verse = await getVerseById(parsedId);
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  if (!verse) {
    notFound();
  }

  let neighbors;
  let bookmarked;

  try {
    [neighbors, bookmarked] = await Promise.all([
      getVerseNeighbors(parsedId),
      isVerseBookmarked(parsedId),
    ]);
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e9f7ef,transparent_28%),linear-gradient(180deg,#f7f3ea_0%,#f4efe5_100%)] px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-5">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.7)] sm:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                Detail Ayat
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
                {verse.surahNameIndonesian} Ayat {verse.ayahNumber}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Fokus pada satu ayat, dengan navigasi ringkas dan panel konteks yang nyaman dibaca dari layar kecil sekalipun.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 md:justify-end">
              <Link
                href="/bookmark"
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Lihat bookmark
              </Link>
              <Link
                href={`/surat/${verse.surahId}`}
                className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Buka surat
              </Link>
              <Link
                href="/cari"
                className="rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
              >
                Cari lagi
              </Link>
            </div>
          </div>
        </section>

        <VerseReaderCard
          verseId={verse.id}
          arabicText={verse.arabicText}
          translation={verse.translation}
          topic={verse.topic}
          asbabunNuzul={verse.asbabunNuzul}
          critique={verse.critique}
          logicalFallacies={verse.logicalFallacies}
          moralConcerns={verse.moralConcerns}
          isBookmarked={bookmarked}
          previousVerseId={neighbors.previousVerseId}
          nextVerseId={neighbors.nextVerseId}
        />
      </div>
    </main>
  );
}
