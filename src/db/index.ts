import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import path from "path";
import fs from "fs";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, "habitat.db");

// Reuse the connection across hot reloads in dev.
const globalForDb = globalThis as unknown as { __habitatSqlite?: Database.Database };

const sqlite = globalForDb.__habitatSqlite ?? new Database(dbPath);
if (process.env.NODE_ENV !== "production") {
  globalForDb.__habitatSqlite = sqlite;
}

sqlite.pragma("journal_mode = WAL");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS habits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL DEFAULT '🌱',
    color TEXT NOT NULL DEFAULT 'leaf',
    created_at TEXT NOT NULL,
    archived INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    habit_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT NOT NULL,
    UNIQUE(habit_id, date)
  );

  CREATE INDEX IF NOT EXISTS idx_completions_habit ON completions(habit_id);
`);

export const db = drizzle(sqlite, { schema });
