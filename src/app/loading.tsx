export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#e7f2e6,transparent_30%),linear-gradient(180deg,#eef6ef_0%,#f8f4ea_100%)] px-6 py-16">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-white/82 p-8 text-center shadow-[0_28px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur">
        <div className="absolute inset-x-10 top-0 h-24 bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_70%)] blur-2xl" />
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-emerald-100" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-emerald-500 border-r-emerald-300 animate-spin" />
          <div className="absolute inset-[16px] rounded-full bg-[radial-gradient(circle,#d1fae5_0%,#86efac_50%,#ecfdf5_100%)] shadow-[0_0_32px_rgba(16,185,129,0.3)]" />
          <div className="relative text-lg font-semibold tracking-[0.18em] text-emerald-950">
            SQ
          </div>
        </div>
        <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">
          Memuat Surat
        </p>
        <h2 className="relative mt-2 text-2xl font-semibold tracking-tight text-slate-950">
          Menyiapkan lembar baca
        </h2>
        <p className="relative mt-3 text-sm leading-7 text-slate-600">
          Mengambil ayat, analisis, dan konteks agar tampilan tetap selaras dengan tema SliceQ.
        </p>
        <div className="relative mt-6 h-2 overflow-hidden rounded-full bg-emerald-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[linear-gradient(90deg,#10b981_0%,#86efac_100%)]" />
        </div>
      </div>
    </div>
  );
}
