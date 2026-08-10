// Runs database migrations at build time — safely.
//
// If no database URL is configured (e.g. a preview deploy without Postgres),
// it skips migration and lets the build proceed on seed data. When POSTGRES_URL
// (or DATABASE_URL) is set, it applies any pending Drizzle migrations. Idempotent:
// Drizzle tracks what's already applied, so re-running on every deploy is safe.
import { execSync } from "node:child_process";

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!url) {
  console.log("[migrate] No POSTGRES_URL/DATABASE_URL set — skipping migrations.");
  process.exit(0);
}

console.log("[migrate] Applying database migrations…");
try {
  execSync("npx drizzle-kit migrate", { stdio: "inherit" });
  console.log("[migrate] Done.");
} catch (error) {
  console.error("[migrate] Migration failed.", error?.message ?? error);
  process.exit(1);
}
