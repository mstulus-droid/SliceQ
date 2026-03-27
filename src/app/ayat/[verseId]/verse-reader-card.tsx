"use client";

import { useRouter } from "next/navigation";
import { BookmarkButton } from "@/app/bookmark/bookmark-button";

type VerseReaderCardProps = {
  verseId: number;
  arabicText: string;
  translation: string;
  topic: string;
  asbabunNuzul: string;
  critique: string;
  logicalFallacies: string;
  moralConcerns: string;
  isBookmarked: boolean;
  previousVerseId: number | null;
  nextVerseId: number | null;
};

export function VerseReaderCard({
  verseId,
  arabicText,
  translation,
  topic,
  asbabunNuzul,
  critique,
  logicalFallacies,
  moralConcerns,
  isBookmarked,
  previousVerseId,
  nextVerseId,
}: VerseReaderCardProps) {
  const router = useRouter();

  function goToVerse(targetVerseId: number | null) {
    if (!targetVerseId) {
      return;
    }

    router.push(`/ayat/${targetVerseId}`);
  }

  const hasDualNotes = Boolean(logicalFallacies && moralConcerns);

  return (
    <section className="rounded-[2rem] bg-white p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-8">
      <div className="mb-5 flex justify-start sm:justify-end">
        <BookmarkButton verseId={verseId} isBookmarked={isBookmarked} />
      </div>

      {asbabunNuzul ? (
        <div className="mb-6 rounded-[1.25rem] bg-amber-50/70 p-4 ring-1 ring-amber-100">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Asbabun Nuzul
          </p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{asbabunNuzul}</p>
        </div>
      ) : null}

      <div className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Topik
        </p>
        <p className="mt-2 text-sm leading-7 text-slate-700">
          {topic || "Belum ada ringkasan topik untuk ayat ini."}
        </p>
      </div>

      <div className="rounded-[1.5rem] bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_100%)] px-4 py-5 ring-1 ring-slate-200">
        <p className="text-right text-3xl leading-[2.1] text-slate-950 sm:text-5xl">
        {arabicText}
        </p>
      </div>
      <p className="mt-6 text-base leading-8 text-slate-700 sm:text-lg">
        {translation}
      </p>

      {critique ? (
        <div className="mt-4 rounded-[1.5rem] bg-slate-50 p-5 ring-1 ring-slate-200">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Kritik
          </p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{critique}</p>
        </div>
      ) : null}

      {logicalFallacies || moralConcerns ? (
        <div className={`mt-6 grid gap-4 ${hasDualNotes ? "lg:grid-cols-2" : ""}`}>
          {logicalFallacies ? (
            <div className="rounded-[1.5rem] bg-amber-50 p-5 ring-1 ring-amber-100">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
                Logical Fallacy
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {logicalFallacies}
              </p>
            </div>
          ) : null}
          {moralConcerns ? (
            <div className="rounded-[1.5rem] bg-rose-50 p-5 ring-1 ring-rose-100">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-800">
                Moral Concern
              </p>
              <p className="mt-3 text-sm leading-7 text-slate-700">
                {moralConcerns}
              </p>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Ayat sebelumnya</p>
          {previousVerseId ? (
            <button
              type="button"
              onClick={() => goToVerse(previousVerseId)}
              className="mt-3 inline-flex w-full justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 sm:w-auto"
            >
              Buka ayat sebelumnya
            </button>
          ) : (
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Ini adalah ayat pertama pada surat ini.
            </p>
          )}
        </div>

        <div className="rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
          <p className="text-sm text-slate-500">Ayat berikutnya</p>
          {nextVerseId ? (
            <button
              type="button"
              onClick={() => goToVerse(nextVerseId)}
              className="mt-3 inline-flex w-full justify-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 sm:w-auto"
            >
              Buka ayat berikutnya
            </button>
          ) : (
            <p className="mt-3 text-sm leading-7 text-slate-700">
              Ini adalah ayat terakhir pada surat ini.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
