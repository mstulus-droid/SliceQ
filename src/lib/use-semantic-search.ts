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
  }, [autoInitialize, idleDelay]);

  const startInitialization = useCallback(async () => {
    if (initialized.current || isInitializing) return;
    if (typeof window === "undefined") return; // Skip on SSR
    
    setIsInitializing(true);
    setProgress(10);
    
    try {
      const semanticSearch = await loadSemanticSearch();
      await semanticSearch.initializeSemanticSearch();
      
      const status = semanticSearch.getSemanticSearchStatus();
      setVerseCount(status.verseCount);
      setIsReady(status.ready);
      
      if (status.ready) {
        setMode("semantic");
      }
      
      setProgress(100);
      initialized.current = true;
      
      console.log("[useSemanticSearch] Semantic search status:", status.ready ? "ready" : "not ready");
    } catch (err) {
      console.error("[useSemanticSearch] Initialization failed:", err);
      setError("Gagal memuat pencarian pintar");
      setMode("keyword");
      setIsReady(false);
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
  };
}
