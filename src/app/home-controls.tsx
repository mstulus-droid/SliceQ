"use client";

import Link from "next/link";
import { useState } from "react";

type HomeControlsProps = {
  quickQueries: string[];
  selectedSurah: string;
  selectedAyat: string;
};

type PanelKey = "search" | "jump" | null;

export function HomeControls({
  quickQueries,
  selectedSurah,
  selectedAyat,
}: HomeControlsProps) {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);

  function togglePanel(panel: Exclude<PanelKey, null>) {
    setOpenPanel((current) => (current === panel ? null : panel));
  }

  return (
    <div className="rounded-[1.75rem] border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,242,235,0.94))] p-4 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => togglePanel("search")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            openPanel === "search"
              ? "bg-[#171717] text-white"
              : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
          }`}
        >
          Cari Kata
        </button>
        <button
          type="button"
          onClick={() => togglePanel("jump")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            openPanel === "jump"
              ? "bg-[#171717] text-white"
              : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
          }`}
        >
          Lompat Cepat
        </button>
        <Link
          href="/bookmark"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Bookmark
        </Link>
      </div>

        {openPanel === "search" ? (
          <form
            action="/"
            className="mt-4 rounded-[1.5rem] bg-[#171717] p-4 text-white shadow-[0_18px_50px_-36px_rgba(15,23,42,0.8)]"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
            Cari Kata
          </p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1 rounded-[1rem] bg-white px-4 py-3">
              <input
                name="q"
                placeholder="Cari tema, kritik, logical fallacy, atau terjemahan"
                className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
            >
              Cari
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
            {quickQueries.map((item) => (
              <Link
                key={item}
                href={`/?q=${encodeURIComponent(item)}`}
                className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/10"
              >
                {item}
              </Link>
            ))}
          </div>
        </form>
      ) : null}

        {openPanel === "jump" ? (
          <form
            action="/"
            className="mt-4 rounded-[1.5rem] bg-[#faf7ef] p-4 ring-1 ring-amber-100"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Lompat Cepat
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input
              name="surah"
              defaultValue={selectedSurah}
              inputMode="numeric"
              placeholder="Nomor surat"
              className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
            />
            <input
              name="ayat"
              defaultValue={selectedAyat}
              inputMode="numeric"
              placeholder="Nomor ayat"
              className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="rounded-full bg-[#171717] px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-fit"
            >
              Lompat
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
