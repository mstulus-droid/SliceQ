"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SurahOption = {
  id: number;
  nameLatin: string;
  meaning: string;
};

type HomeControlsProps = {
  quickQueries: string[];
  selectedSurah: string;
  selectedAyat: string;
  surahs: SurahOption[];
};

type PanelKey = "search" | "jump" | null;

export function HomeControls({
  quickQueries,
  selectedSurah,
  selectedAyat,
  surahs,
}: HomeControlsProps) {
  const router = useRouter();
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);
  const [surahQuery, setSurahQuery] = useState(selectedSurah);
  const [ayahQuery, setAyahQuery] = useState(selectedAyat);

  function normalizeValue(value: string) {
    return value
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "");
  }

  const filteredSurahs = useMemo(() => {
    const trimmed = surahQuery.trim();
    if (!trimmed) {
      return [];
    }

    const normalized = normalizeValue(trimmed);

    return surahs
      .filter((surah) => {
        const haystacks = [
          `${surah.id}`,
          surah.nameLatin,
          surah.meaning,
        ].map(normalizeValue);

        return haystacks.some((value) => value.includes(normalized));
      })
      .slice(0, 8);
  }, [surahQuery, surahs]);

  function handleJumpSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const directId = Number(surahQuery.trim());
    const selectedId =
      Number.isFinite(directId) && directId > 0
        ? directId
        : filteredSurahs[0]?.id;

    if (!selectedId) {
      return;
    }

    const params = new URLSearchParams();
    params.set("surah", String(selectedId));

    if (ayahQuery.trim()) {
      params.set("ayat", ayahQuery.trim());
    }

    router.push(`/?${params.toString()}`);
    setOpenPanel(null);
  }

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
            onSubmit={handleJumpSubmit}
            className="mt-4 rounded-[1.5rem] bg-[#faf7ef] p-4 ring-1 ring-amber-100"
        >
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
            Lompat Cepat
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-[1.2fr_0.8fr_auto]">
            <input
              value={surahQuery}
              onChange={(event) => setSurahQuery(event.target.value)}
              placeholder="Nomor, nama, atau arti surat"
              className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
            />
            <input
              value={ayahQuery}
              onChange={(event) => setAyahQuery(event.target.value)}
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

          {surahQuery.trim() ? (
            <div className="mt-3 rounded-[1rem] bg-white/70 p-2 ring-1 ring-amber-100">
              <div className="grid gap-2">
                {filteredSurahs.length > 0 ? (
                  filteredSurahs.map((surah) => (
                    <button
                      key={surah.id}
                      type="button"
                      onClick={() => setSurahQuery(surah.nameLatin)}
                      className="flex items-center justify-between rounded-[0.9rem] px-3 py-2 text-left transition hover:bg-white"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {surah.id}. {surah.nameLatin}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {surah.meaning}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-slate-500">
                    Tidak ada surat yang cocok.
                  </p>
                )}
              </div>
            </div>
          ) : null}
        </form>
      ) : null}
    </div>
  );
}
