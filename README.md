# 🌻 Habitat

Habitat turns your daily habits into a garden. Every time you check off a habit, its plant grows a little more — six stages from a bare seed to an ancient, blooming tree. Miss a day and the plant just waits; your streak resets, but nothing is ever deleted.

Built as a fast, self-contained habit tracker: no sign-up, no external services required to run it locally.

## Features

- 🪴 Create habits with a custom icon and bloom color
- 💧 One-tap "mark done" for today, toggle it back off if you misclick
- 🔥 Live current streak + all-time best streak per habit
- 🌳 Six-stage pixel-art plant growth tied to your streak length (2 / 5 / 10 / 21 / 45 days)
- 📊 Garden-wide stats: total plants, watered today, longest active streak, fully bloomed count
- 🗑️ Soft-delete habits (archived, not destroyed — history is preserved)
- Bubbly pixel/game-inspired UI, fully responsive

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **SQLite** via `better-sqlite3` + **Drizzle ORM** — zero-config local database, no external services to provision
- Self-hosted Google Fonts (`Press Start 2P`, `Baloo 2`) via `@fontsource`

> The original brief mentioned PostgreSQL for production use. This build uses SQLite locally with Drizzle so it runs with zero setup; swapping the Drizzle driver from `better-sqlite3` to a Postgres client (e.g. `postgres-js` or `node-postgres`) is a small, contained change in `src/db/index.ts` and `src/db/schema.ts` (the table definitions are already portable SQL).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). A local SQLite database is created automatically at `data/habitat.db` on first run — nothing else to configure.

### Production build

```bash
npm run build
npm run start
```

## Project structure

```
src/
  app/
    page.tsx              # Garden dashboard (client component)
    api/habits/            # REST API: list/create habits
    api/habits/[id]/        # Edit / archive a habit
    api/habits/[id]/toggle/ # Toggle today's completion
  components/
    HabitCard.tsx          # A single plant card
    AddHabitModal.tsx      # "Plant a habit" form
    PlantSVG.tsx            # Pixel-art plant renderer, stages 0–5
  db/
    schema.ts               # Drizzle table definitions
    index.ts                # SQLite connection + auto-migration on boot
  lib/
    growth.ts                # Streak calculation + growth-stage thresholds
    types.ts
```

## Data model

Two tables: `habits` and `completions` (one row per habit per day it was completed). Streaks and growth stage are derived on the fly from `completions` — nothing is pre-computed or denormalized, so the logic in `src/lib/growth.ts` is the single source of truth and is easy to unit test.

## Roadmap ideas

- User accounts (multi-user support) — the schema has no `userId` yet, but adding one and scoping every query to it is straightforward
- Weekly/custom-day-of-week habit frequencies (currently every habit is daily)
- Habit reordering (drag-and-drop) — `sortOrder` column already exists on the schema
- Reminders / notifications
