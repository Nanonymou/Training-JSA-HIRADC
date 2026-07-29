import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "@/lib/db/schema";

/**
 * The Drizzle database client, lazily created from the connection string.
 *
 * Vercel Postgres exposes the URL as POSTGRES_URL. When it's absent — local dev
 * or a preview without a database — `getDb()` returns null and callers fall back
 * to seed data, so the app runs end-to-end before a database is provisioned. The
 * pool is a module singleton to survive hot reloads and reuse connections.
 */
const connectionString =
  process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";

export const isDbConfigured = connectionString.length > 0;

let pool: Pool | null = null;
let db: NodePgDatabase<typeof schema> | null = null;

export function getDb(): NodePgDatabase<typeof schema> | null {
  if (!isDbConfigured) return null;
  if (!db) {
    pool = new Pool({ connectionString });
    db = drizzle(pool, { schema });
  }
  return db;
}
