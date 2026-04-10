/**
 * Semantic Search - DISABLED (Fallback to keyword only)
 * 
 * Transformers.js tidak compatible dengan Next.js 16 + Turbopack.
 * Error: "Cannot convert undefined or null to object"
 * 
 * Solusi sementara: Gunakan keyword search saja.
 * Untuk semantic search full, perlu setup backend API terpisah 
 * atau gunakan service seperti OpenAI API.
 */

export type SearchMode = "keyword";

export function useSemanticSearch() {
  return {
    mode: "keyword" as const,
    isLoading: false,
    isInitializing: false,
    isReady: false,
    verseCount: 0,
    error: null,
    progress: 100,
    search: async (query: string, keywordSearchFn: (q: string) => Promise<unknown[]>) => {
      return keywordSearchFn(query);
    },
    initialize: async () => {},
    refresh: async () => {},
    reset: async () => {},
  };
}
