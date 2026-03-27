import { loadEnv } from "./load-env";
import { closePool } from "../src/lib/postgres";
import {
  getSyncOverview,
  inspectExcelFile,
  syncExcelToDatabase,
} from "../src/lib/excel-sync";

loadEnv();

async function main() {
  const dryRun = process.argv.includes("--dry-run");
  const overview = await getSyncOverview();

  console.log(`Excel source: ${overview.excelPath}`);

  if (dryRun) {
    const fileInfo = await inspectExcelFile();
    console.log(`Surahs parsed: ${fileInfo.surahCount}`);
    console.log(`Verses parsed: ${fileInfo.verseCount}`);
    console.log(`Verses in database saat ini: ${overview.databaseVerseCount}`);
    console.log("Dry run aktif. Tidak ada perubahan database.");
    return;
  }

  const result = await syncExcelToDatabase();
  console.log(`Surahs parsed: ${result.surahCount}`);
  console.log(`Verses parsed: ${result.verseCount}`);
  console.log("Import Excel selesai dan database berhasil diperbarui.");
}

main()
  .catch((error) => {
    console.error("Gagal import Excel:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
