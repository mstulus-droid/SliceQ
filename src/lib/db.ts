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
