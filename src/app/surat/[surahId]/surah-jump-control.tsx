"use client";

import { useMemo, useState } from "react";

type SurahJumpControlProps = {
  verseCount: number;
};

export function SurahJumpControl({ verseCount }: SurahJumpControlProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const ayahNumbers = useMemo(
    () => Array.from({ length: verseCount }, (_, index) => index + 1),
    [verseCount],
  );

  const filteredAyahNumbers = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      return ayahNumbers;
    }

    return ayahNumbers.filter((ayahNumber) =>
      String(ayahNumber).includes(trimmed),
    );
  }, [ayahNumbers, query]);

  function jumpToAyah(ayahNumber: number) {
    const target = document.getElementById(`ayat-${ayahNumber}`);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
    setQuery("");
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Lompat ke ayat"
        title="Lompat ke ayat"
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
          <path d="M8 7h8" strokeLinecap="round" />
          <path d="M8 12h8" strokeLinecap="round" />
          <path d="M8 17h5" strokeLinecap="round" />
        </svg>
        Ayat
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-20 w-56 overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/95 p-2 text-left shadow-[0_24px_60px_-30px_rgba(15,23,42,0.8)] backdrop-blur">
          <p className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Pilih Ayat
          </p>
          <div className="px-2 pb-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              inputMode="numeric"
              placeholder="Cari nomor ayat"
              className="w-full rounded-[0.9rem] border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400"
            />
          </div>
          <div className="max-h-56 overflow-y-auto px-2 pb-2 pr-1">
            <div className="grid grid-cols-3 gap-2">
              {filteredAyahNumbers.map((ayahNumber) => (
                <button
                  key={ayahNumber}
                  type="button"
                  onClick={() => jumpToAyah(ayahNumber)}
                  className="rounded-[0.9rem] border border-white/10 px-2 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {ayahNumber}
                </button>
              ))}
            </div>
            {filteredAyahNumbers.length === 0 ? (
              <p className="px-1 py-3 text-sm text-slate-400">
                Nomor ayat tidak ditemukan.
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
