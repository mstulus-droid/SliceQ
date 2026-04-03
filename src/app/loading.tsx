import Image from "next/image";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#e7f2e6,transparent_30%),linear-gradient(180deg,#eef6ef_0%,#f8f4ea_100%)] px-6 py-16">
      <div className="relative flex flex-col items-center text-center">
        {/* Glow backdrop */}
        <div className="absolute -inset-10 rounded-full bg-emerald-400/10 blur-3xl" />

        {/* Spinner rings */}
        <div className="relative">
          <div className="absolute inset-0 animate-[spin_3s_linear_infinite] rounded-full border-2 border-dashed border-emerald-200/60" />
          <div className="absolute -inset-3 animate-[spin_2s_linear_infinite_reverse] rounded-full border-2 border-dotted border-emerald-300/50" />
          <div className="absolute -inset-6 animate-[spin_4s_linear_infinite] rounded-full border border-emerald-200/40" />

          {/* Icon container with pulse */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl animate-[pulse_2s_ease-in-out_infinite]">
            <Image
              src="/brand/sliceq-icon.webp"
              alt="SliceQ"
              width={72}
              height={72}
              className="h-16 w-16 object-contain animate-[bounce_2s_ease-in-out_infinite] drop-shadow-[0_6px_20px_rgba(16,185,129,0.35)]"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
