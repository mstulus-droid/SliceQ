"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SurahJumpControl } from "./surah-jump-control";

type SurahFloatingControlsProps = {
  verseCount: number;
};

const SHOW_AFTER_SCROLL_Y = 180;
const DIRECTION_DELTA = 8;

export function SurahFloatingControls({
  verseCount,
}: SurahFloatingControlsProps) {
  const [isVisible, setIsVisible] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    function updateVisibility() {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY.current;

      if (currentScrollY <= SHOW_AFTER_SCROLL_Y) {
        setIsVisible(false);
      } else if (difference <= -DIRECTION_DELTA) {
        setIsVisible(true);
      } else if (difference >= DIRECTION_DELTA) {
        setIsVisible(false);
      }

      lastScrollY.current = currentScrollY;
    }

    lastScrollY.current = window.scrollY;
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 bottom-5 z-40 flex justify-center px-4 transition-all duration-300 ${
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0"
      }`}
      aria-hidden={!isVisible}
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/95 p-2 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.45)] backdrop-blur">
        <Link
          href="/"
          aria-label="Kembali ke home"
          title="Kembali ke home"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-800 transition hover:bg-slate-50"
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
          className="px-5"
        />
      </div>
    </div>
  );
}
