import Image from "next/image";

export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#efe6ce,transparent_34%),linear-gradient(180deg,#fbf6ea_0%,#f0e6d5_100%)] px-6 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div className="relative aspect-[1120/1120] w-full max-w-[220px]">
          <Image
            src="/brand/sliceq-atasbawah.webp"
            alt="SliceQ intro"
            fill
            priority
            sizes="220px"
            className="object-contain"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-amber-800">
            Memuat SliceQ
          </p>
          <p className="text-sm leading-7 text-slate-700">
            Menyiapkan daftar surat, ayat, dan analisis.
          </p>
        </div>
      </div>
    </main>
  );
}
