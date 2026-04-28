"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { parseNotes } from "@/lib/parse-notes";
import { useNavigation } from "@/components/navigation-provider";
import { MarkdownText } from "@/components/markdown-text";
import { ReadingSizeToggle, useReadingPrefs } from "./use-reading-prefs";

type VerseReaderCardProps = {
  arabicText: string;
  translation: string;
  catatanDepag?: string;
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
  catatanDepag,
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
  const { prefs, setSize, tokens } = useReadingPrefs();

  function goToVerse(targetVerseId: number | null) {
    if (!targetVerseId) {
      return;
    }

    startNavigation();
    router.push(`/ayat/${targetVerseId}`);
  }

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (isTyping) return;

      if (event.key === "ArrowLeft" && previousVerseId) {
        event.preventDefault();
        goToVerse(previousVerseId);
      } else if (event.key === "ArrowRight" && nextVerseId) {
        event.preventDefault();
        goToVerse(nextVerseId);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previousVerseId, nextVerseId]);

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
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Bacaan
        </p>
        <ReadingSizeToggle value={prefs.size} onChange={setSize} />
      </div>

      {asbabunNuzul ? (
        <div className="mb-6 reading-measure rounded-[1.25rem] bg-amber-50/70 p-4 ring-1 ring-amber-100">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
            Asbabun Nuzul
          </p>
          <p className="font-serif-reading mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
            <MarkdownText text={asbabunNuzul} />
          </p>
        </div>
      ) : null}

      <div className="mb-5 reading-measure">
        <p className="text-sm leading-7 text-slate-700">
          <span className="mr-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
            Topik
          </span>
          <MarkdownText text={topic || "Belum ada ringkasan topik untuk ayat ini."} />
        </p>
      </div>

      <div className="flex items-stretch overflow-hidden rounded-[1.5rem] ring-1 ring-slate-200 bg-[linear-gradient(180deg,#faf8f1_0%,#ffffff_100%)] paper-texture">
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
          <div className="reading-measure">
            <p
              className={`font-arabic text-right text-slate-950 ${tokens.arabic}`}
            >
              {arabicText}
            </p>
            <div className="ornament-divider my-4" aria-hidden>
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path
                  d="M7 1 L9 5 L13 7 L9 9 L7 13 L5 9 L1 7 L5 5 Z"
                  fill="currentColor"
                  opacity="0.7"
                />
              </svg>
            </div>
            <p
              className={`font-serif-reading mt-1 text-slate-700 ${tokens.translation}`}
            >
              <MarkdownText text={translation} />
            </p>
            {catatanDepag ? (
              <div className="mt-5 rounded-[1.25rem] bg-amber-50/60 p-4 ring-1 ring-amber-100/80">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700">
                  Catatan Depag
                </p>
                <p className="font-serif-reading mt-1 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  <MarkdownText text={catatanDepag} />
                </p>
              </div>
            ) : null}
          </div>
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
                <div className="font-serif-reading mt-1 text-sm leading-6 text-slate-700">
                  <NoteContent text={notes[0].text} />
                </div>
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
                  <p className="font-serif-reading mt-1 text-sm leading-6 text-slate-700">
                    <MarkdownText text={note.text} />
                  </p>
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
                    <div className="font-serif-reading mt-1 text-sm leading-6 text-slate-700">
                      <NoteContent text={note.text} />
                    </div>
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
    return <p className="whitespace-pre-wrap"><MarkdownText text={notes[0]} /></p>;
  }
  return (
    <ol className="list-decimal space-y-1 pl-4 text-left">
      {notes.slice(0, 5).map((note, idx) => (
        <li key={idx} className="whitespace-pre-wrap"><MarkdownText text={note} /></li>
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
