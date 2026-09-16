# 🌻 Habitat

Habitat turns your habits into a garden. Every time you check off a habit, its plant grows a little more — six stages from a bare seed to an ancient, blooming tree. Miss a period and the plant just waits; your streak resets, but nothing is ever deleted.

## Features

- 🪴 Create habits with a custom icon, bloom color, and frequency (daily / weekly / every 2 weeks / monthly)
- 💧 One-tap "mark done" for today, toggle it back off if you misclick
- 🔥 Live current streak + all-time best streak, measured in the habit's own unit (days, weeks, biweekly periods, or months)
- 🌳 Six-stage pixel-art plant growth tied to streak length — thresholds are tuned per frequency so a weekly habit blooms on a similar real-world timeline to a daily one
- 🌻 **My Garden view** — see every plant growing together in one scene, hover/tap any plant for its name and streak
- 📊 Garden-wide stats: total plants, on track today, longest active streak, fully bloomed count
- 🗑️ Soft-delete habits (archived, not destroyed — history is preserved)
- Bubbly pixel/game-inspired UI, fully responsive

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **PostgreSQL** via `postgres` (postgres-js) + **Drizzle ORM** — works with any Postgres, including a free [Neon](https://neon.tech) project
- Self-hosted Google Fonts (`Press Start 2P`, `Baloo 2`) via `@fontsource`


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
