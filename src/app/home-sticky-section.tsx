"use client";

import { useEffect, useRef, useState } from "react";

export function HomeStickySection({
  controls,
  list,
  hideList,
}: {
  controls: React.ReactNode;
  list: React.ReactNode;
  hideList?: boolean;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsStuck(!entry.isIntersecting);
      },
      { root: null, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={`flex flex-col ${hideList ? "flex-1" : ""}`}>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />
      <div className="sticky top-0 z-20">
        <div
          className={`overflow-hidden border border-white/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(246,242,235,0.94))] shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] backdrop-blur transition-all duration-200 ${
            isStuck ? "rounded-none" : "rounded-[1.75rem]"
          }`}
        >
          {controls}
          {!hideList ? (
            <div className="border-t border-slate-200 bg-emerald-600 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.2em] text-white sm:px-5">
              Daftar Surat
            </div>
          ) : null}
        </div>
      </div>
      <div
        className={`overflow-hidden border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] transition-all duration-200 ${
          hideList ? "hidden" : ""
        } ${
          isStuck
            ? "mt-0 rounded-[1.75rem] rounded-t-none"
            : "mt-4 rounded-[1.75rem] rounded-t-none"
        }`}
      >
        {list}
      </div>
    </div>
  );
}
