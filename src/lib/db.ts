type DatabaseErrorInfo = {
  title: string;
  summary: string;
  detail: string;
};

type ErrorWithCode = Error & {
  code?: string;
  errno?: string | number;
  cause?: unknown;
};

const CONNECTION_ERROR_CODES = new Set([
  "ENOTFOUND",
  "ECONNREFUSED",
  "ECONNRESET",
  "ETIMEDOUT",
  "EHOSTUNREACH",
  "57P01",
]);

const POOL_LIMIT_PATTERNS = [
  "maxclientsinsessionmode",
  "max clients reached",
  "too many clients",
];

const SESSION_MODE_PATTERNS = [
  "session mode port 5432",
  "supabase session mode",
];

function readErrorCode(error: ErrorWithCode) {
  if (typeof error.code === "string" && error.code.length > 0) {
    return error.code;
  }

  if (typeof error.errno === "string" && error.errno.length > 0) {
    return error.errno;
  }

  return "";
}

function findNestedError(value: unknown): ErrorWithCode | null {
  if (!(value instanceof Error)) {
    return null;
  }

  const directCode = readErrorCode(value);
  if (directCode || value.message) {
    return value;
  }

  if ("cause" in value) {
    return findNestedError(value.cause);
  }

  return value;
}

export function getDatabaseStrategy() {
  return {
    provider: "postgres",
    recommendation: "Supabase or Neon",
    note: "Schema dan importer Excel sekarang sudah tersedia. Langkah berikutnya adalah menghubungkan halaman Next.js ke PostgreSQL ini.",
  };
}

export function isDatabaseConnectionError(error: unknown) {
  const resolved = findNestedError(error);

  if (!resolved) {
    return false;
  }

  const code = readErrorCode(resolved);
  if (CONNECTION_ERROR_CODES.has(code)) {
    return true;
  }

  const message = resolved.message.toLowerCase();

  return (
    message.includes("database_url") ||
    message.includes("getaddrinfo") ||
    message.includes("connect econnrefused") ||
    message.includes("connection terminated") ||
    message.includes("timeout expired")
  );
}

export function getDatabaseErrorInfo(error: unknown): DatabaseErrorInfo {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (SESSION_MODE_PATTERNS.some((pattern) => message.includes(pattern))) {
      return {
        title: "DATABASE_URL masih salah",
        summary:
          "Aplikasi sedang memakai Supabase Session mode, padahal project ini harus memakai Transaction mode.",
        detail:
          "Buka Supabase Connect, salin Supavisor Transaction mode, lalu pastikan URL berakhir dengan host .pooler.supabase.com port 6543. Setelah itu restart app atau redeploy Vercel.",
      };
    }

    if (POOL_LIMIT_PATTERNS.some((pattern) => message.includes(pattern))) {
      return {
        title: "Koneksi database sedang penuh",
        summary:
          "Pool koneksi PostgreSQL mencapai batas, jadi Supabase menolak koneksi baru sementara.",
        detail:
          "Gunakan connection string pooler Supabase port 6543 dan set DATABASE_POOL_MAX=1 di environment aplikasi.",
      };
    }
  }

  if (isDatabaseConnectionError(error)) {
    const resolved = findNestedError(error);
    const detail =
      resolved?.message ??
      "Koneksi database gagal sebelum halaman selesai dimuat.";

    return {
      title: "Database belum bisa dihubungi",
      summary:
        "SliceQ berhasil jalan, tapi koneksi ke PostgreSQL gagal sehingga data belum bisa ditampilkan.",
      detail,
    };
  }

  if (error instanceof Error) {
    return {
      title: "Terjadi kesalahan saat memuat data",
      summary:
        "Server merender aplikasi, tetapi ada error lain saat membaca data dari backend.",
      detail: error.message,
    };
  }

  return {
    title: "Terjadi kesalahan saat memuat data",
    summary:
      "Server merender aplikasi, tetapi ada error yang belum bisa diidentifikasi saat membaca data.",
    detail: "Unknown error",
  };
}
