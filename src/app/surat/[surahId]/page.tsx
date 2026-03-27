import Link from "next/link";
import { notFound } from "next/navigation";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import { getSurahById, getVersesBySurahId } from "@/lib/quran-data";

type PageProps = {
  params: Promise<{ surahId: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { surahId } = await params;
  let surah = null;

  try {
    surah = await getSurahById(Number(surahId));
  } catch {
    return {
      title: "Database bermasalah | SliceQ",
    };
  }

  if (!surah) {
    return {
      title: "Surat tidak ditemukan | SliceQ",
    };
  }

  return {
    title: `${surah.nameLatin} | SliceQ`,
  };
}

export default async function SurahDetailPage({ params }: PageProps) {
  const { surahId } = await params;
  const parsedId = Number(surahId);
  let surah;

  try {
    surah = await getSurahById(parsedId);
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  if (!surah) {
    notFound();
  }

  let verses;

  try {
    verses = await getVersesBySurahId(parsedId);
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef6ef_0%,#f8f4ea_100%)] px-5 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <section className="grid gap-5 lg:grid-cols-[0.76fr_1.24fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_right,#17412f,transparent_35%),linear-gradient(180deg,#0f172a_0%,#16212f_100%)] p-6 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.7)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-300">
                Surat {surah.id}
              </p>
              <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
                {surah.nameLatin}
              </h1>
              <p className="mt-3 text-5xl text-white/90 sm:text-6xl">
                {surah.nameArabic}
              </p>
              <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                {surah.meaning}, terdiri dari {surah.verseCount} ayat dan turun di {surah.revelationPlace}.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  { label: "Arti", value: surah.meaning },
                  { label: "Tempat Turun", value: surah.revelationPlace },
                  { label: "Jumlah Ayat", value: `${surah.verseCount}` },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur"
                  >
                    <p className="text-sm text-slate-300">{item.label}</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/surat"
                  className="inline-flex items-center justify-center rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  Semua surat
                </Link>
                <Link
                  href="/cari"
                  className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Cari ayat
                </Link>
              </div>
            </div>
          </aside>

          <div className="space-y-4">
            <div className="rounded-[1.5rem] bg-white px-5 py-4 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.28)]">
              <p className="text-sm leading-7 text-slate-600">
                Menampilkan semua ayat dari {surah.nameLatin}. Klik lafazh Arab untuk membuka detail ayat satu per satu.
              </p>
            </div>

            <div className="space-y-4">
              {verses.map((verse) => (
                <article
                  key={`${verse.surahId}-${verse.ayahNumber}`}
                  className="rounded-[2rem] bg-white p-6 shadow-[0_20px_60px_-35px_rgba(15,23,42,0.35)]"
                >
                  <div className="flex flex-col gap-3">
                    <div>
                      <p className="text-sm text-slate-500">Ayat {verse.ayahNumber}</p>
                      <p className="mt-1 text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                        {verse.topic || "Tanpa topik"}
                      </p>
                    </div>
                  </div>

                  {verse.asbabunNuzul ? (
                    <div className="mt-4 border-l-2 border-amber-300 pl-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                        Asbabun Nuzul
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {verse.asbabunNuzul}
                      </p>
                    </div>
                  ) : null}

                  <Link
                    href={`/ayat/${verse.id}`}
                    className="mt-6 block rounded-[1.25rem] px-2 py-2 text-right text-3xl leading-[2] text-slate-950 transition hover:bg-slate-50 sm:text-4xl"
                  >
                    {verse.arabicText}
                  </Link>
                  <p className="mt-5 text-base leading-8 text-slate-700">
                    {verse.translation}
                  </p>

                  {verse.critique ? (
                    <div className="mt-6 rounded-[1.25rem] bg-slate-50 p-4 ring-1 ring-slate-200">
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Kritik
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        {verse.critique}
                      </p>
                    </div>
                  ) : null}

                  {verse.logicalFallacies || verse.moralConcerns ? (
                    <div
                      className={`mt-5 grid gap-4 ${
                        verse.logicalFallacies && verse.moralConcerns
                          ? "lg:grid-cols-2"
                          : ""
                      }`}
                    >
                      {verse.logicalFallacies ? (
                        <div className="rounded-[1.25rem] bg-amber-50 p-4 ring-1 ring-amber-100">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-800">
                            Logical Fallacy
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-700">
                            {verse.logicalFallacies}
                          </p>
                        </div>
                      ) : null}
                      {verse.moralConcerns ? (
                        <div className="rounded-[1.25rem] bg-rose-50 p-4 ring-1 ring-rose-100">
                          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-800">
                            Moral Concern
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-700">
                            {verse.moralConcerns}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
