"use client";

import { useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { HomeControls } from "./home-controls";
import { HomeStickySection } from "./home-sticky-section";
import { searchVersesAction, getVersesByIds } from "./actions";
import { VerseRecord } from "@/lib/quran-data";
import { HighlightedText } from "@/app/highlighted-text";
import { useSemanticSearch, SearchResult } from "@/lib/use-semantic-search";

type SurahOption = {
  id: number;
  nameLatin: string;
  meaning: string;
};

type HomeClientWrapperProps = {
  selectedSurah: string;
  selectedAyat: string;
  surahs: SurahOption[];
  list: React.ReactNode;
};

function CompactResultCard({ verse, query, score }: { verse: VerseRecord; query: string; score?: number }) {
  return (
    <Link
      href={`/ayat/${verse.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block rounded-[1.25rem] border border-slate-200 bg-[linear-gradient(180deg,#fcfbf7_0%,#f6f1e8_100%)] p-3 transition hover:bg-white sm:p-4"
    >
      <div className="flex items-center justify-between">
        <p className="truncate text-xs font-semibold text-slate-500">
          {verse.surahNameIndonesian} • Ayat {verse.ayahNumber}
        </p>
        {score !== undefined && (
          <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            {(score * 100).toFixed(0)}% match
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-right text-lg leading-[1.8] text-slate-950 sm:text-xl">
        {verse.arabicText}
      </p>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">
        <HighlightedText text={verse.translation} query={query} />
      </p>
      {verse.critique ? (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
          <HighlightedText text={verse.critique} query={query} />
        </p>
      ) : null}
    </Link>
  );
}

export function HomeClientWrapper({
  selectedSurah,
  selectedAyat,
  surahs,
  list,
}: HomeClientWrapperProps) {
  const [openPanel, setOpenPanel] = useState<"search" | "jump" | null>(null);
  const [results, setResults] = useState<VerseRecord[] | null>(null);
  const [semanticScores, setSemanticScores] = useState<Map<number, number>>(new Map());
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Semantic search hook - auto-initialize after 3 seconds idle
  const {
    mode: searchMode,
    isLoading: isSemanticLoading,
    isInitializing: isSemanticInitializing,
    isReady: isSemanticReady,
    verseCount: semanticVerseCount,
    error: semanticError,
    search: semanticSearch,
    refresh: refreshSemantic,
  } = useSemanticSearch({ autoInitialize: true, idleDelay: 3000 });

  const handleSearch = useCallback(async (q: string) => {
    setQuery(q);
    
    startTransition(async () => {
      // Define keyword search fallback
      const keywordSearch = async (searchQuery: string) => {
        return await searchVersesAction(searchQuery);
      };

      // Try semantic search if ready, otherwise fallback to keyword
      if (isSemanticReady) {
        try {
          const semanticResults = await semanticSearch(q, keywordSearch);
          
          // If we got semantic results (they have score), fetch full details
          const hasScores = semanticResults.some((r) => r.score !== undefined);
          
          if (hasScores && semanticResults.length > 0) {
            // Fetch full verse details
            const ids = semanticResults.map((r) => r.id);
            const fullVerses = await getVersesByIds(ids);
            
            // Create score map for display
            const scoreMap = new Map<number, number>();
            semanticResults.forEach((r) => {
              if (r.score !== undefined) {
                scoreMap.set(r.id, r.score);
              }
            });
            
            setSemanticScores(scoreMap);
            setResults(fullVerses);
            return;
          }
          
          // If semantic returned empty or no scores, use keyword results
          if (semanticResults.length > 0) {
            // These are already keyword search results
            setResults(semanticResults as unknown as VerseRecord[]);
            setSemanticScores(new Map());
            return;
          }
        } catch (err) {
          console.error("Semantic search failed, falling back to keyword:", err);
        }
      }
      
      // Fallback to pure keyword search
      const keywordResults = await keywordSearch(q);
      setResults(keywordResults);
      setSemanticScores(new Map());
    });
  }, [isSemanticReady, semanticSearch]);

  function handleResetSearch() {
    setResults(null);
    setQuery("");
    setSemanticScores(new Map());
  }

  const hasResults = results !== null;

  return (
    <div className="flex flex-1 flex-col gap-4">
      <HomeStickySection
        hideList={hasResults || openPanel !== null}
        controls={
          <HomeControls
            openPanel={openPanel}
            onPanelChange={(panel) => {
              setOpenPanel(panel);
              if (!panel) {
                handleResetSearch();
              }
            }}
            selectedSurah={selectedSurah}
            selectedAyat={selectedAyat}
            surahs={surahs}
            onSearch={handleSearch}
            onResetSearch={handleResetSearch}
            isSearching={isPending}
            searchMode={searchMode}
            isSemanticInitializing={isSemanticInitializing}
            isSemanticReady={isSemanticReady}
            semanticVerseCount={semanticVerseCount}
            semanticError={semanticError}
            onRefreshSemantic={refreshSemantic}
          />
        }
        list={list}
      />

      {hasResults ? (
        <section className="flex-1 rounded-[1.75rem] border border-slate-200 bg-white/92 p-4 shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-800">
              {results.length} ayat untuk &quot;{query}&quot;
              {searchMode === "semantic" && (
                <span className="ml-2 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  AI Search
                </span>
              )}
            </h2>
            <button
              type="button"
              onClick={handleResetSearch}
              className="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Tutup
            </button>
          </div>

          {results.length > 0 ? (
            <div className="mt-3 flex flex-col gap-2">
              {results.map((verse) => (
                <CompactResultCard 
                  key={verse.id} 
                  verse={verse} 
                  query={query}
                  score={semanticScores.get(verse.id)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-[1.25rem] border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              Tidak ada ayat yang cocok dengan kata kunci ini.
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
