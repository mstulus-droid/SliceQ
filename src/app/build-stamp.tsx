import { getAppVersionInfo } from "@/lib/app-version";

export function BuildStamp() {
  const version = getAppVersionInfo();

  return (
    <p className="text-[11px] leading-5 text-slate-500">
      versi commit {version.commit}
    </p>
  );
}
