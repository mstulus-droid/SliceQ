import { Pool } from "pg";

declare global {
  var __sliceqPool: Pool | undefined;
}

function getDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL belum diisi. Salin .env.example ke .env.local atau .env.",
    );
  }

  return databaseUrl;
}

export function getPool() {
  if (!global.__sliceqPool) {
    global.__sliceqPool = new Pool({
      connectionString: getDatabaseUrl(),
    });
  }

  return global.__sliceqPool;
}

export async function closePool() {
  if (global.__sliceqPool) {
    await global.__sliceqPool.end();
    global.__sliceqPool = undefined;
  }
}
