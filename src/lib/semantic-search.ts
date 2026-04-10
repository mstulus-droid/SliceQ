/**
 * Semantic Search - DISABLED
 * 
 * Transformers.js tidak compatible dengan Next.js 16 + Turbopack.
 * Error saat load model: "Cannot convert undefined or null to object"
 * 
 * Solusi sementara: Nonaktifkan semantic search, gunakan keyword search.
 * Untuk mengaktifkan kembali, perlu setup backend API atau gunakan
 * service external seperti OpenAI API.
 */

export type VerseEmbedding = {
  id: number;
  surahId: number;
  ayahNumber: number;
  surahNameIndonesian: string;
  text: string;
  embedding: number[];
};

// Always return not ready - semantic search disabled
export function isSemanticSearchReady(): boolean {
  return false;
}

export async function initializeSemanticSearch(): Promise<void> {
  console.log("[SemanticSearch] Disabled - using keyword search only");
  return;
}

export async function semanticSearch(): Promise<never[]> {
  return [];
}

export function getSemanticSearchStatus() {
  return {
    ready: false,
    loading: false,
    verseCount: 0,
  };
}

export async function clearSemanticSearchCache(): Promise<void> {
  return;
}
