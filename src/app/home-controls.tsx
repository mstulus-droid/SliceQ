"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type SurahOption = {
  id: number;
  nameLatin: string;
  meaning: string;
};

type HomeControlsProps = {
  openPanel: "search" | "jump" | null;
  onPanelChange: (panel: "search" | "jump" | null) => void;
  selectedSurah: string;
  selectedAyat: string;
  surahs: SurahOption[];
  onSearch?: (query: string) => void;
  onResetSearch?: () => void;
  isSearching?: boolean;

};

export function HomeControls({
  openPanel,
  onPanelChange,
  selectedSurah,
  selectedAyat,
  surahs,
  onSearch,
  onResetSearch,
  isSearching,

}: HomeControlsProps) {
  const router = useRouter();
  const [surahQuery, setSurahQuery] = useState(selectedSurah);
  const [ayahQuery, setAyahQuery] = useState(selectedAyat);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const jumpInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (openPanel === "search") {
      searchInputRef.current?.focus();
    } else if (openPanel === "jump") {
      jumpInputRef.current?.focus();
    }
  }, [openPanel]);

  useEffect(() => {
    if (openPanel !== "search") {
      setSearchQuery("");
    }
  }, [openPanel]);

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
    onPanelChange(null);
  }

  function togglePanel(panel: "search" | "jump") {
    const next = openPanel === panel ? null : panel;
    onPanelChange(next);
    if (!next) {
      onResetSearch?.();
    }
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = searchQuery.trim();
    if (q && onSearch) {
      onSearch(q);
    }
  }

  function handleClearSearch() {
    setSearchQuery("");
    searchInputRef.current?.focus();
  }

  return (
    <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,242,235,0.94))] p-4 backdrop-blur sm:p-6">
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
        <a
          href="/bookmark"
          className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          Bookmark
        </a>
      </div>

      {openPanel === "search" ? (
        <form
          onSubmit={handleSearchSubmit}
          className="mt-4 rounded-[1.5rem] bg-[#171717] p-4 text-white shadow-[0_18px_50px_-36px_rgba(15,23,42,0.8)]"
        >
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-[1rem] bg-white px-4 py-3">
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari tema, kritik, logical fallacy, atau terjemahan"
                className="min-w-0 flex-1 bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-slate-300 hover:text-slate-700"
                  aria-label="Hapus"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                  </svg>
                </button>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60"
            >
              {isSearching ? "Mencari..." : "Cari"}
            </button>
          </div>
        </form>
      ) : null}

      {openPanel === "jump" ? (
        <form
          onSubmit={handleJumpSubmit}
          className="mt-4 rounded-[1.5rem] bg-[#faf7ef] p-4 ring-1 ring-amber-100"
        >
          <div className="grid gap-3 sm:grid-cols-[1.2fr_0.8fr_auto]">
            <div className="flex items-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
              <input
                ref={jumpInputRef}
                value={surahQuery}
                onChange={(event) => setSurahQuery(event.target.value)}
                placeholder="Nomor, nama, atau arti surat"
                className="min-w-0 flex-1 bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
              />
              {surahQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSurahQuery("");
                    jumpInputRef.current?.focus();
                  }}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-slate-300 hover:text-slate-700"
                  aria-label="Hapus"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                  </svg>
                </button>
              ) : null}
            </div>
            <div className="flex items-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 py-3">
              <input
                value={ayahQuery}
                onChange={(event) => setAyahQuery(event.target.value)}
                inputMode="numeric"
                placeholder="Nomor ayat"
                className="min-w-0 flex-1 bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
              />
              {ayahQuery ? (
                <button
                  type="button"
                  onClick={() => setAyahQuery("")}
                  className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 transition hover:bg-slate-300 hover:text-slate-700"
                  aria-label="Hapus"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                    <path d="M18.3 5.71a.996.996 0 00-1.41 0L12 10.59 7.11 5.7A.996.996 0 105.7 7.11L10.59 12 5.7 16.89a.996.996 0 101.41 1.41L12 13.41l4.89 4.89a.996.996 0 101.41-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z" />
                  </svg>
                </button>
              ) : null}
            </div>
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
