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
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [verseCount, setVerseCount] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const initialized = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize semantic search after idle delay
  useEffect(() => {
    if (!autoInitialize || initialized.current) return;
    if (typeof window === "undefined") return; // Skip on SSR
    
    // Wait for idle time before starting download
    initTimeoutRef.current = setTimeout(() => {
      startInitialization();
    }, idleDelay);
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoInitialize, idleDelay]);

  const startInitialization = useCallback(async () => {
    console.log("[useSemanticSearch] startInitialization() called");
    
    if (initialized.current) {
      console.log("[useSemanticSearch] Already initialized, skipping");
      return;
    }
    if (isInitializing) {
      console.log("[useSemanticSearch] Already initializing, skipping");
      return;
    }
    if (typeof window === "undefined") {
      console.log("[useSemanticSearch] Not in browser, skipping");
      return;
    }
    
    setIsInitializing(true);
    setError(null);
    setProgress(10);
    
    try {
      console.log("[useSemanticSearch] Loading semantic search module...");
      const semanticSearch = await loadSemanticSearch();
      
      console.log("[useSemanticSearch] Calling initializeSemanticSearch()...");
      await semanticSearch.initializeSemanticSearch();
      
      console.log("[useSemanticSearch] Getting status...");
      const status = semanticSearch.getSemanticSearchStatus();
      console.log(`[useSemanticSearch] Status: ready=${status.ready}, count=${status.verseCount}`);
      
      setVerseCount(status.verseCount);
      setIsReady(status.ready);
      
      if (status.ready) {
        setMode("semantic");
        console.log("[useSemanticSearch] ✅ AI Ready!");
      } else {
        console.log("[useSemanticSearch] ⚠️ AI not ready");
        setError("AI tidak tersedia. Data mungkin belum di-download.");
      }
      
      setProgress(100);
      initialized.current = true;
    } catch (err) {
      console.error("[useSemanticSearch] ❌ Initialization failed:", err);
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(`Error: ${errorMsg}`);
      setMode("keyword");
      setIsReady(false);
      initialized.current = true; // Mark as attempted
    } finally {
      setIsInitializing(false);
    }
  }, [isInitializing]);

  // Manual trigger for initialization
  const initialize = useCallback(async () => {
    // Cancel any pending auto-initialization
    if (initTimeoutRef.current) {
      clearTimeout(initTimeoutRef.current);
    }
    await startInitialization();
  }, [startInitialization]);

  // Search function that adapts based on mode
  const search = useCallback(async (
    query: string,
    keywordSearchFn: (q: string) => Promise<SearchResult[]>
  ): Promise<SearchResult[]> => {
    if (!query.trim()) return [];
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load semantic search module
      const semanticSearch = await loadSemanticSearch();
      
      // If semantic is ready, use it
      if (isReady && semanticSearch.isSemanticSearchReady()) {
        console.log("[useSemanticSearch] Using semantic search");
        const semanticResults = await semanticSearch.semanticSearch(query, 30);
        
        // If we got semantic results (they have score), fetch full details
        const hasScores = semanticResults.length > 0;
        
        if (hasScores) {
          // Return results with scores
          return semanticResults.map((result) => ({
            id: result.verse.id,
            surahId: result.verse.surahId,
            ayahNumber: result.verse.ayahNumber,
            surahNameIndonesian: result.verse.surahNameIndonesian,
            score: result.score,
          }));
        }
      }
      
      // Fallback to keyword search
      console.log("[useSemanticSearch] Using keyword fallback");
      return await keywordSearchFn(query);
      
    } catch (err) {
      console.error("[useSemanticSearch] Search error:", err);
      setError("Terjadi kesalahan saat mencari");
      // Fallback to keyword on error
      return await keywordSearchFn(query);
    } finally {
      setIsLoading(false);
    }
  }, [isReady]);

  // Clear cache and reinitialize
  const reset = useCallback(async () => {
    const semanticSearch = await loadSemanticSearch();
    await semanticSearch.clearSemanticSearchCache();
    initialized.current = false;
    setMode("keyword");
    setVerseCount(0);
    setIsReady(false);
    setProgress(0);
    await initialize();
  }, [initialize]);

  // Force refresh - clear IndexedDB cache and reload from server
  const refresh = useCallback(async () => {
    console.log("[useSemanticSearch] Force refreshing AI data...");
    const semanticSearch = await loadSemanticSearch();
    await semanticSearch.clearSemanticSearchCache();
    initialized.current = false;
    setMode("keyword");
    setVerseCount(0);
    setIsReady(false);
    setProgress(0);
    await startInitialization();
  }, [startInitialization]);

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
    reset,
    refresh,
  };
}
