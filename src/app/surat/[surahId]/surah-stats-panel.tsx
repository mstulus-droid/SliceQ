"use client";

import { useState, useEffect, useRef } from "react";
import type { VerseRecord } from "@/lib/quran-data";

type SurahStatsPanelProps = {
  verses: VerseRecord[];
  surahNameLatin: string;
};

type StatItem = {
  key: "logicalFallacies" | "scientificErrors" | "moralConcerns" | "contradictions";
  label: string;
  count: number;
  color: string;
  bgColor: string;
  borderColor: string;
};

type PopupVerse = {
  ayahNumber: number;
  content: string;
};

export function SurahStatsPanel({ verses, surahNameLatin }: SurahStatsPanelProps) {
  const [activePopup, setActivePopup] = useState<StatItem["key"] | null>(null);
  const [popupVerses, setPopupVerses] = useState<PopupVerse[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const totalVerses = verses.length;

  const logicalFallaciesCount = verses.filter((v) => v.logicalFallacies?.trim()).length;
  const scientificErrorsCount = verses.filter((v) => v.scientificErrors?.trim()).length;
  const moralConcernsCount = verses.filter((v) => v.moralConcerns?.trim()).length;
  const contradictionsCount = verses.filter((v) => v.contradictions?.trim()).length;

  const stats: StatItem[] = [
    {
      key: "logicalFallacies",
      label: "Logical Fallacies",
      count: logicalFallaciesCount,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      key: "scientificErrors",
      label: "Scientific Errors",
      count: scientificErrorsCount,
      color: "text-sky-600",
      bgColor: "bg-sky-50",
      borderColor: "border-sky-200",
    },
    {
      key: "moralConcerns",
      label: "Moral Concerns",
      count: moralConcernsCount,
      color: "text-rose-600",
      bgColor: "bg-rose-50",
      borderColor: "border-rose-200",
    },
    {
      key: "contradictions",
      label: "Contradiction",
      count: contradictionsCount,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
    },
  ];

  useEffect(() => {
    if (activePopup) {
      document.body.classList.add("overflow-hidden");
      const filtered = verses
        .filter((v) => {
          const content = {
            critique: v.critique,
            logicalFallacies: v.logicalFallacies,
            scientificErrors: v.scientificErrors,
            moralConcerns: v.moralConcerns,
            contradictions: v.contradictions,
          }[activePopup];
          return content?.trim();
        })
        .map((v) => ({
          ayahNumber: v.ayahNumber,
          content: {
            critique: v.critique,
            logicalFallacies: v.logicalFallacies,
            scientificErrors: v.scientificErrors,
            moralConcerns: v.moralConcerns,
            contradictions: v.contradictions,
          }[activePopup] || "",
        }));
      setPopupVerses(filtered);
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [activePopup, verses]);

  function handleCardClick(key: StatItem["key"]) {
    setActivePopup(key);
  }

  function closePopup() {
    setActivePopup(null);
    setPopupVerses([]);
  }

  function scrollToAyah(ayahNumber: number) {
    const element = document.getElementById(`ayat-${ayahNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    closePopup();
  }

  const activeStat = stats.find((s) => s.key === activePopup);

  return (
    <>
      <div className="rounded-[1.5rem] bg-white px-4 py-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)] sm:px-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map((stat) => {
            const percentage = totalVerses > 0 ? Math.round((stat.count / totalVerses) * 100) : 0;
            return (
              <button
                key={stat.key}
                type="button"
                onClick={() => handleCardClick(stat.key)}
                className={`relative overflow-hidden rounded-2xl border ${stat.borderColor} ${stat.bgColor} px-3 py-4 text-center transition hover:shadow-md sm:px-4`}
              >
                <p className={`text-2xl font-bold ${stat.color} sm:text-3xl`}>{percentage}%</p>
                <p className="mt-1 text-xs font-medium text-slate-600 sm:text-sm">{stat.label}</p>
                <p className="mt-0.5 text-xs text-slate-400">{stat.count} ayat</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Popup Modal */}
      {activePopup && activeStat && (
        <>
          {/* Backdrop */}
          <div
            onClick={closePopup}
            className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="relative w-full max-w-2xl max-h-[80vh] rounded-[1.5rem] bg-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.5)] overflow-hidden">
              {/* Header */}
              <div className={`px-6 py-4 border-b ${activeStat.borderColor} ${activeStat.bgColor}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-lg font-semibold ${activeStat.color}`}>
                      {activeStat.label}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {surahNameLatin} • {activeStat.count} ayat ({Math.round((activeStat.count / totalVerses) * 100)}%)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closePopup}
                    className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                    aria-label="Tutup"
                  >
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-none stroke-current stroke-2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div ref={scrollContainerRef} className="max-h-[60vh] overflow-y-auto p-4">
                {popupVerses.length === 0 ? (
                  <p className="py-8 text-center text-slate-500">Tidak ada ayat dengan catatan ini.</p>
                ) : (
                  <div className="space-y-3">
                    {popupVerses.map((verse) => (
                      <button
                        key={verse.ayahNumber}
                        type="button"
                        onClick={() => scrollToAyah(verse.ayahNumber)}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/50"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`shrink-0 rounded-lg ${activeStat.bgColor} ${activeStat.color} px-2.5 py-1 text-sm font-semibold`}>
                            {surahNameLatin} {verse.ayahNumber}
                          </span>
                          <p className="flex-1 text-sm leading-6 text-slate-700 line-clamp-3">
                            {verse.content}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
