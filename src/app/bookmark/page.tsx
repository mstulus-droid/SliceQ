import Link from "next/link";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import { getBookmarks } from "@/lib/quran-data";

export const metadata = {
  title: "Bookmark | SliceQ",
};

export default async function BookmarkPage() {
  let bookmarks;

  try {
    bookmarks = await getBookmarks();
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f0f7f1_0%,#f7f3ea_100%)] px-4 py-6 sm:px-8 sm:py-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <section className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.7)] sm:p-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                Bookmark
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                Ayat-ayat yang kamu simpan
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                Kembali ke ayat yang pernah kamu tandai tanpa perlu mengulang pencarian dari awal.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex w-fit rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-emerald-300 transition hover:bg-white/10"
            >
              Kembali ke beranda
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] bg-white p-5 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)] sm:p-8">
          <div className="mb-5 rounded-[1.25rem] bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-200">
            {bookmarks.length > 0
              ? `${bookmarks.length} ayat tersimpan di bookmark.`
              : "Belum ada bookmark. Buka detail ayat lalu simpan bookmark dari sana."}
          </div>

          <div className="grid gap-4">
            {bookmarks.map((bookmark) => (
              <Link
                key={bookmark.id}
                href={`/ayat/${bookmark.id}`}
                className="block rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfbf9_0%,#f8f5ef_100%)] p-4 shadow-[0_16px_45px_-40px_rgba(15,23,42,0.55)] transition hover:bg-[#f7f4ed] sm:p-5"
              >
                <p className="text-sm font-semibold text-slate-500">
                  {bookmark.surahNameIndonesian} • Ayat {bookmark.ayahNumber}
                </p>
                <p className="mt-3 text-right text-2xl leading-[1.9] text-slate-950 sm:text-3xl">
                  {bookmark.arabicText}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
