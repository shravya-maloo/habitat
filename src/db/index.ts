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
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS habits (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      name TEXT NOT NULL,
      emoji TEXT NOT NULL DEFAULT '🌱',
      color TEXT NOT NULL DEFAULT 'leaf',
      frequency TEXT NOT NULL DEFAULT 'daily',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      archived BOOLEAN NOT NULL DEFAULT false,
      sort_order INTEGER NOT NULL DEFAULT 0,
      harvested_count INTEGER NOT NULL DEFAULT 0,
      pos_x DOUBLE PRECISION NOT NULL DEFAULT 50,
      pos_y DOUBLE PRECISION NOT NULL DEFAULT 50
    )
  `;
  // Backfills for databases created before these columns existed.
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'daily'`;
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS harvested_count INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS pos_x DOUBLE PRECISION NOT NULL DEFAULT 50`;
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS pos_y DOUBLE PRECISION NOT NULL DEFAULT 50`;
  // user_id is nullable at the DB level so this migration is non-destructive on
  // an existing table; the very first person to sign up claims every
  // previously-unowned habit (see /api/auth/signup) so nothing is orphaned.
  await sql`ALTER TABLE habits ADD COLUMN IF NOT EXISTS user_id INTEGER`;
  await sql`CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id)`;

  // Clean up existing duplicates (created by the exact race condition this
  // migration fixes) before adding the uniqueness constraint below — archive
  // all but the oldest habit in each duplicate (user_id, name) group so no
  // data is destroyed, just hidden the same way any other archive is.
  await sql`
    WITH ranked AS (
      SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id, lower(name) ORDER BY id) AS rn
      FROM habits
      WHERE archived = false AND user_id IS NOT NULL
    )
    UPDATE habits SET archived = true WHERE id IN (SELECT id FROM ranked WHERE rn > 1)
  `;

  // Prevents the actual race condition a double-tap/slow-network re-click
  // causes: two concurrent requests can both pass an application-level
  // "does this already exist?" check before either has inserted. A real
  // unique constraint is atomic and closes that window regardless of timing.
  try {
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_user_name_unique
      ON habits (user_id, lower(name))
      WHERE archived = false AND user_id IS NOT NULL
    `;
  } catch (err) {
    console.error("Could not create idx_habits_user_name_unique — duplicate-prevention will rely on the application-level check only.", err);
  }
  // Prevents the actual race condition a double-tap/slow-network re-click
  // causes: two concurrent requests can both pass an application-level
  // "does this already exist?" check before either has inserted. A real
  // unique constraint is atomic and closes that window regardless of timing.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_habits_user_name_unique
    ON habits (user_id, lower(name))
    WHERE archived = false AND user_id IS NOT NULL
  `;
  // Existing rows created before pos_x/pos_y existed all default to the same
  // spot (50,50) — scatter them a bit so old farms don't open with every
  // plant stacked in the center.
  await sql`
    UPDATE habits
    SET pos_x = 15 + (id * 37 % 70), pos_y = 20 + (id * 53 % 60)
    WHERE pos_x = 50 AND pos_y = 50
  `;
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
