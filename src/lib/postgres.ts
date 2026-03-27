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

function usesManagedPooler(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl);

    return (
      parsed.hostname.includes(".pooler.supabase.com") ||
      parsed.port === "6543"
    );
  } catch {
    return false;
  }
}

function usesSessionModePooler(databaseUrl: string) {
  try {
    const parsed = new URL(databaseUrl);

    return (
      parsed.hostname.includes(".pooler.supabase.com") &&
      parsed.port === "5432"
    );
  } catch {
    return false;
  }
}

function readPoolSize(databaseUrl: string) {
  const configured = Number(process.env.DATABASE_POOL_MAX);

  if (Number.isFinite(configured) && configured > 0) {
    return configured;
  }

  if (usesManagedPooler(databaseUrl)) {
    return 1;
  }

  return process.env.NODE_ENV === "development" ? 1 : 5;
}

export function getPool() {
  if (!global.__sliceqPool) {
    const databaseUrl = getDatabaseUrl();

    if (usesSessionModePooler(databaseUrl)) {
      throw new Error(
        "DATABASE_URL masih memakai Supabase Session mode port 5432. Ganti ke Supavisor Transaction mode port 6543 lalu restart aplikasi.",
      );
    }

    global.__sliceqPool = new Pool({
      connectionString: databaseUrl,
      max: readPoolSize(databaseUrl),
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
