"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SPLASH_STORAGE_KEY = "sliceq-initial-splash-shown";

export function InitialSplash() {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const hasShownSplash = window.sessionStorage.getItem(SPLASH_STORAGE_KEY);

    if (hasShownSplash) {
      setIsVisible(false);
      return undefined;
    }

    window.sessionStorage.setItem(SPLASH_STORAGE_KEY, "true");

    const startClosingTimer = window.setTimeout(() => {
      setIsClosing(true);
    }, 900);

    const hideTimer = window.setTimeout(() => {
      setIsVisible(false);
    }, 1280);

    return () => {
      window.clearTimeout(startClosingTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-[radial-gradient(circle_at_top,#efe6ce,transparent_34%),linear-gradient(180deg,#fbf6ea_0%,#f0e6d5_100%)] px-6 py-10 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <div className="relative aspect-[1120/1120] w-full max-w-[220px]">
        <Image
          src="/brand/sliceq-atasbawah.webp"
          alt=""
          fill
          priority
          sizes="220px"
          className="object-contain"
        />
      </div>
    </div>
  );
}
