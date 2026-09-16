import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Add it to .env.local (see .env.example) — it should point at your Postgres database (e.g. a free Neon project)."
  );
}

// Reuse the connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __habitatSql?: ReturnType<typeof postgres> };

const sql = globalForDb.__habitatSql ?? postgres(connectionString, { max: 1 });
if (process.env.NODE_ENV !== "production") {
  globalForDb.__habitatSql = sql;
}

let bootstrapped = false;

async function bootstrap() {
  if (bootstrapped) return;
  bootstrapped = true;
  await sql`
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '🌱',
      color TEXT NOT NULL DEFAULT 'leaf',
      frequency TEXT NOT NULL DEFAULT 'daily',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      archived BOOLEAN NOT NULL DEFAULT false,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;
  // Backfills the column for databases created before frequency existed.
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'daily'`;
  await sql`
    CREATE TABLE IF NOT EXISTS completions (
      id SERIAL PRIMARY KEY,
      habit_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE(habit_id, date)
    )
  `;
  await sql`CREATE INDEX IF NOT EXISTS idx_completions_habit ON completions(habit_id)`;
}

// Fire-and-forget on module load; every route also awaits ensureReady()
// before its first query so cold starts never race the CREATE TABLE calls.
const readyPromise = bootstrap();

export async function ensureReady() {
  await readyPromise;
}

export const db = drizzle(sql, { schema });
