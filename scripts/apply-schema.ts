import { readFile } from "node:fs/promises";
import path from "node:path";
import { loadEnv } from "./load-env";
import { closePool, getPool } from "../src/lib/postgres";

loadEnv();

async function main() {
  const schemaPath = path.join(process.cwd(), "db", "schema.sql");
  const sql = await readFile(schemaPath, "utf8");
  const pool = getPool();

  await pool.query(sql);
  console.log("Schema database berhasil diterapkan.");
}

main()
  .catch((error) => {
    console.error("Gagal menerapkan schema:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closePool();
  });
