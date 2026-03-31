import { execSync } from "node:child_process";
import { cache } from "react";

export type AppVersionInfo = {
  commit: string;
  label: string;
};

export const getAppVersionInfo = cache((): AppVersionInfo => {
  const commitFromEnv =
    process.env.NEXT_PUBLIC_APP_COMMIT ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    process.env.GITHUB_SHA;

  const shortCommit =
    commitFromEnv?.trim().slice(0, 7) ||
    getGitCommitFromShell() ||
    "unknown";

  return {
    commit: shortCommit,
    label: `Build ${shortCommit}`,
  };
});

function getGitCommitFromShell() {
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}
