"use server";

import { revalidatePath } from "next/cache";
import { getDatabaseErrorInfo } from "@/lib/db";
import { getPool } from "@/lib/postgres";

export type BookmarkActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function toggleBookmark(
  _previousState: BookmarkActionState,
  formData: FormData,
): Promise<BookmarkActionState> {
  void _previousState;

  const verseId = Number(formData.get("verseId"));

  if (!Number.isFinite(verseId) || verseId <= 0) {
    return {
      status: "error" as const,
      message: "Verse ID tidak valid.",
    };
  }

  try {
    const pool = getPool();
    const existing = await pool.query<{ id: number }>(
      `select id from bookmarks where verse_id = $1`,
      [verseId],
    );

    if (existing.rows[0]) {
      await pool.query(`delete from bookmarks where verse_id = $1`, [verseId]);
      revalidatePath(`/ayat/${verseId}`);
      revalidatePath("/bookmark");
      revalidatePath("/cari");
      revalidatePath("/surat");

      return {
        status: "success" as const,
        message: "Bookmark dihapus.",
      };
    }

    await pool.query(
      `
        insert into bookmarks (verse_id)
        values ($1)
        on conflict (verse_id) do nothing
      `,
      [verseId],
    );

    revalidatePath(`/ayat/${verseId}`);
    revalidatePath("/bookmark");
    revalidatePath("/cari");
    revalidatePath("/surat");

    return {
      status: "success" as const,
      message: "Ayat ditambahkan ke bookmark.",
    };
  } catch (error) {
    const info = getDatabaseErrorInfo(error);

    return {
      status: "error" as const,
      message: `${info.title}. ${info.detail}`,
    };
  }
}
