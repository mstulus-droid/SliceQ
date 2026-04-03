"use client";

import { useState } from "react";
import { parseNotes } from "@/lib/parse-notes";

type VerseAnalysisDisclosuresProps = {
  critique: string;
  logicalFallacies: string;
  moralConcerns: string;
  scientificErrors: string;
  contradictions: string;
};

type PanelKey = "critique" | "fallacies" | "morals" | "science" | "contradictions" | null;

export function VerseAnalysisDisclosures({
  critique,
  logicalFallacies,
  moralConcerns,
  scientificErrors,
  contradictions,
}: VerseAnalysisDisclosuresProps) {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);

  const items = [
    critique
      ? {
          key: "critique" as const,
          label: "Critique",
          content: critique,
          icon: <span className="text-lg leading-none">✍️</span>,
          buttonClass:
            "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
          panelClass: "bg-slate-50 text-slate-700 ring-slate-200",
        }
      : null,
    logicalFallacies
      ? {
          key: "fallacies" as const,
          label: "Logical Fallacy",
          content: logicalFallacies,
          icon: <span className="text-lg leading-none">🤔</span>,
          buttonClass:
            "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100",
          panelClass: "bg-amber-50 text-slate-700 ring-amber-100",
        }
      : null,
    moralConcerns
      ? {
          key: "morals" as const,
          label: "Moral Concern",
          content: moralConcerns,
          icon: <span className="text-lg leading-none">😈</span>,
          buttonClass:
            "border-rose-200 bg-rose-50 text-rose-800 hover:bg-rose-100",
          panelClass: "bg-rose-50 text-slate-700 ring-rose-100",
        }
      : null,
    scientificErrors
      ? {
          key: "science" as const,
          label: "Scientific Error",
          content: scientificErrors,
          icon: <span className="text-lg leading-none">🔬</span>,
          buttonClass:
            "border-cyan-200 bg-cyan-50 text-cyan-800 hover:bg-cyan-100",
          panelClass: "bg-cyan-50 text-slate-700 ring-cyan-100",
        }
      : null,
    contradictions
      ? {
          key: "contradictions" as const,
          label: "Contradiction",
          content: contradictions,
          icon: <span className="text-lg leading-none">⚡</span>,
          buttonClass:
            "border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100",
          panelClass: "bg-violet-50 text-slate-700 ring-violet-100",
        }
      : null,
  ].filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {items.map((item) => {
          if (!item) {
            return null;
          }

          const isOpen = openPanel === item.key;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setOpenPanel((current) => (current === item.key ? null : item.key))}
              className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition ${item.buttonClass} ${
                isOpen ? "ring-2 ring-offset-2 ring-offset-white ring-current/20" : ""
              }`}
              aria-label={item.label}
              title={item.label}
            >
              {item.icon}
            </button>
          );
        })}
      </div>

      {items.map((item) => {
        if (!item || openPanel !== item.key) {
          return null;
        }

        const notes = parseNotes(item.content);

        return (
          <div
            key={item.key}
            className={`mt-4 rounded-[1.25rem] p-4 text-sm leading-7 ring-1 ${item.panelClass}`}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]">
              {item.label}
              {notes.length > 1 ? (
                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-current/15 px-1.5 text-[10px] font-bold tabular-nums">
                  {notes.length}
                </span>
              ) : null}
            </p>
            {notes.length === 1 ? (
              <div className="text-slate-700">{notes[0]}</div>
            ) : (
              <ol className="list-decimal space-y-2 pl-4 text-slate-700">
                {notes.slice(0, 5).map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ol>
            )}
          </div>
        );
      })}
    </div>
  );
}
