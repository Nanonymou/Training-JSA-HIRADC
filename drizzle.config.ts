import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit config.
 *
 * Points at the schema and where generated SQL migrations land. The connection
 * string is only needed for commands that touch a live database (push/migrate);
 * `generate` works offline from the schema. Vercel Postgres exposes the URL as
 * POSTGRES_URL.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./db/migrations",
  dbCredentials: {
    url: process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "",
  },
});
