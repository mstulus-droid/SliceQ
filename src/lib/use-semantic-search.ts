"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  initializeSemanticSearch,
  isSemanticSearchReady,
  semanticSearch,
  getSemanticSearchStatus,
  VerseEmbedding,
  clearSemanticSearchCache,
} from "./semantic-search";

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
  
  const initialized = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize semantic search after idle delay
  useEffect(() => {
    if (!autoInitialize || initialized.current) return;
    
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
    
    setIsInitializing(true);
    setProgress(10);
    
    try {
      await initializeSemanticSearch();
      
      const status = getSemanticSearchStatus();
      setVerseCount(status.verseCount);
      setMode("semantic");
      setProgress(100);
      initialized.current = true;
      
      console.log("[useSemanticSearch] Semantic search ready!");
    } catch (err) {
      console.error("[useSemanticSearch] Initialization failed:", err);
      setError("Gagal memuat pencarian pintar");
      setMode("keyword");
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
      // If semantic is ready, use it
      if (mode === "semantic" && isSemanticSearchReady()) {
        console.log("[useSemanticSearch] Using semantic search");
        const semanticResults = await semanticSearch(query, 30);
        
        return semanticResults.map((result) => ({
          id: result.verse.id,
          surahId: result.verse.surahId,
          ayahNumber: result.verse.ayahNumber,
          surahNameIndonesian: result.verse.surahNameIndonesian,
          score: result.score,
          // These will be fetched from server when needed
          // For now we return basic info
        }));
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
  }, [mode]);

  // Clear cache and reinitialize
  const reset = useCallback(async () => {
    await clearSemanticSearchCache();
    initialized.current = false;
    setMode("keyword");
    setVerseCount(0);
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
    isReady: isSemanticSearchReady(),
    search,
    initialize,
    reset,
  };
}
