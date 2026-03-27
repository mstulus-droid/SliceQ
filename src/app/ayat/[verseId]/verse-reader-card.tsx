"use client";

import { useRouter } from "next/navigation";

type VerseReaderCardProps = {
  arabicText: string;
  translation: string;
  topic: string;
  asbabunNuzul: string;
  critique: string;
  logicalFallacies: string;
  moralConcerns: string;
  previousVerseId: number | null;
  nextVerseId: number | null;
};

export function VerseReaderCard({
  arabicText,
  translation,
  topic,
  asbabunNuzul,
  critique,
  logicalFallacies,
  moralConcerns,
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

      <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,#faf9f5_0%,#f3efe7_100%)] p-3 sm:p-4">
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => goToVerse(previousVerseId)}
            disabled={!previousVerseId}
            className={`inline-flex min-h-14 items-center justify-center rounded-[1.1rem] px-4 text-sm font-semibold transition ${
              previousVerseId
                ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            <span className="mr-2 text-base">←</span>
            Ayat sebelumnya
          </button>
          <button
            type="button"
            onClick={() => goToVerse(nextVerseId)}
            disabled={!nextVerseId}
            className={`inline-flex min-h-14 items-center justify-center rounded-[1.1rem] px-4 text-sm font-semibold transition ${
              nextVerseId
                ? "bg-slate-950 text-white hover:bg-slate-800"
                : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            Ayat berikutnya
            <span className="ml-2 text-base">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
