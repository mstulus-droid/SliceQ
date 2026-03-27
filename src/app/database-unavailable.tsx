import Link from "next/link";

type DatabaseUnavailableProps = {
  title: string;
  summary: string;
  detail: string;
};

export function DatabaseUnavailable({
  title,
  summary,
  detail,
}: DatabaseUnavailableProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e7f7ee,transparent_30%),linear-gradient(180deg,#fcf6ea_0%,#fffdf7_45%,#f6f1e8_100%)] px-5 py-8 text-slate-900 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
        <section className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_80px_-30px_rgba(27,46,30,0.35)] backdrop-blur sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-700">
            SliceQ Dev Notice
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700 sm:text-lg">
            {summary}
          </p>

          <div className="mt-6 rounded-[1.5rem] bg-slate-950 p-5 text-sm leading-7 text-slate-200">
            <p className="font-semibold text-white">Detail runtime</p>
            <p className="mt-2 break-words text-slate-300">{detail}</p>
          </div>

          <div className="mt-6 rounded-[1.5rem] bg-[#faf7ef] p-5 ring-1 ring-amber-100">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Yang perlu dicek
            </p>
            <div className="mt-3 space-y-2 text-sm leading-7 text-slate-700">
              <p>1. Pastikan `DATABASE_URL` di `.env.local` mengarah ke host yang benar dan bisa diakses.</p>
              <p>2. Kalau mau jalan lokal, pakai format dari `.env.example`: `postgresql://postgres:postgres@localhost:5432/sliceq`.</p>
              <p>3. Kalau tetap pakai Supabase, cek DNS internet, nama host, port, dan password yang sudah di-encode.</p>
              <p>4. Setelah `.env.local` diubah, restart `npm run dev`.</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Coba buka beranda
            </Link>
            <Link
              href="/sinkronisasi"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Buka halaman sinkronisasi
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
