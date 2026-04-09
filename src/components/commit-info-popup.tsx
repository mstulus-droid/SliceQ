"use client";

import { useState } from "react";
import { GIT_INFO } from "@/lib/git-info";

export function CommitInfoPopup({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  // Extract first line of commit message (the title)
  const commitTitle = GIT_INFO.message.split('\n')[0];

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
        aria-label="Lihat informasi versi"
        title="Klik untuk melihat versi"
      >
        {children}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-[100] bg-slate-950/40 backdrop-blur-[2px] transition-opacity"
            aria-hidden="true"
          />

          {/* Popup */}
          <div className="fixed left-1/2 top-1/2 z-[101] w-[min(90vw,24rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] border border-emerald-200/80 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.4)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-3">
              <span className="text-sm font-semibold text-emerald-800">
                Versi Aplikasi
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Tutup"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              {/* Commit Message */}
              <p className="text-sm font-medium text-slate-800">
                {commitTitle}
              </p>

              {/* Date */}
              <p className="mt-2 text-xs text-slate-500">
                {formatDate(GIT_INFO.date)}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
