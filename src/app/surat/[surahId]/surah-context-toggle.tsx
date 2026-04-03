"use client";

import { useState } from "react";

type SurahContextToggleProps = {
  context: string;
};

export function SurahContextToggle({ context }: SurahContextToggleProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full flex-col items-center justify-center gap-1 rounded-[1.25rem] border border-white/10 bg-white/8 px-4 py-3 text-center transition hover:bg-white/12 animate-[subtle-pulse_3s_ease-in-out_infinite]"
      >
        <span className="text-sm font-semibold text-emerald-200">
          Konteks & Kritik
        </span>
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-white/80 transition-transform duration-300 animate-[hint-bounce_2s_ease-in-out_infinite] ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-none stroke-current stroke-2"
          >
            <path
              d="M6 9l6 6 6-6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ${
          isOpen ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="whitespace-pre-line rounded-[1.25rem] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-7 text-slate-200">
            {context}
          </p>
        </div>
      </div>
    </div>
  );
}
