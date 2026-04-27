"use client";

import { useEffect, useState } from "react";

/**
 * Thin top progress bar that tracks reading progress within an article-like
 * container. Mounts as a fixed bar at the very top of the viewport.
 *
 * It anchors to a target element by id; progress = clamp(
 *   (viewportBottom - targetTop) / targetHeight, 0, 1
 * )
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;

    let ticking = false;

    const update = () => {
      const rect = target.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      if (total <= 0) {
        setProgress(rect.top <= 0 ? 1 : 0);
      } else {
        const scrolled = -rect.top;
        const ratio = Math.max(0, Math.min(1, scrolled / total));
        setProgress(ratio);
      }
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [targetId]);

  return (
    <div
      className="reading-progress"
      style={{ width: "100%", transform: `scaleX(${progress})` }}
      aria-hidden
    />
  );
}
