"use client";

import { useEffect, useState } from "react";

type SurahStickyTitleProps = {
  title: string;
  targetId?: string;
};

const SHOW_AFTER_SCROLL_Y = 220;

export function SurahStickyTitle({
  title,
  targetId = "surah-header",
}: SurahStickyTitleProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsVisible(window.scrollY > SHOW_AFTER_SCROLL_Y);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  function scrollToHeader() {
    const target = document.getElementById(targetId);

    if (!target) {
      return;
    }

    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 top-0 z-30 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
      aria-hidden={!isVisible}
    >
      <div className="bg-[radial-gradient(circle_at_top_right,#17412f,transparent_35%),linear-gradient(180deg,#0f172a_0%,#16212f_100%)] px-5 py-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.75)] sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl text-center">
          <button
            type="button"
            onClick={scrollToHeader}
            className="pointer-events-auto block w-full truncate text-base font-semibold tracking-[0.08em] text-white"
          >
            {title}
          </button>
        </div>
      </div>
    </div>
  );
}
