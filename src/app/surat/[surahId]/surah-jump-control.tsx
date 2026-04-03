"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SurahJumpControlProps = {
  verseCount: number;
  label?: string;
  className?: string;
  menuPosition?: "top" | "bottom";
  onOpenChange?: (open: boolean) => void;
};

export function SurahJumpControl({
  verseCount,
  label = "Ke Ayat",
  className = "",
  menuPosition = "bottom",
  onOpenChange,
}: SurahJumpControlProps) {
  const [open, setOpen] = useState(false);
  const [activeAyah, setActiveAyah] = useState(1);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);

  const ayahNumbers = useMemo(
    () => Array.from({ length: verseCount }, (_, index) => index + 1),
    [verseCount],
  );

  useEffect(() => {
    onOpenChange?.(open);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }

    function handleScroll() {
      setOpen(false);
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;

      if (
        target instanceof Node &&
        containerRef.current &&
        !containerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointerdown", handlePointerDown);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  useEffect(() => {
    const ayahElements = Array.from(
      document.querySelectorAll<HTMLElement>("[id^='ayat-']"),
    );

    if (ayahElements.length === 0) {
      return undefined;
    }

    function updateActiveAyah() {
      const focusLine = window.innerHeight * 0.32;
      let closestAyah = 1;
      let closestDistance = Number.POSITIVE_INFINITY;

      for (const element of ayahElements) {
        const id = element.id.replace("ayat-", "");
        const ayahNumber = Number(id);

        if (!Number.isFinite(ayahNumber)) {
          continue;
        }

        const rect = element.getBoundingClientRect();
        const distance = Math.abs(rect.top - focusLine);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestAyah = ayahNumber;
        }
      }

      setActiveAyah(closestAyah);
    }

    updateActiveAyah();
    window.addEventListener("scroll", updateActiveAyah, { passive: true });
    window.addEventListener("resize", updateActiveAyah);

    return () => {
      window.removeEventListener("scroll", updateActiveAyah);
      window.removeEventListener("resize", updateActiveAyah);
    };
  }, []);

  useEffect(() => {
    if (!open || !activeButtonRef.current) {
      return;
    }

    activeButtonRef.current.scrollIntoView({
      block: "center",
      inline: "nearest",
    });
  }, [activeAyah, open]);

  function jumpToAyah(ayahNumber: number) {
    const target = document.getElementById(`ayat-${ayahNumber}`);
    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Ke ayat"
        title="Ke ayat"
        onClick={() => setOpen((current) => !current)}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-full bg-emerald-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 ${className}`.trim()}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-2">
          <path d="M8 7h8" strokeLinecap="round" />
          <path d="M8 12h8" strokeLinecap="round" />
          <path d="M8 17h5" strokeLinecap="round" />
        </svg>
        {label}
      </button>

      {open ? (
        <div
          className={`absolute right-0 z-50 w-56 overflow-hidden rounded-[1.25rem] border border-white/10 bg-slate-950/95 p-2 text-left shadow-[0_24px_60px_-30px_rgba(15,23,42,0.8)] backdrop-blur ${
            menuPosition === "top" ? "bottom-14" : "top-14"
          }`}
        >
          <div className="max-h-56 overflow-y-auto px-2 py-2 pr-1">
            <div className="grid grid-cols-3 gap-2">
              {ayahNumbers.map((ayahNumber) => (
                <button
                  key={ayahNumber}
                  ref={ayahNumber === activeAyah ? activeButtonRef : null}
                  type="button"
                  onClick={() => jumpToAyah(ayahNumber)}
                  className={`rounded-[0.9rem] border px-2 py-2 text-sm font-semibold transition ${
                    ayahNumber === activeAyah
                      ? "border-emerald-300 bg-emerald-300 text-slate-950"
                      : "border-white/10 text-white hover:bg-white/10"
                  }`}
                >
                  {ayahNumber}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
