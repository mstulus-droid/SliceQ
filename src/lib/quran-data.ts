import { getPool } from "@/lib/postgres";

export type SurahListItem = {
  id: number;
  nameArabic: string;
  nameLatin: string;
  meaning: string;
  context: string;
  verseCount: number;
  revelationPlace: string;
  revelationOrder: number;
};

export type VerseRecord = {
  id: number;
  surahId: number;
  ayahNumber: number;
  surahNameArabic: string;
  surahNameIndonesian: string;
  revelationPlace: string;
  arabicText: string;
  translation: string;
  topic: string;
  critique: string;
  asbabunNuzul: string;
  logicalFallacies: string;
  moralConcerns: string;
};

export type HomeStats = {
  surahCount: number;
  verseCount: number;
  analysisCount: number;
};

export type SearchFilters = {
  query?: string;
  place?: string;
  fallacy?: string;
  moral?: string;
  surahId?: number;
  ayahNumber?: number;
  limit?: number;
};

export type SearchFilterOptions = {
  places: string[];
  fallacies: string[];
  morals: string[];
};

export type VerseNeighbors = {
  previousVerseId: number | null;
  nextVerseId: number | null;
};

export type BookmarkRecord = VerseRecord & {
  bookmarkedAt: string;
  note: string;
};

function mapSurah(row: {
  id: number;
  name_arabic: string;
  name_latin: string;
  meaning: string;
  context: string;
  verse_count: number;
  revelation_place: string | null;
  revelation_order: number;
}): SurahListItem {
  return {
    id: row.id,
    nameArabic: row.name_arabic,
    nameLatin: row.name_latin,
    meaning: row.meaning,
    context: row.context,
    verseCount: row.verse_count,
    revelationPlace: row.revelation_place ?? "Tidak diketahui",
    revelationOrder: row.revelation_order,
  };
}

function mapVerse(row: {
  id: number;
  surah_id: number;
  ayah_number: number;
  surah_name_arabic: string;
  surah_name_indonesian: string;
  revelation_place: string;
  arabic_text: string;
  translation: string;
  topic: string;
  critique: string;
  asbabun_nuzul: string;
  logical_fallacies: string;
  moral_concerns: string;
}): VerseRecord {
  return {
    id: row.id,
    surahId: row.surah_id,
    ayahNumber: row.ayah_number,
    surahNameArabic: row.surah_name_arabic,
    surahNameIndonesian: row.surah_name_indonesian,
    revelationPlace: row.revelation_place,
    arabicText: row.arabic_text,
    translation: row.translation,
    topic: row.topic,
    critique: row.critique,
    asbabunNuzul: row.asbabun_nuzul,
    logicalFallacies: row.logical_fallacies,
    moralConcerns: row.moral_concerns,
  };
}

export async function getHomeStats(): Promise<HomeStats> {
  const pool = getPool();
  const result = await pool.query<{
    surah_count: number;
    verse_count: number;
    analysis_count: number;
  }>(`
    select
      (select count(*)::int from surahs) as surah_count,
      (select count(*)::int from verses) as verse_count,
      (
        select count(*)::int
        from verse_analyses
        where coalesce(topic, '') <> ''
           or coalesce(critique, '') <> ''
           or coalesce(asbabun_nuzul, '') <> ''
           or coalesce(logical_fallacies, '') <> ''
           or coalesce(moral_concerns, '') <> ''
      ) as analysis_count
  `);

  return {
    surahCount: result.rows[0].surah_count,
    verseCount: result.rows[0].verse_count,
    analysisCount: result.rows[0].analysis_count,
  };
}

export async function getSurahs(limit?: number): Promise<SurahListItem[]> {
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name_arabic: string;
    name_latin: string;
    meaning: string;
    context: string;
    verse_count: number;
    revelation_place: string | null;
    revelation_order: number;
  }>(
    `
      select
        s.id,
        s.name_arabic,
        s.name_latin,
        s.meaning,
        s.context,
        s.verse_count,
        s.revelation_order,
        coalesce(mode() within group (order by v.revelation_place), 'Tidak diketahui') as revelation_place
      from surahs s
      left join verses v on v.surah_id = s.id
      group by s.id, s.name_arabic, s.name_latin, s.meaning, s.verse_count
      order by s.id
      ${typeof limit === "number" ? "limit $1" : ""}
    `,
    typeof limit === "number" ? [limit] : [],
  );

  return result.rows.map(mapSurah);
}

export async function getSurahById(id: number): Promise<SurahListItem | null> {
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    name_arabic: string;
    name_latin: string;
    meaning: string;
    context: string;
    verse_count: number;
    revelation_place: string | null;
    revelation_order: number;
  }>(
    `
      select
        s.id,
        s.name_arabic,
        s.name_latin,
        s.meaning,
        s.context,
        s.verse_count,
        s.revelation_order,
        coalesce(mode() within group (order by v.revelation_place), 'Tidak diketahui') as revelation_place
      from surahs s
      left join verses v on v.surah_id = s.id
      where s.id = $1
      group by s.id, s.name_arabic, s.name_latin, s.meaning, s.verse_count
    `,
    [id],
  );

  return result.rows[0] ? mapSurah(result.rows[0]) : null;
}

export async function getVersesBySurahId(surahId: number): Promise<VerseRecord[]> {
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    surah_id: number;
    ayah_number: number;
    surah_name_arabic: string;
    surah_name_indonesian: string;
    revelation_place: string;
    arabic_text: string;
    translation: string;
    topic: string;
    critique: string;
    asbabun_nuzul: string;
    logical_fallacies: string;
    moral_concerns: string;
  }>(
    `
      select
        v.id,
        v.surah_id,
        v.ayah_number,
        v.surah_name_arabic,
        v.surah_name_indonesian,
        v.revelation_place,
        v.arabic_text,
        v.translation,
        a.topic,
        a.critique,
        a.asbabun_nuzul,
        a.logical_fallacies,
        a.moral_concerns
      from verses v
      join verse_analyses a on a.verse_id = v.id
      where v.surah_id = $1
      order by v.ayah_number
    `,
    [surahId],
  );

  return result.rows.map(mapVerse);
}

export async function getVerseById(verseId: number): Promise<VerseRecord | null> {
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    surah_id: number;
    ayah_number: number;
    surah_name_arabic: string;
    surah_name_indonesian: string;
    revelation_place: string;
    arabic_text: string;
    translation: string;
    topic: string;
    critique: string;
    asbabun_nuzul: string;
    logical_fallacies: string;
    moral_concerns: string;
  }>(
    `
      select
        v.id,
        v.surah_id,
        v.ayah_number,
        v.surah_name_arabic,
        v.surah_name_indonesian,
        v.revelation_place,
        v.arabic_text,
        v.translation,
        a.topic,
        a.critique,
        a.asbabun_nuzul,
        a.logical_fallacies,
        a.moral_concerns
      from verses v
      join verse_analyses a on a.verse_id = v.id
      where v.id = $1
    `,
    [verseId],
  );

  return result.rows[0] ? mapVerse(result.rows[0]) : null;
}

export async function getVerseNeighbors(verseId: number): Promise<VerseNeighbors> {
  const pool = getPool();
  const result = await pool.query<{
    previous_verse_id: number | null;
    next_verse_id: number | null;
  }>(
    `
      with current_verse as (
        select id, surah_id, ayah_number
        from verses
        where id = $1
      )
      select
        (
          select id
          from verses
          where surah_id = current_verse.surah_id
            and ayah_number < current_verse.ayah_number
          order by ayah_number desc
          limit 1
        ) as previous_verse_id,
        (
          select id
          from verses
          where surah_id = current_verse.surah_id
            and ayah_number > current_verse.ayah_number
          order by ayah_number asc
          limit 1
        ) as next_verse_id
      from current_verse
    `,
    [verseId],
  );

  return {
    previousVerseId: result.rows[0]?.previous_verse_id ?? null,
    nextVerseId: result.rows[0]?.next_verse_id ?? null,
  };
}

export async function getHighlightedVerses(limit = 3): Promise<VerseRecord[]> {
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    surah_id: number;
    ayah_number: number;
    surah_name_arabic: string;
    surah_name_indonesian: string;
    revelation_place: string;
    arabic_text: string;
    translation: string;
    topic: string;
    critique: string;
    asbabun_nuzul: string;
    logical_fallacies: string;
    moral_concerns: string;
  }>(
    `
      select
        v.id,
        v.surah_id,
        v.ayah_number,
        v.surah_name_arabic,
        v.surah_name_indonesian,
        v.revelation_place,
        v.arabic_text,
        v.translation,
        a.topic,
        a.critique,
        a.asbabun_nuzul,
        a.logical_fallacies,
        a.moral_concerns
      from verses v
      join verse_analyses a on a.verse_id = v.id
      order by v.surah_id, v.ayah_number
      limit $1
    `,
    [limit],
  );

  return result.rows.map(mapVerse);
}

export async function isVerseBookmarked(verseId: number): Promise<boolean> {
  const pool = getPool();
  const result = await pool.query<{ exists: boolean }>(
    `
      select exists(
        select 1
        from bookmarks
        where verse_id = $1
      ) as exists
    `,
    [verseId],
  );

  return result.rows[0]?.exists ?? false;
}

export async function getBookmarks(): Promise<BookmarkRecord[]> {
  const pool = getPool();
  const result = await pool.query<{
    id: number;
    surah_id: number;
    ayah_number: number;
    surah_name_arabic: string;
    surah_name_indonesian: string;
    revelation_place: string;
    arabic_text: string;
    translation: string;
    topic: string;
    critique: string;
    asbabun_nuzul: string;
    logical_fallacies: string;
    moral_concerns: string;
    bookmarked_at: string;
    note: string;
  }>(
    `
      select
        v.id,
        v.surah_id,
        v.ayah_number,
        v.surah_name_arabic,
        v.surah_name_indonesian,
        v.revelation_place,
        v.arabic_text,
        v.translation,
        a.topic,
        a.critique,
        a.asbabun_nuzul,
        a.logical_fallacies,
        a.moral_concerns,
        b.created_at as bookmarked_at,
        b.note
      from bookmarks b
      join verses v on v.id = b.verse_id
      join verse_analyses a on a.verse_id = v.id
      order by b.created_at desc
    `,
  );

  return result.rows.map((row) => ({
    ...mapVerse(row),
    bookmarkedAt: row.bookmarked_at,
    note: row.note,
  }));
}

export async function searchVerses(term: string, limit = 30): Promise<VerseRecord[]> {
  return searchVersesWithFilters({ query: term, limit });
}

function extractCategoryLabel(value: string) {
  return value.split(" - ")[0].trim();
}

export async function getSearchFilterOptions(): Promise<SearchFilterOptions> {
  const pool = getPool();
  const result = await pool.query<{
    revelation_place: string | null;
    logical_fallacies: string;
    moral_concerns: string;
  }>(`
    select
      v.revelation_place,
      coalesce(a.logical_fallacies, '') as logical_fallacies,
      coalesce(a.moral_concerns, '') as moral_concerns
    from verses v
    join verse_analyses a on a.verse_id = v.id
  `);

  const places = new Set<string>();
  const fallacies = new Set<string>();
  const morals = new Set<string>();

  for (const row of result.rows) {
    if (row.revelation_place) {
      places.add(row.revelation_place);
    }

    if (row.logical_fallacies) {
      fallacies.add(extractCategoryLabel(row.logical_fallacies));
    }

    if (row.moral_concerns) {
      morals.add(extractCategoryLabel(row.moral_concerns));
    }
  }

  return {
    places: Array.from(places).sort(),
    fallacies: Array.from(fallacies).sort(),
    morals: Array.from(morals).sort(),
  };
}

export async function searchVersesWithFilters({
  query = "",
  place = "",
  fallacy = "",
  moral = "",
  surahId,
  ayahNumber,
  limit = 30,
}: SearchFilters): Promise<VerseRecord[]> {
  const pool = getPool();
  const trimmed = query.trim();
  const normalizedPlace = place.trim();
  const normalizedFallacy = fallacy.trim();
  const normalizedMoral = moral.trim();
  const normalizedSurahId =
    typeof surahId === "number" && Number.isFinite(surahId) ? surahId : 0;
  const normalizedAyahNumber =
    typeof ayahNumber === "number" && Number.isFinite(ayahNumber)
      ? ayahNumber
      : 0;

  const result = await pool.query<{
    id: number;
    surah_id: number;
    ayah_number: number;
    surah_name_arabic: string;
    surah_name_indonesian: string;
    revelation_place: string;
    arabic_text: string;
    translation: string;
    topic: string;
    critique: string;
    asbabun_nuzul: string;
    logical_fallacies: string;
    moral_concerns: string;
  }>(
    `
      select
        v.id,
        v.surah_id,
        v.ayah_number,
        v.surah_name_arabic,
        v.surah_name_indonesian,
        v.revelation_place,
        v.arabic_text,
        v.translation,
        a.topic,
        a.critique,
        a.asbabun_nuzul,
        a.logical_fallacies,
        a.moral_concerns
      from verses v
      join verse_analyses a on a.verse_id = v.id
      where
        (
          $1 = ''
          or v.translation ilike '%' || $1 || '%'
          or v.surah_name_indonesian ilike '%' || $1 || '%'
          or a.topic ilike '%' || $1 || '%'
          or a.critique ilike '%' || $1 || '%'
          or a.logical_fallacies ilike '%' || $1 || '%'
          or a.moral_concerns ilike '%' || $1 || '%'
        )
        and ($2 = '' or v.revelation_place = $2)
        and ($3 = '' or a.logical_fallacies ilike $3 || ' - %' or a.logical_fallacies = $3)
        and ($4 = '' or a.moral_concerns ilike $4 || ' - %' or a.moral_concerns = $4)
        and ($5 = 0 or v.surah_id = $5)
        and ($6 = 0 or v.ayah_number = $6)
      order by v.surah_id, v.ayah_number
      limit $7
    `,
    [
      trimmed,
      normalizedPlace,
      normalizedFallacy,
      normalizedMoral,
      normalizedSurahId,
      normalizedAyahNumber,
      limit,
    ],
  );

  return result.rows.map(mapVerse);
}
