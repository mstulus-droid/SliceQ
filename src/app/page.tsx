import Link from "next/link";
import { DatabaseUnavailable } from "@/app/database-unavailable";
import { getDatabaseErrorInfo } from "@/lib/db";
import { getSurahs } from "@/lib/quran-data";

export default async function Home() {
  let surahs;

  try {
    surahs = await getSurahs();
  } catch (error) {
    return <DatabaseUnavailable {...getDatabaseErrorInfo(error)} />;
  }

  const quickQueries = ["rahmat", "tauhid", "waris", "munafik", "kiamat"];

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#eef5ef_0%,#f8f3e8_48%,#f3eee5_100%)] px-4 py-5 text-slate-900 sm:px-6 sm:py-8 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <section className="rounded-[1.75rem] border border-white/70 bg-white/85 p-4 shadow-[0_18px_60px_-42px_rgba(15,23,42,0.45)] backdrop-blur sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
                SliceQ
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                Langsung mulai dari daftar surat.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Homepage ini dibuat sesingkat mungkin: cari ayat, lompat ke surat tertentu,
                atau telusuri seluruh surat dari satu daftar yang ringan dibaca di HP.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm font-semibold">
              <Link
                href="/bookmark"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-slate-800 transition hover:bg-slate-50"
              >
                Bookmark
              </Link>
              <Link
                href="/cari"
                className="rounded-full bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800"
              >
                Buka Pencarian
              </Link>
            </div>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
            <form
              action="/cari"
              className="rounded-[1.5rem] bg-slate-950 p-4 text-white shadow-[0_18px_50px_-36px_rgba(15,23,42,0.8)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
                Cari Ayat
              </p>
              <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                <div className="min-w-0 flex-1 rounded-[1rem] bg-white px-4 py-3">
                  <input
                    name="q"
                    placeholder="Cari terjemahan, topik, kritik, atau anotasi"
                    className="w-full bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                >
                  Cari
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                {quickQueries.map((item) => (
                  <Link
                    key={item}
                    href={`/cari?q=${encodeURIComponent(item)}`}
                    className="rounded-full border border-white/10 px-3 py-1.5 transition hover:bg-white/10"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </form>

            <form
              action="/cari"
              className="rounded-[1.5rem] bg-[#faf7ef] p-4 ring-1 ring-amber-100"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">
                Lompat Cepat
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  name="surah"
                  inputMode="numeric"
                  placeholder="Nomor surat"
                  className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
                />
                <input
                  name="ayat"
                  inputMode="numeric"
                  placeholder="Nomor ayat"
                  className="rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 outline-none placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-fit"
                >
                  Buka
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                Isi nomor surat saja untuk memilih ayat di halaman cari, atau isi surat dan ayat sekaligus untuk langsung menuju ayatnya.
              </p>
            </form>
          </div>
        </section>

        <section className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_20px_60px_-40px_rgba(15,23,42,0.45)]">
          <div className="border-b border-slate-200 bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300 sm:px-5">
            <div className="hidden grid-cols-[64px_minmax(0,1fr)_minmax(110px,auto)_70px] items-center gap-4 md:grid">
              <span>No</span>
              <span>Nama Surat</span>
              <span className="text-right">Arab</span>
              <span className="text-right">Ayat</span>
            </div>
            <div className="md:hidden">Daftar Surat</div>
          </div>

          <div className="divide-y divide-slate-200">
            {surahs.map((surah) => (
              <Link
                key={surah.id}
                href={`/surat/${surah.id}`}
                className="block px-4 py-3 transition hover:bg-slate-50 sm:px-5"
              >
                <div className="hidden grid-cols-[64px_minmax(0,1fr)_minmax(110px,auto)_70px] items-center gap-4 md:grid">
                  <span className="text-sm font-semibold text-emerald-800">
                    {surah.id}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-slate-950">
                      {surah.nameLatin}
                    </p>
                    <p className="truncate text-sm text-slate-500">
                      {surah.meaning} • {surah.revelationPlace}
                    </p>
                  </div>
                  <p className="truncate text-right text-2xl text-slate-950">
                    {surah.nameArabic}
                  </p>
                  <p className="text-right text-sm text-slate-500">
                    {surah.verseCount}
                  </p>
                </div>

                <div className="flex items-center gap-3 md:hidden">
                  <span className="w-7 shrink-0 text-sm font-semibold text-emerald-800">
                    {surah.id}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {surah.nameLatin}
                      </p>
                      <p className="truncate text-lg text-slate-950">
                        {surah.nameArabic}
                      </p>
                    </div>
                    <p className="truncate text-xs text-slate-500">
                      {surah.revelationPlace} • {surah.verseCount} ayat • {surah.meaning}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
