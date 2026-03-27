import path from "node:path";
import dotenv from "dotenv";

export function loadEnv() {
  const root = process.cwd();

  dotenv.config({ path: path.join(root, ".env.local") });
  dotenv.config({ path: path.join(root, ".env") });
}
