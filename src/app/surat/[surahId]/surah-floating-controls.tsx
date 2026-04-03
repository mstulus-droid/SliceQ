"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SurahJumpControl } from "./surah-jump-control";
import { SurahSearchControl } from "./surah-search-control";

type SurahFloatingControlsProps = {
  verseCount: number;
  surahs: {
    id: number;
    nameLatin: string;
    meaning: string;
  }[];
};

const SHOW_AFTER_SCROLL_Y = 120;

export function SurahFloatingControls({
  verseCount,
  surahs,
}: SurahFloatingControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [activeMenu, setActiveMenu] = useState<"search" | "jump" | null>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function updateVisibility() {
      if (activeMenu) {
        setIsVisible(true);
        lastScrollY.current = window.scrollY;
        return;
      }

      const currentScrollY = window.scrollY;
      const header = document.getElementById("surah-header");
      const isHeaderVisible = header ? header.getBoundingClientRect().bottom > 0 : false;

      if (currentScrollY <= SHOW_AFTER_SCROLL_Y || isHeaderVisible) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY.current) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    }

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, [activeMenu]);

  const shouldShow = isVisible || activeMenu !== null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 transition-all duration-300 ${
        shouldShow
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
      aria-hidden={!shouldShow}
    >
      <div className="pointer-events-auto grid min-w-[min(100%,28rem)] grid-cols-[minmax(0,1fr)_48px_minmax(0,1fr)] items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 p-2 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
        <SurahSearchControl
          surahs={surahs}
          className="w-full justify-center"
          menuPosition="top"
          onOpenChange={(open) => setActiveMenu(open ? "search" : null)}
        />
        <Link
          href="/"
          aria-label="Kembali ke home"
          title="Kembali ke home"
          className="inline-flex h-11 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-800 transition hover:bg-slate-50"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5 fill-none stroke-current stroke-2"
          >
            <path
              d="M4 11.5L12 5l8 6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M6.5 10.5V19h11v-8.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <SurahJumpControl
          verseCount={verseCount}
          label="Cari Ayat"
          className="w-full justify-center"
          menuPosition="top"
          onOpenChange={(open) => setActiveMenu(open ? "jump" : null)}
        />
      </div>
    </div>
  );
}
