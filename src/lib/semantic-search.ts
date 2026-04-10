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
const DB_NAME = "SliceQSemanticSearch";
const STORE_NAME = "embeddings";
const DB_VERSION = 2; // Increment to force cache refresh

// Version-based cache busting - update this when embeddings change
const EMBEDDINGS_VERSION = "v2-full-6236";
const EMBEDDINGS_URL = `/embeddings/verses-embeddings.json?version=${EMBEDDINGS_VERSION}`;

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
    console.log("[SemanticSearch] Checking IndexedDB cache...");
    const cached = await loadFromIndexedDB("embeddings-data");
    if (cached) {
      const cachedData = cached as EmbeddingsData;
      console.log(`[SemanticSearch] Loaded from IndexedDB: ${cachedData.count} verses`);
      if (cachedData.count > 0) {
        return cachedData;
      }
      console.log("[SemanticSearch] IndexedDB cache empty, fetching fresh...");
    }
  }

  // Fetch from network
  console.log("[SemanticSearch] Fetching embeddings from server...");
  console.log(`[SemanticSearch] URL: ${EMBEDDINGS_URL}`);
  
  const response = await fetch(EMBEDDINGS_URL);
  console.log(`[SemanticSearch] Response status: ${response.status}`);
  
  if (!response.ok) {
    throw new Error(`Failed to load embeddings: ${response.status}`);
  }
  
  const data = await response.json() as EmbeddingsData;
  console.log(`[SemanticSearch] Fetched data: ${data.count} verses, ${data.verses?.length || 0} in array`);
  
  // Check if data is empty - throw early to avoid loading model
  if (!data.count || data.count === 0 || !data.verses || data.verses.length === 0) {
    console.log("[SemanticSearch] Embeddings file is empty, semantic search disabled");
    throw new Error("EMPTY_EMBEDDINGS");
  }
  
  // Save to IndexedDB for next time
  if (isBrowser) {
    try {
      console.log("[SemanticSearch] Saving to IndexedDB...");
      await saveToIndexedDB("embeddings-data", data);
      console.log("[SemanticSearch] Saved to IndexedDB successfully");
    } catch (err) {
      console.error("[SemanticSearch] Failed to cache to IndexedDB:", err);
      // Continue even if cache fails - we can still use the data
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
    console.log("[SemanticSearch] Checking if embeddings available...");
    console.log(`[SemanticSearch] URL: ${EMBEDDINGS_URL}`);
    
    const response = await fetch(EMBEDDINGS_URL);
    console.log(`[SemanticSearch] HEAD response: ${response.status}`);
    
    if (!response.ok) {
      console.error(`[SemanticSearch] HTTP error: ${response.status}`);
      return false;
    }
    
    // Try to load just the count from file
    const data = await response.json() as EmbeddingsData;
    console.log(`[SemanticSearch] Data check: count=${data.count}, verses=${data.verses?.length}`);
    
    const hasData = data.count > 0 && data.verses && data.verses.length > 0;
    console.log(`[SemanticSearch] Has data: ${hasData}`);
    return hasData;
  } catch (err) {
    console.error("[SemanticSearch] Check failed:", err);
    return false;
  }
}

// Main initialization function
export async function initializeSemanticSearch(): Promise<void> {
  console.log("[SemanticSearch] initializeSemanticSearch() called");
  
  if (!isBrowser) {
    console.log("[SemanticSearch] Skipped - not in browser");
    return;
  }
  
  if (embeddingsData && embedder) {
    console.log("[SemanticSearch] Already initialized");
    return; // Already initialized
  }
  
  if (isLoading && loadingPromise) {
    console.log("[SemanticSearch] Already loading, waiting...");
    return loadingPromise; // Wait for existing load
  }
  
  isLoading = true;
  loadingPromise = (async () => {
    try {
      console.log("[SemanticSearch] Starting initialization...");
      
      // Quick check first - avoid loading model if no data
      console.log("[SemanticSearch] Step 1: Check if data exists...");
      const hasData = await checkEmbeddingsAvailable();
      if (!hasData) {
        console.error("[SemanticSearch] ❌ No embeddings data available!");
        throw new Error("NO_EMBEDDINGS_DATA");
      }
      console.log("[SemanticSearch] ✅ Data exists");
      
      // Load embeddings
      console.log("[SemanticSearch] Step 2: Load embeddings...");
      const embeddings = await loadEmbeddings();
      embeddingsData = embeddings;
      console.log(`[SemanticSearch] ✅ Embeddings loaded: ${embeddings.count} verses`);
      
      // Then load model
      console.log("[SemanticSearch] Step 3: Load AI model...");
      const model = await loadModel();
      embedder = model;
      console.log("[SemanticSearch] ✅ Model loaded");
      
      console.log(`[SemanticSearch] 🎉 Ready! ${embeddings.count} verses indexed`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[SemanticSearch] ❌ Initialization failed: ${errorMsg}`, err);
      
      // Don't throw - just mark as not ready
      embeddingsData = null;
      embedder = null;
      throw err; // Re-throw so hook can catch it
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
