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

function readPoolSize() {
  const configured = Number(process.env.DATABASE_POOL_MAX);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  return process.env.NODE_ENV === "development" ? 1 : 5;
}

export function getPool() {
  if (!global.__sliceqPool) {
    global.__sliceqPool = new Pool({
      connectionString: getDatabaseUrl(),
      max: readPoolSize(),
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 10_000,
      allowExitOnIdle: true,
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
