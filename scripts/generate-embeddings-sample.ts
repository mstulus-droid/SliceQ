/**
 * Script untuk generate sample embeddings (100 ayat pertama)
 * Usage: npx tsx scripts/generate-embeddings-sample.ts
 */

import { config } from "dotenv";
import { pipeline } from "@xenova/transformers";
import { getPool, closePool } from "../src/lib/postgres";
import * as fs from "fs";
import * as path from "path";

config({ path: ".env.local" });

type VerseEmbedding = {
  id: number;
  surahId: number;
  ayahNumber: number;
  surahNameIndonesian: string;
  text: string;
  embedding: number[];
};

async function generateSampleEmbeddings() {
  console.log("🚀 Generating SAMPLE embeddings (100 ayat)...");
  
  const pool = getPool();
  
  // Fetch only 100 verses
  console.log("📚 Fetching sample verses...");
  const result = await pool.query<{
    id: number;
    surah_id: number;
    ayah_number: number;
    surah_name_indonesian: string;
    translation: string;
    topic: string;
    critique: string;
    logical_fallacies: string;
    moral_concerns: string;
    scientific_errors: string;
    contradictions: string;
  }>(`
    SELECT
      v.id,
      v.surah_id,
      v.ayah_number,
      v.surah_name_indonesian,
      v.translation,
      COALESCE(a.topic, '') as topic,
      COALESCE(a.critique, '') as critique,
      COALESCE(a.logical_fallacies, '') as logical_fallacies,
      COALESCE(a.moral_concerns, '') as moral_concerns,
      COALESCE(a.scientific_errors, '') as scientific_errors,
      COALESCE(a.contradictions, '') as contradictions
    FROM verses v
    JOIN verse_analyses a ON a.verse_id = v.id
    ORDER BY v.id
    LIMIT 100
  `);

  console.log(`✅ Fetched ${result.rows.length} verses`);

  console.log("🤖 Loading model...");
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/all-MiniLM-L6-v2",
    { quantized: true }
  );
  console.log("✅ Model loaded");

  const embeddings: VerseEmbedding[] = [];

  for (let i = 0; i < result.rows.length; i++) {
    const row = result.rows[i];
    
    const searchText = [
      row.translation,
      row.topic,
      row.critique,
      row.logical_fallacies,
      row.moral_concerns,
      row.scientific_errors,
      row.contradictions,
    ]
      .filter(Boolean)
      .join(". ");

    if (!searchText.trim()) continue;

    const truncatedText = searchText.slice(0, 512);
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

    if ((i + 1) % 10 === 0) {
      console.log(`🔄 Processed ${i + 1}/${result.rows.length}...`);
    }
  }

  const outputDir = path.join(process.cwd(), "public", "embeddings");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "verses-embeddings.json");
  
  fs.writeFileSync(outputPath, JSON.stringify({
    model: "Xenova/all-MiniLM-L6-v2",
    dimension: 384,
    count: embeddings.length,
    generatedAt: new Date().toISOString(),
    verses: embeddings,
  }));

  const fileSizeMB = (fs.statSync(outputPath).size / 1024 / 1024).toFixed(2);
  console.log(`\n✅ Sample embeddings saved!`);
  console.log(`📦 File size: ${fileSizeMB} MB`);
  console.log(`📝 Total verses: ${embeddings.length}`);
  console.log(`\n⚠️  INI HANYA SAMPLE (100 ayat)`);
  console.log(`Untuk full data, jalankan: npx tsx scripts/generate-embeddings.ts`);

  await closePool();
}

generateSampleEmbeddings().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
