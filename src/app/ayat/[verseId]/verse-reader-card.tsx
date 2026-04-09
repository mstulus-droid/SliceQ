"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { parseNotes } from "@/lib/parse-notes";
import { useNavigation } from "@/components/navigation-provider";

type VerseReaderCardProps = {
  arabicText: string;
  translation: string;
  topic: string;
  asbabunNuzul: string;
  critique: string;
  logicalFallacies: string;
  moralConcerns: string;
  scientificErrors: string;
  contradictions: string;
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
  scientificErrors,
  contradictions,
  previousVerseId,
  nextVerseId,
}: VerseReaderCardProps) {
  const router = useRouter();
  const { startNavigation } = useNavigation();

  function goToVerse(targetVerseId: number | null) {
    if (!targetVerseId) {
      return;
    }

    startNavigation();
    router.push(`/ayat/${targetVerseId}`);
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  const notes = [
    {
      label: "Kritik",
      text: critique,
      border: "border-slate-400",
      bg: "bg-slate-50",
      labelColor: "text-slate-500",
    },
    {
      label: "Logical Fallacy",
      text: logicalFallacies,
      border: "border-amber-400",
      bg: "bg-amber-50/70",
      labelColor: "text-amber-700",
    },
    {
      label: "Moral Concern",
      text: moralConcerns,
      border: "border-rose-400",
      bg: "bg-rose-50/70",
      labelColor: "text-rose-700",
    },
    {
      label: "Scientific Error",
      text: scientificErrors,
      border: "border-cyan-400",
      bg: "bg-cyan-50/70",
      labelColor: "text-cyan-700",
    },
    {
      label: "Contradiction",
      text: contradictions,
      border: "border-violet-400",
      bg: "bg-violet-50/70",
      labelColor: "text-violet-700",
    },
  ].filter((n) => n.text);
  const noteCount = notes.length;

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
        <p className="text-sm leading-7 text-slate-700">
          <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Topik
          </span>
          {topic || "Belum ada ringkasan topik untuk ayat ini."}
        </p>
      </div>

      <div className="flex items-stretch overflow-hidden rounded-[1.5rem] ring-1 ring-slate-200 bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_100%)]">
        <button
          type="button"
          onClick={() => goToVerse(previousVerseId)}
          disabled={!previousVerseId}
          aria-label="Ayat sebelumnya"
          className={`flex shrink-0 items-center justify-center px-2 transition sm:px-4 ${
            previousVerseId
              ? "text-slate-400 hover:bg-slate-100/40 hover:text-slate-700"
              : "cursor-not-allowed text-slate-200"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 fill-none stroke-current stroke-2"
          >
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div className="min-w-0 flex-1 border-x border-slate-100/60 px-4 py-5 sm:px-6">
          <p className="text-right text-3xl leading-[2.1] text-slate-950 sm:text-5xl">
            {arabicText}
          </p>
          <p className="mt-4 text-base leading-8 text-slate-700 sm:text-lg">
            {translation}
          </p>
        </div>

        <button
          type="button"
          onClick={() => goToVerse(nextVerseId)}
          disabled={!nextVerseId}
          aria-label="Ayat berikutnya"
          className={`flex shrink-0 items-center justify-center px-2 transition sm:px-4 ${
            nextVerseId
              ? "text-slate-400 hover:bg-slate-100/40 hover:text-slate-700"
              : "cursor-not-allowed text-slate-200"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 fill-none stroke-current stroke-2"
          >
            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {noteCount > 0 ? (
        <div className="mt-5">
          {noteCount === 1 ? (
            <div className="w-full max-w-2xl mx-auto">
              <div
                className={`rounded-2xl border-t-4 ${notes[0].border} ${notes[0].bg} p-4 text-center`}
              >
                <p className={`text-[10px] font-semibold uppercase tracking-wider ${notes[0].labelColor}`}>
                  {notes[0].label}
                </p>
                <div className="mt-1 text-sm leading-6 text-slate-700"><NoteContent text={notes[0].text} /></div>
              </div>
            </div>
          ) : noteCount === 2 ? (
            <div className="grid grid-cols-2 gap-3">
              {notes.map((note) => (
                <div
                  key={note.label}
                  className={`rounded-2xl border-t-4 ${note.border} ${note.bg} p-4 text-center`}
                >
                  <p className={`text-[10px] font-semibold uppercase tracking-wider ${note.labelColor}`}>
                    {note.label}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-700">{note.text}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="-mx-5 sm:-mx-8">
              <div
                ref={scrollRef}
                className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-[15%] pb-1 scrollbar-hide sm:px-[20%]"
              >
                {notes.map((note) => (
                  <div
                    key={note.label}
                    className={`w-[70%] shrink-0 snap-center rounded-2xl border-t-4 ${note.border} ${note.bg} p-4 text-center sm:w-[60%]`}
                  >
                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${note.labelColor}`}>
                      {note.label}
                    </p>
                    <div className="mt-1 text-sm leading-6 text-slate-700"><NoteContent text={note.text} /></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {noteCount >= 3 ? (
        <CenterScrollEffect containerRef={scrollRef} />
      ) : null}
    </section>
  );
}

function NoteContent({ text }: { text: string }) {
  const notes = parseNotes(text);
  if (notes.length === 1) {
    return <p>{notes[0]}</p>;
  }
  return (
    <ol className="list-decimal space-y-1 pl-4 text-left">
      {notes.slice(0, 5).map((note, idx) => (
        <li key={idx}>{note}</li>
      ))}
    </ol>
  );
}

function CenterScrollEffect({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const middleCard = container.children[1] as HTMLElement | undefined;
    if (!middleCard) {
      return;
    }

    const scrollLeft =
      middleCard.offsetLeft - container.clientWidth / 2 + middleCard.clientWidth / 2;

    container.scrollTo({ left: scrollLeft, behavior: "smooth" });
  }, [containerRef]);

  return null;
}
