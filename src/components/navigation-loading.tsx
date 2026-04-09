"use client";

import { useNavigation } from "./navigation-provider";

export function NavigationLoading() {
  const { isNavigating } = useNavigation();

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/20 backdrop-blur-[2px]">
      <div className="relative flex flex-col items-center">
        {/* Glow backdrop */}
        <div className="absolute -inset-10 rounded-full bg-emerald-400/20 blur-3xl" />

        {/* Spinner rings */}
        <div className="relative">
          <div className="absolute inset-0 h-16 w-16 animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-emerald-200/80" />
          <div className="absolute -inset-2 h-20 w-20 animate-[spin_2s_linear_infinite_reverse] rounded-full border-2 border-dotted border-emerald-300/60" />

          {/* Icon container with pulse */}
          <div className="relative flex h-16 w-16 items-center justify-center rounded-xl bg-white shadow-lg">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 animate-pulse text-emerald-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-emerald-800">Memuat...</p>
      </div>
    </div>
  );
}
