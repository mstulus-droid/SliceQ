"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "sliceq-reading-prefs";

type Prefs = {
  size: "compact" | "regular" | "large";
};

const DEFAULT_PREFS: Prefs = { size: "regular" };

const SIZE_TOKENS: Record<
  Prefs["size"],
  {
    arabic: string;
    translation: string;
    label: string;
  }
> = {
  compact: {
    arabic: "text-2xl leading-[1.9] sm:text-3xl",
    translation: "text-sm leading-7 sm:text-base",
    label: "S",
  },
  regular: {
    arabic: "text-3xl leading-[2.1] sm:text-5xl",
    translation: "text-base leading-8 sm:text-lg",
    label: "M",
  },
  large: {
    arabic: "text-4xl leading-[2.2] sm:text-6xl",
    translation: "text-lg leading-9 sm:text-xl",
    label: "L",
  },
};

function readPrefs(): Prefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    if (
      parsed.size === "compact" ||
      parsed.size === "regular" ||
      parsed.size === "large"
    ) {
      return { size: parsed.size };
    }
  } catch {
    /* fall through */
  }
  return DEFAULT_PREFS;
}

function writePrefs(prefs: Prefs) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}

export function useReadingPrefs() {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);

  useEffect(() => {
    setPrefs(readPrefs());
  }, []);

  const setSize = (size: Prefs["size"]) => {
    const next = { size };
    setPrefs(next);
    writePrefs(next);
  };

  return {
    prefs,
    setSize,
    tokens: SIZE_TOKENS[prefs.size],
  };
}

export function ReadingSizeToggle({
  value,
  onChange,
}: {
  value: Prefs["size"];
  onChange: (size: Prefs["size"]) => void;
}) {
  const sizes: Array<{ key: Prefs["size"]; label: string; aria: string }> = [
    { key: "compact", label: "S", aria: "Ukuran kecil" },
    { key: "regular", label: "M", aria: "Ukuran sedang" },
    { key: "large", label: "L", aria: "Ukuran besar" },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Ukuran teks bacaan"
      className="inline-flex items-center gap-1 rounded-full bg-slate-100/80 p-1 ring-1 ring-slate-200"
    >
      {sizes.map((s) => {
        const active = s.key === value;
        return (
          <button
            key={s.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={s.aria}
            onClick={() => onChange(s.key)}
            className={`h-7 w-7 rounded-full text-[11px] font-semibold transition ${
              active
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-600 hover:bg-white"
            }`}
          >
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
