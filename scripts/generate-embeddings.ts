/**
 * Script untuk generate embeddings untuk semua ayat
 * Usage: npx tsx scripts/generate-embeddings.ts
 * 
 * This script:
 * 1. Loads environment from .env.local
 * 2. Connects to database
 * 3. Fetches all verses with their analysis
 * 4. Generates embeddings using Xenova/transformers
 * 5. Saves to public/embeddings/verses-embeddings.json
 */

import { config } from "dotenv";
import { pipeline } from "@xenova/transformers";
import { getPool, closePool } from "../src/lib/postgres";
import * as fs from "fs";
import * as path from "path";

// Load environment from .env.local
config({ path: ".env.local" });

type VerseEmbedding = {
  id: number;
  surahId: number;
  ayahNumber: number;
  surahNameIndonesian: string;
  text: string; // Combined text for search context
  embedding: number[];
};

async function generateEmbeddings() {
  console.log("🚀 Starting embeddings generation...");
  
  const pool = getPool();
  
  // Fetch all verses with analyses
  console.log("📚 Fetching verses from database...");
  const result = await pool.query<{
    id: number;
    surah_id: number;
    ayah_number: number;
    surah_name_indonesian: string;
    arabic_text: string;
    translation: string;
    topic: string;
    critique: string;
    logical_fallacies: string;
    moral_concerns: string;
    scientific_errors: string;
    contradictions: string;
    catatan_depag: string;
  }>(`
    SELECT
      v.id,
      v.surah_id,
      v.ayah_number,
      v.surah_name_indonesian,
      v.arabic_text,
      v.translation,
      COALESCE(a.topic, '') as topic,
      COALESCE(a.critique, '') as critique,
      COALESCE(a.logical_fallacies, '') as logical_fallacies,
      COALESCE(a.moral_concerns, '') as moral_concerns,
      COALESCE(a.scientific_errors, '') as scientific_errors,
      COALESCE(a.contradictions, '') as contradictions,
      COALESCE(a.catatan_depag, '') as catatan_depag
    FROM verses v
    JOIN verse_analyses a ON a.verse_id = v.id
    ORDER BY v.id
  `);

  console.log(`✅ Fetched ${result.rows.length} verses`);

  // Initialize embedding pipeline
  console.log("🤖 Loading embedding model...");
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    { quantized: true }
  );
  console.log("✅ Model loaded");

  const embeddings: VerseEmbedding[] = [];
  const batchSize = 32; // Process in batches to avoid memory issues

  for (let i = 0; i < result.rows.length; i += batchSize) {
    const batch = result.rows.slice(i, i + batchSize);
    console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(result.rows.length / batchSize)}...`);

    for (const row of batch) {
      // Combine all searchable text
      const searchText = [
        row.translation,
        row.topic,
        row.critique,
        row.logical_fallacies,
        row.moral_concerns,
        row.scientific_errors,
        row.contradictions,
        row.catatan_depag,
      ]
        .filter(Boolean)
        .join(". ");

      if (!searchText.trim()) {
        console.log(`⚠️  Skipping verse ${row.id} - no searchable content`);
        continue;
      }

      // Truncate if too long (model has max token limit)
      const truncatedText = searchText.slice(0, 512);

      // Generate embedding
      const output = await embedder(truncatedText, { pooling: "mean", normalize: true });
      const embedding = Array.from(output.data as Float32Array);

      embeddings.push({
        id: row.id,
        surahId: row.surah_id,
        ayahNumber: row.ayah_number,
        surahNameIndonesian: row.surah_name_indonesian,
        text: truncatedText,
        embedding: embedding,
      });
    }
  }

  // Save to file
  const outputDir = path.join(process.cwd(), "public", "embeddings");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "verses-embeddings.json");
  
  // Save as compressed JSON (remove whitespace)
  fs.writeFileSync(outputPath, JSON.stringify({
    model: "Xenova/all-MiniLM-L6-v2",
    dimension: 384,
    count: embeddings.length,
    generatedAt: new Date().toISOString(),
    verses: embeddings,
  }));

  const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Embeddings saved to ${outputPath}`);
  console.log(`📦 File size: ${fileSizeMB} MB`);
  console.log(`📝 Total verses: ${embeddings.length}`);

  await closePool();
  console.log("\n🎉 Done!");
}

generateEmbeddings().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
