"use client";

import { useState } from "react";

type VerseAnalysisDisclosuresProps = {
  critique: string;
  logicalFallacies: string;
  moralConcerns: string;
};

type PanelKey = "critique" | "fallacies" | "morals" | null;

export function VerseAnalysisDisclosures({
  critique,
  logicalFallacies,
  moralConcerns,
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

        return (
          <div
            key={item.key}
            className={`mt-4 rounded-[1.25rem] p-4 text-sm leading-7 ring-1 ${item.panelClass}`}
          >
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]">
              {item.label}
            </p>
            {item.content}
          </div>
        );
      })}
    </div>
  );
}
