import path from "node:path";
import { stat } from "node:fs/promises";
import * as XLSX from "xlsx";
import type { PoolClient } from "pg";
import { getPool } from "@/lib/postgres";

type SurahRow = {
  id: number;
  arabicName: string;
  latinName: string;
  meaning: string;
  context: string;
  verseCount: number;
  revelationOrder: number;
};

type VerseRow = {
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

export type SyncResult = {
  excelPath: string;
  surahCount: number;
  verseCount: number;
};

export type SyncOverview = {
  excelPath: string;
  excelFileName: string;
  excelUpdatedAt: string | null;
  databaseSurahCount: number;
  databaseVerseCount: number;
};

function requireExcelPath() {
  const excelPath = process.env.EXCEL_PATH ?? "./surat quran.xlsx";
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), excelPath);
}

function normalizeText(value: unknown) {
  return String(value ?? "").replace(/\r?\n/g, " ").trim();
}

function normalizeMultilineText(value: unknown) {
  return String(value ?? "").replace(/\r\n/g, "\n").trim();
}

function normalizeInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseSurahs(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets.Surat;

  if (!sheet) {
    throw new Error("Sheet 'Surat' tidak ditemukan.");
  }

  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(sheet, {
    header: 1,
    defval: "",
  });

  return rows
    .slice(2)
    .filter((row) => row.some((cell) => String(cell).trim() !== ""))
    .map<SurahRow>((row) => ({
      id: normalizeInteger(row[0]),
      arabicName: normalizeText(row[1]),
      latinName: normalizeText(row[2]),
      meaning: normalizeText(row[3]),
      context: normalizeMultilineText(row[6]),
      verseCount: normalizeInteger(row[4]),
      revelationOrder: normalizeInteger(row[7]),
    }))
    .filter((row) => row.id > 0);
}

function parseVerses(workbook: XLSX.WorkBook) {
  const sheet = workbook.Sheets.bedah;

  if (!sheet) {
    throw new Error("Sheet 'bedah' tidak ditemukan.");
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
  });

  return rows
    .map<VerseRow>((row) => ({
      surahId: normalizeInteger(row.surat),
      ayahNumber: normalizeInteger(row.ayat),
      surahNameArabic: normalizeText(row["Surat Arab"]),
      surahNameIndonesian: normalizeText(row["Surat IDN"]),
      revelationPlace: normalizeText(row.Tempat),
      arabicText: normalizeText(row.Lafazh),
      translation: normalizeText(row["Terjemahan (Departemen Agama)"]),
      topic: normalizeText(row.Topik),
      critique: normalizeText(row.Kritik),
      asbabunNuzul: normalizeText(row["Asbabun Nuzul (Muchlis M Hanafi)"]),
      logicalFallacies: normalizeText(row["LOGICAL FALLACIES"]),
      moralConcerns: normalizeText(row["MORAL CONCERNS"]),
    }))
    .filter((row) => row.surahId > 0 && row.ayahNumber > 0);
}

async function upsertSurahs(client: PoolClient, surahs: SurahRow[]) {
  await client.query(
    `
      INSERT INTO surahs (id, name_arabic, name_latin, meaning, context, verse_count, revelation_order)
      SELECT *
      FROM UNNEST(
        $1::int[],
        $2::text[],
        $3::text[],
        $4::text[],
        $5::text[],
        $6::int[],
        $7::int[]
      )
      ON CONFLICT (id)
      DO UPDATE SET
        name_arabic = EXCLUDED.name_arabic,
        name_latin = EXCLUDED.name_latin,
        meaning = EXCLUDED.meaning,
        context = EXCLUDED.context,
        verse_count = EXCLUDED.verse_count,
        revelation_order = EXCLUDED.revelation_order,
        updated_at = NOW()
    `,
    [
      surahs.map((surah) => surah.id),
      surahs.map((surah) => surah.arabicName),
      surahs.map((surah) => surah.latinName),
      surahs.map((surah) => surah.meaning),
      surahs.map((surah) => surah.context),
      surahs.map((surah) => surah.verseCount),
      surahs.map((surah) => surah.revelationOrder),
    ],
  );
}

async function replaceVerses(client: PoolClient, verses: VerseRow[]) {
  await client.query("TRUNCATE TABLE verse_analyses, verses RESTART IDENTITY CASCADE");
  await client.query(
    `
      WITH source_data AS (
        SELECT *
        FROM UNNEST(
          $1::int[],
          $2::int[],
          $3::text[],
          $4::text[],
          $5::text[],
          $6::text[],
          $7::text[],
          $8::text[],
          $9::text[],
          $10::text[],
          $11::text[],
          $12::text[]
        ) WITH ORDINALITY AS data(
          surah_id,
          ayah_number,
          surah_name_arabic,
          surah_name_indonesian,
          revelation_place,
          arabic_text,
          translation,
          topic,
          critique,
          asbabun_nuzul,
          logical_fallacies,
          moral_concerns,
          row_number
        )
      ),
      inserted AS (
        INSERT INTO verses (
          surah_id,
          ayah_number,
          surah_name_arabic,
          surah_name_indonesian,
          revelation_place,
          arabic_text,
          translation
        )
        SELECT
          surah_id,
          ayah_number,
          surah_name_arabic,
          surah_name_indonesian,
          revelation_place,
          arabic_text,
          translation
        FROM source_data
        ORDER BY row_number
        RETURNING id
      )
      INSERT INTO verse_analyses (
        verse_id,
        topic,
        critique,
        asbabun_nuzul,
        logical_fallacies,
        moral_concerns
      )
      SELECT
        inserted.id,
        source_data.topic,
        source_data.critique,
        source_data.asbabun_nuzul,
        source_data.logical_fallacies,
        source_data.moral_concerns
      FROM inserted
      JOIN source_data
        ON source_data.row_number = inserted.id
    `,
    [
      verses.map((verse) => verse.surahId),
      verses.map((verse) => verse.ayahNumber),
      verses.map((verse) => verse.surahNameArabic),
      verses.map((verse) => verse.surahNameIndonesian),
      verses.map((verse) => verse.revelationPlace),
      verses.map((verse) => verse.arabicText),
      verses.map((verse) => verse.translation),
      verses.map((verse) => verse.topic),
      verses.map((verse) => verse.critique),
      verses.map((verse) => verse.asbabunNuzul),
      verses.map((verse) => verse.logicalFallacies),
      verses.map((verse) => verse.moralConcerns),
    ],
  );
}

export async function syncExcelToDatabase(): Promise<SyncResult> {
  const excelPath = requireExcelPath();
  const workbook = XLSX.readFile(excelPath);
  const surahs = parseSurahs(workbook);
  const verses = parseVerses(workbook);
  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await upsertSurahs(client, surahs);
    await replaceVerses(client, verses);
    await client.query("COMMIT");

    return {
      excelPath,
      surahCount: surahs.length,
      verseCount: verses.length,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function inspectExcelFile(): Promise<SyncResult> {
  const excelPath = requireExcelPath();
  const workbook = XLSX.readFile(excelPath);
  const surahs = parseSurahs(workbook);
  const verses = parseVerses(workbook);

  return {
    excelPath,
    surahCount: surahs.length,
    verseCount: verses.length,
  };
}

export async function getSyncOverview(): Promise<SyncOverview> {
  const excelPath = requireExcelPath();
  const pool = getPool();
  const [fileInfo, counts] = await Promise.all([
    stat(excelPath),
    pool.query<{ surah_count: number; verse_count: number }>(`
      select
        (select count(*)::int from surahs) as surah_count,
        (select count(*)::int from verses) as verse_count
    `),
  ]);

  return {
    excelPath,
    excelFileName: path.basename(excelPath),
    excelUpdatedAt: fileInfo.mtime.toISOString(),
    databaseSurahCount: counts.rows[0].surah_count,
    databaseVerseCount: counts.rows[0].verse_count,
  };
}
