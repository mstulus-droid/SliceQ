"use server";

import { VerseRecord, searchVersesWithFilters, getVerseById } from "@/lib/quran-data";

export type ScoredVerseRecord = VerseRecord & {
  score: number;
  maxScore: number;
};

function countMatches(text: string, query: string): number {
  if (!query || !text) return 0;
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  let count = 0;
  let index = 0;
  while ((index = normalizedText.indexOf(normalizedQuery, index)) !== -1) {
    count++;
    index += normalizedQuery.length;
  }
  return count;
}

function scoreVerse(verse: VerseRecord, query: string): number {
  const q = query.trim();
  if (!q) return 0;

  let score = 0;
  score += countMatches(verse.translation, q) * 3;
  score += countMatches(verse.critique, q) * 2;
  score += countMatches(verse.topic, q) * 2;
  score += countMatches(verse.logicalFallacies, q) * 1;
  score += countMatches(verse.moralConcerns, q) * 1;
  score += countMatches(verse.scientificErrors, q) * 1;
  score += countMatches(verse.contradictions, q) * 1;
  score += countMatches(verse.surahNameIndonesian, q) * 4;
  score += countMatches(verse.arabicText, q) * 1;

  return score;
}

export async function searchVersesAction(
  query: string,
): Promise<ScoredVerseRecord[]> {
  const results = await searchVersesWithFilters({
    query,
    limit: 10000, // virtually unlimited
  });

  const scored = results.map((verse) => ({
    verse,
    score: scoreVerse(verse, query),
  }));

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set<string>();
  const deduped = scored.filter((s) => {
    const hasAnalysis =
      s.verse.critique || s.verse.logicalFallacies || s.verse.moralConcerns || s.verse.scientificErrors || s.verse.contradictions;

    if (hasAnalysis) {
      const normalizeKey = (text: string | null | undefined) =>
        String(text ?? "")
          .toLowerCase()
          .replace(/\s+/g, "");
      const key = `${normalizeKey(s.verse.critique)}||${normalizeKey(s.verse.logicalFallacies)}||${normalizeKey(s.verse.moralConcerns)}||${normalizeKey(s.verse.scientificErrors)}||${normalizeKey(s.verse.contradictions)}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
    }

    return true;
  });

  const maxScore = deduped[0]?.score ?? 0;

  return deduped.map((s) => ({
    ...s.verse,
    score: s.score,
    maxScore,
  }));
}

/**
 * Fetch full verse details by IDs (used for semantic search results)
 */
export async function getVersesByIds(ids: number[]): Promise<VerseRecord[]> {
  const verses: VerseRecord[] = [];

  // Fetch in parallel with limited concurrency
  const batchSize = 10;
  for (let i = 0; i < ids.length; i += batchSize) {
    const batch = ids.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((id) => getVerseById(id))
    );
    verses.push(...batchResults.filter((v): v is VerseRecord => v !== null));
  }

  return verses;
}
