"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SurahSearchOption = {
  id: number;
  nameLatin: string;
  meaning: string;
};

type SurahSearchControlProps = {
  surahs: SurahSearchOption[];
  className?: string;
  menuPosition?: "top" | "bottom";
  onOpenChange?: (open: boolean) => void;
};

function normalizeValue(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

export function SurahSearchControl({
  surahs,
  className = "",
  menuPosition = "bottom",
  onOpenChange,
}: SurahSearchControlProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const filteredSurahs = useMemo(() => {
    const trimmed = query.trim();

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
  }, [query, surahs]);

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    function updateViewportState() {
      setIsMobile(window.matchMedia("(max-width: 639px)").matches);
      setViewportHeight(
        Math.round(window.visualViewport?.height ?? window.innerHeight),
      );
    }

    updateViewportState();

    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const viewport = window.visualViewport;

    mediaQuery.addEventListener("change", updateViewportState);
    viewport?.addEventListener("resize", updateViewportState);
    viewport?.addEventListener("scroll", updateViewportState);
    window.addEventListener("resize", updateViewportState);

    return () => {
      mediaQuery.removeEventListener("change", updateViewportState);
      viewport?.removeEventListener("resize", updateViewportState);
      viewport?.removeEventListener("scroll", updateViewportState);
      window.removeEventListener("resize", updateViewportState);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    inputRef.current?.focus();

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        const panel = containerRef.current.querySelector("[data-surah-search-panel='true']");

        if (panel instanceof Node && panel.contains(target)) {
          return;
        }

        setOpen(false);
      }
    }

    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const mobilePanelStyle =
    isMobile && viewportHeight > 0
      ? {
          maxHeight: `${Math.max(280, viewportHeight - 24)}px`,
        }
      : undefined;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Cari surat"
        title="Cari surat"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 ${className}`.trim()}
      >
        Surat Lain
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 fill-none stroke-current stroke-2"
        >
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-4.35-4.35" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <>
          {isMobile ? (
            <button
              type="button"
              aria-label="Tutup pencarian surat"
              className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[1px]"
              onClick={() => setOpen(false)}
            />
          ) : null}
          <div
            data-surah-search-panel="true"
            style={mobilePanelStyle}
            className={`z-50 overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/95 p-2 text-left shadow-[0_24px_60px_-30px_rgba(15,23,42,0.8)] backdrop-blur ${
              isMobile
                ? "fixed inset-x-4 top-3"
                : `absolute w-[min(18rem,calc(100vw-2rem))] max-sm:left-0 max-sm:right-auto sm:right-0 ${
                    menuPosition === "top" ? "bottom-14" : "top-14"
                  }`
            }`}
          >
            <p className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Cari Surat
            </p>
            <div className="px-2 pb-2">
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Nomor, nama, atau arti surat"
                className="w-full rounded-[0.9rem] border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-400"
              />
            </div>
            <div className="max-h-72 overflow-y-auto px-2 pb-2 pr-1 max-sm:max-h-[min(22rem,calc(100dvh-7rem))]">
              <div className="grid gap-2">
                {filteredSurahs.map((surah) => (
                  <Link
                    key={surah.id}
                    href={`/surat/${surah.id}`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                    className="rounded-[0.95rem] border border-white/10 px-3 py-3 transition hover:bg-white/10"
                  >
                    <p className="text-sm font-semibold text-white">
                      {surah.id}. {surah.nameLatin}
                    </p>
                    <p className="mt-1 text-xs text-slate-300">{surah.meaning}</p>
                  </Link>
                ))}
              </div>
              {query.trim() && filteredSurahs.length === 0 ? (
                <p className="px-1 py-3 text-sm text-slate-400">
                  Surat tidak ditemukan.
                </p>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
