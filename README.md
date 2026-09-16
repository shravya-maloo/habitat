# 🌻 Habitat

Habitat turns your habits into a garden. Every time you check off a habit, its plant grows a little more — six stages from a bare seed to an ancient, blooming tree. Miss a period and the plant just waits; your streak resets, but nothing is ever deleted.

## Features

- 🌾 **Farm view only** — one interactive scene with every plant in it; no separate card list, this is the whole app
- 🪴 Create habits with a flower type (sunflower, rose, tulip, daisy, lotus, hibiscus — each with its own distinct bloom shape), a petal color, and a frequency (daily / weekly / every 2 weeks / monthly)
- Interaction model in the farm: **tap a flower to edit it**, **hold and drag to move it**, **drop it on the 🗑️ to remove it** — a small 💧/🧺 badge on each flower logs today's completion or harvests it, kept separate so it never conflicts with editing or dragging
- 🔥 Live current streak + all-time best streak, measured in the habit's own unit (days, weeks, biweekly periods, or months)
- 🌱 Each plant grows through 6 visual stages as you rack up completions — every 5 completions (all-time) fully grows it
- 🧺 **Harvesting** — once a plant is fully grown, tap its badge to harvest it: petals rain across the screen and the plant resets to a seed to start its next growth cycle
- 📊 Garden-wide stats: total plants, on track today, longest active streak, ready to harvest
- 🗑️ Soft-delete habits (archived, not destroyed — history is preserved)
- Bright, colorful, bubbly UI with a grass-textured background, fully responsive

## Tech stack

- **Next.js 16** (App Router, TypeScript)
- **Tailwind CSS v4**
- **PostgreSQL** via `postgres` (postgres-js) + **Drizzle ORM** — works with any Postgres, including a free [Neon](https://neon.tech) project
- Self-hosted Google Font (`Baloo 2`) via `@fontsource`

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
