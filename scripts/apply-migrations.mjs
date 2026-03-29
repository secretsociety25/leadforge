/**
 * Applies SQL files in supabase/migrations/ in filename order via Postgres.
 *
 * The Supabase JS admin client (service role) talks to PostgREST only — it cannot
 * execute arbitrary DDL. Schema changes require this script, Supabase CLI
 * (`supabase db push`), or the SQL Editor in the dashboard.
 *
 * Prerequisites:
 *   1. npm install (installs devDependency `pg`)
 *   2. Add DATABASE_URL to .env.local — Supabase → Project Settings → Database
 *      → Connection string → URI (use the pooler or direct host; include the
 *      database password, not the anon/service_role JWT).
 *
 * Usage: npm run db:migrate
 */

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const migrationsDir = join(root, "supabase", "migrations");

function loadDotEnvFile(relPath) {
  try {
    const raw = readFileSync(join(root, relPath), "utf8");
    for (const line of raw.split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      let val = t.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = val;
    }
  } catch {
    // optional file
  }
}

loadDotEnvFile(".env.local");
loadDotEnvFile(".env");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "Missing DATABASE_URL. Add the Postgres connection URI from Supabase (Settings → Database) to .env.local.\n" +
      "The service role key is not a database password and cannot be used here.",
  );
  process.exit(1);
}

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.error("No .sql files in", migrationsDir);
  process.exit(1);
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes("localhost")
    ? undefined
    : { rejectUnauthorized: false },
});

await client.connect();

try {
  for (const name of files) {
    const sql = readFileSync(join(migrationsDir, name), "utf8");
    process.stdout.write(`Applying ${name} … `);
    await client.query(sql);
    console.log("ok");
  }
  console.log("All migrations applied.");
} catch (err) {
  console.error("\nMigration failed:", err.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
