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

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="cursor-pointer"
        aria-label="Lihat informasi versi"
        title="Klik untuk melihat versi commit"
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
          <div className="fixed left-1/2 top-1/2 z-[101] w-[min(90vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-emerald-200/80 bg-white shadow-[0_24px_60px_-20px_rgba(15,23,42,0.4)]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-emerald-100 px-5 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2L2 7l10 5 10-5-10-5z" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 17l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M2 12l10 5 10-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-emerald-800">
                  Informasi Versi
                </span>
              </div>
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
            <div className="px-5 py-5">
              {/* Commit Hash */}
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Commit Hash
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-mono font-semibold text-emerald-700">
                    {GIT_INFO.hash}
                  </code>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                    {GIT_INFO.branch}
                  </span>
                </div>
              </div>

              {/* Date */}
              <div className="mb-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Tanggal Build
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(GIT_INFO.date)}
                </p>
              </div>

              {/* Commit Message */}
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Pesan Commit
                </p>
                <div className="mt-1 rounded-xl bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                    {GIT_INFO.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-center text-xs text-slate-400">
                SliceQ © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
}
