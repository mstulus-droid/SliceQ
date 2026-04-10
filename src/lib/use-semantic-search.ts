"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Dynamic import to avoid SSR issues with Transformers.js
async function loadSemanticSearch() {
  const mod = await import("./semantic-search");
  return mod;
}

// Re-export types
export type SearchMode = "keyword" | "semantic" | "hybrid";

export type SearchResult = {
  id: number;
  surahId: number;
  ayahNumber: number;
  surahNameIndonesian: string;
  surahNameArabic?: string;
  arabicText?: string;
  translation?: string;
  critique?: string;
  topic?: string;
  logicalFallacies?: string;
  moralConcerns?: string;
  scientificErrors?: string;
  contradictions?: string;
  score?: number; // For semantic search
};

type UseSemanticSearchOptions = {
  autoInitialize?: boolean;
  idleDelay?: number; // Delay before initializing (ms)
};

export function useSemanticSearch(options: UseSemanticSearchOptions = {}) {
  const { autoInitialize = true, idleDelay = 3000 } = options;
  
  const [mode, setMode] = useState<SearchMode>("keyword");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(100);
  const [error, setError] = useState<string | null>(null);
  const [verseCount, setVerseCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const initialized = useRef(false);

  // Semantic search disabled - just mark as initialized
  useEffect(() => {
    if (!autoInitialize || initialized.current) return;
    if (typeof window === "undefined") return;
    
    // Just mark as done - using keyword search
    initialized.current = true;
    setMode("keyword");
    setIsReady(false);
    setVerseCount(0);
    setProgress(100);
    
    console.log("[useSemanticSearch] Semantic search disabled - using keyword search");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoInitialize]);

  // Search function - always use keyword
  const search = useCallback(async (
    query: string,
    keywordSearchFn: (q: string) => Promise<SearchResult[]>
  ): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    setIsLoading(true);
    
    try {
      // Always use keyword search
      return await keywordSearchFn(query);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // No-op functions
  const initialize = useCallback(async () => {}, []);
  const refresh = useCallback(async () => {}, []);
  const reset = useCallback(async () => {}, []);

  return {
    mode,
    isLoading,
    isInitializing,
    progress,
    error,
    verseCount,
    isReady,
    search,
    initialize,
    refresh,
    reset,
  };
}
