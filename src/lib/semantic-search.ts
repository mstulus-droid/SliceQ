/**
 * Semantic Search Utility
 * 
 * Features:
 * - Lazy load model and embeddings
 * - Cache in IndexedDB
 * - Cosine similarity search
 * - Fallback to keyword search
 */

// Using all-MiniLM-L6-v2: 384 dimensions, good balance of speed/quality
const MODEL_NAME = "Xenova/all-MiniLM-L6-v2";
const EMBEDDINGS_URL = "/embeddings/verses-embeddings.json";
const DB_NAME = "SliceQSemanticSearch";
const STORE_NAME = "embeddings";
const DB_VERSION = 1;

export type VerseEmbedding = {
  id: number;
  surahId: number;
  ayahNumber: number;
  surahNameIndonesian: string;
  text: string;
  embedding: number[];
};

type EmbeddingsData = {
  model: string;
  dimension: number;
  count: number;
  generatedAt: string;
  verses: VerseEmbedding[];
};

type SemanticSearchResult = {
  verse: VerseEmbedding;
  score: number;
};

// Dynamic import type
type Pipeline = import("@xenova/transformers").FeatureExtractionPipeline;

// Singleton state
let embedder: Pipeline | null = null;
let embeddingsData: EmbeddingsData | null = null;
let isLoading = false;
let loadingPromise: Promise<void> | null = null;

// Check if we're in browser
const isBrowser = typeof window !== "undefined" && typeof indexedDB !== "undefined";

// IndexedDB helpers
async function openDB(): Promise<IDBDatabase> {
  if (!isBrowser) {
    throw new Error("IndexedDB only available in browser");
  }
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function saveToIndexedDB(key: string, data: unknown): Promise<void> {
  if (!isBrowser) return;
  
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, key);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    // Silently fail
  }
}

async function loadFromIndexedDB(key: string): Promise<unknown | null> {
  if (!isBrowser) return null;
  
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onsuccess = () => resolve(request.result ?? null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}

// Load embeddings from network or cache
async function loadEmbeddings(): Promise<EmbeddingsData> {
  // Try IndexedDB first
  if (isBrowser) {
    const cached = await loadFromIndexedDB("embeddings-data");
    if (cached) {
      console.log("[SemanticSearch] Loaded embeddings from IndexedDB cache");
      return cached as EmbeddingsData;
    }
  }

  // Fetch from network
  console.log("[SemanticSearch] Fetching embeddings from server...");
  const response = await fetch(EMBEDDINGS_URL);
  if (!response.ok) {
    throw new Error(`Failed to load embeddings: ${response.status}`);
  }
  
  const data = await response.json() as EmbeddingsData;
  
  // Check if data is empty - throw early to avoid loading model
  if (!data.count || data.count === 0 || !data.verses || data.verses.length === 0) {
    console.log("[SemanticSearch] Embeddings file is empty, semantic search disabled");
    throw new Error("EMPTY_EMBEDDINGS");
  }
  
  // Save to IndexedDB for next time
  if (isBrowser) {
    try {
      await saveToIndexedDB("embeddings-data", data);
      console.log("[SemanticSearch] Saved embeddings to IndexedDB cache");
    } catch (err) {
      console.warn("[SemanticSearch] Failed to cache embeddings:", err);
    }
  }
  
  return data;
}

// Load the embedding model
async function loadModel(): Promise<Pipeline> {
  if (!isBrowser) {
    throw new Error("Model loading only available in browser");
  }
  
  // Dynamic import to avoid SSR issues
  const { pipeline } = await import("@xenova/transformers");
  
  console.log("[SemanticSearch] Loading model...", MODEL_NAME);
  const model = await pipeline("feature-extraction", MODEL_NAME, {
    quantized: true, // Use quantized model for smaller size
    revision: "main",
  });
  console.log("[SemanticSearch] Model loaded");
  
  return model;
}

// Quick check if embeddings file has data (before loading model)
async function checkEmbeddingsAvailable(): Promise<boolean> {
  try {
    const response = await fetch(EMBEDDINGS_URL, { method: "HEAD" });
    if (!response.ok) return false;
    
    // Try to load just the count from file
    const responseFull = await fetch(EMBEDDINGS_URL);
    const data = await responseFull.json() as EmbeddingsData;
    return data.count > 0 && data.verses.length > 0;
  } catch {
    return false;
  }
}

// Main initialization function
export async function initializeSemanticSearch(): Promise<void> {
  if (!isBrowser) {
    console.log("[SemanticSearch] Skipped - not in browser");
    return;
  }
  
  if (embeddingsData && embedder) {
    return; // Already initialized
  }
  
  if (isLoading && loadingPromise) {
    return loadingPromise; // Wait for existing load
  }
  
  isLoading = true;
  loadingPromise = (async () => {
    try {
      // Quick check first - avoid loading model if no data
      const hasData = await checkEmbeddingsAvailable();
      if (!hasData) {
        console.log("[SemanticSearch] No embeddings data available, skipping initialization");
        return;
      }
      
      // Load embeddings
      const embeddings = await loadEmbeddings();
      embeddingsData = embeddings;
      
      // Then load model
      const model = await loadModel();
      embedder = model;
      
      console.log(`[SemanticSearch] Ready! ${embeddings.count} verses indexed`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg === "EMPTY_EMBEDDINGS") {
        console.log("[SemanticSearch] Embeddings empty, using keyword search only");
      } else {
        console.error("[SemanticSearch] Initialization failed:", err);
      }
      // Don't throw - just mark as not ready
      embeddingsData = null;
      embedder = null;
    } finally {
      isLoading = false;
    }
  })();
  
  return loadingPromise;
}

// Check if semantic search is ready
export function isSemanticSearchReady(): boolean {
  return isBrowser && 
         embeddingsData !== null && 
         embedder !== null && 
         embeddingsData.count > 0 &&
         embeddingsData.verses.length > 0;
}

// Cosine similarity between two vectors
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  
  if (normA === 0 || normB === 0) return 0;
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Perform semantic search
export async function semanticSearch(
  query: string,
  limit: number = 30,
  minScore: number = 0.15 // Minimum similarity threshold
): Promise<SemanticSearchResult[]> {
  if (!embedder || !embeddingsData) {
    throw new Error("Semantic search not initialized. Call initializeSemanticSearch() first.");
  }
  
  if (!query.trim()) {
    return [];
  }
  
  // Generate embedding for query
  const output = await embedder(query.trim(), {
    pooling: "mean",
    normalize: true,
  });
  const queryEmbedding = Array.from(output.data as Float32Array);
  
  // Calculate similarity with all verses
  const results: SemanticSearchResult[] = [];
  
  for (const verse of embeddingsData.verses) {
    const score = cosineSimilarity(queryEmbedding, verse.embedding);
    if (score >= minScore) {
      results.push({ verse, score });
    }
  }
  
  // Sort by score descending and return top results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Clear cache (useful for debugging or force refresh)
export async function clearSemanticSearchCache(): Promise<void> {
  if (!isBrowser) return;
  
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    await store.clear();
    console.log("[SemanticSearch] Cache cleared");
  } catch (err) {
    console.error("[SemanticSearch] Failed to clear cache:", err);
  }
  
  // Reset state
  embedder = null;
  embeddingsData = null;
  isLoading = false;
  loadingPromise = null;
}

// Get current status for UI
export function getSemanticSearchStatus(): {
  ready: boolean;
  loading: boolean;
  verseCount: number;
} {
  return {
    ready: isSemanticSearchReady(),
    loading: isLoading,
    verseCount: embeddingsData?.count ?? 0,
  };
}
