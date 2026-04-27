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
      className={`sliceq-splash pointer-events-none fixed inset-0 z-[100] flex items-center justify-center px-6 py-10 transition-opacity duration-300 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      aria-hidden="true"
    >
      <span className="sliceq-splash__line sliceq-splash__line--top" />
      <span className="sliceq-splash__line sliceq-splash__line--bottom" />
      <span className="sliceq-splash__vignette" />
      <div className="sliceq-splash__logo relative aspect-[1120/1120] w-full max-w-[220px]">
        <Image
          src="/brand/sliceq-atasbawah.webp"
          alt=""
          fill
          priority
          sizes="220px"
          className="object-contain"
        />
      </div>
      <style jsx>{`
        .sliceq-splash {
          background:
            radial-gradient(circle at 50% 48%, #f4ead2 0%, #e8dcbf 50%, #c8b386 110%);
        }
        .sliceq-splash__line {
          position: absolute;
          left: 50%;
          width: 1px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(168, 133, 63, 0.55),
            transparent
          );
          height: 0;
          opacity: 0;
          transform: translateX(-50%);
          animation: sliceq-line 1400ms cubic-bezier(0.22, 0.61, 0.36, 1) forwards;
        }
        .sliceq-splash__line--top { top: 0; }
        .sliceq-splash__line--bottom { bottom: 0; }
        .sliceq-splash__vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            circle at 50% 50%,
            transparent 38%,
            rgba(43, 36, 24, 0.18) 100%
          );
          opacity: 0;
          animation: sliceq-vignette 1400ms ease forwards;
        }
        .sliceq-splash__logo {
          opacity: 0;
          transform: scale(0.96);
          animation: sliceq-breath 1400ms cubic-bezier(0.37, 0, 0.63, 1) 100ms forwards;
        }
        @keyframes sliceq-line {
          0%   { height: 0; opacity: 0; }
          40%  { opacity: 1; }
          100% { height: 28%; opacity: 0.6; }
        }
        @keyframes sliceq-vignette {
          0%   { opacity: 0; }
          100% { opacity: 1; }
        }
        @keyframes sliceq-breath {
          0%   { opacity: 0; transform: scale(0.96); }
          35%  { opacity: 1; transform: scale(1.02); }
          70%  { transform: scale(0.995); }
          100% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sliceq-splash__line,
          .sliceq-splash__vignette,
          .sliceq-splash__logo {
            animation: none;
            opacity: 1;
            transform: none;
          }
          .sliceq-splash__line { height: 28%; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
