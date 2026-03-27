"use server";

import { revalidatePath } from "next/cache";
import { syncExcelToDatabase } from "@/lib/excel-sync";

export type SyncActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function runExcelSync(): Promise<SyncActionState>;
export async function runExcelSync(
  _previousState: SyncActionState,
  _formData: FormData,
): Promise<SyncActionState>;
export async function runExcelSync(
  _previousState?: SyncActionState,
  _formData?: FormData,
): Promise<SyncActionState> {
  void _previousState;
  void _formData;

  try {
    const result = await syncExcelToDatabase();

    revalidatePath("/");
    revalidatePath("/surat");
    revalidatePath("/cari");
    revalidatePath("/sinkronisasi");
    revalidatePath("/surat/[surahId]", "page");

    return {
      status: "success",
      message: `Sinkronisasi selesai. ${result.surahCount} surat dan ${result.verseCount} ayat diperbarui.`,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Terjadi kegagalan yang tidak dikenal.";

    return {
      status: "error",
      message: `Sinkronisasi gagal. ${message}`,
    };
  }
}
