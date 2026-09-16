# Habitat

Habitat turns your habits into a garden. Every time you check off a habit, its plant grows a little more — six stages from a bare seed to an ancient, blooming tree. Miss a period and the plant just waits; your streak resets, but nothing is ever deleted.

Access it here: https://habitat-sigma-nine.vercel.app/

## Features

<<<<<<< HEAD
=======
- 🔐 **Accounts** — email/password sign-up and login; every farm is private to its owner
>>>>>>> ef80b29 (Add authentication: email/password login, session cookies, per-user data isolation)
- 🌾 **The Farm** — one interactive scene with every plant in it; no separate card list, this is the whole app
- 🪴 Create habits with a flower type (sunflower, rose, tulip, daisy, lotus, hibiscus — each with its own distinct bloom shape), a petal color, and a frequency (daily / weekly / every 2 weeks / monthly)
- Interaction model in the farm: **tap a flower to edit it**, **hold and drag to move it**, **drop it on the 🗑️ to remove it** — a small 💧/🧺 badge on each flower logs today's completion or harvests it, kept separate so it never conflicts with editing or dragging
- 🔥 Live current streak + all-time best streak, measured in the habit's own unit (days, weeks, biweekly periods, or months)
- 🌱 Each plant grows through 6 visual stages as you rack up completions — every 5 completions (all-time) fully grows it
- 🧺 **Harvesting** — once a plant is fully grown, tap its badge to harvest it: petals rain across the screen and the plant resets to a seed to start its next growth cycle
- 📊 Garden-wide stats: total plants, on track today, longest active streak, ready to harvest
- 🗑️ Soft-delete habits (archived, not destroyed — history is preserved)
- Bright, colorful, bubbly UI with a grass-textured background, fully responsive

## Tech stack

- **Next.js 16** (App Router, TypeScript), protected by middleware-based auth
- **Tailwind CSS v4**
- **PostgreSQL** via `postgres` (postgres-js) + **Drizzle ORM** — works with any Postgres, including a free [Neon](https://neon.tech) project
- Auth: `bcryptjs` for password hashing, `jose` for signed session cookies — no third-party auth service
- Self-hosted Google Font (`Baloo 2`) via `@fontsource`

## Getting started

1. Create a Postgres database (e.g. a free [Neon](https://neon.tech) project) and copy its connection string.
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` and `AUTH_SECRET` (any long random string — `openssl rand -base64 32` works).
3. `npm install && npm run dev`, then open [http://localhost:3000](http://localhost:3000) — you'll land on the sign-up page.

### Deploying (Vercel)

Add `DATABASE_URL` and `AUTH_SECRET` as environment variables in the Vercel project, then deploy. Tables and columns are created/migrated automatically on first request.

## Project structure

```
src/
  app/
    page.tsx                    # Farm view (client component)
    login/, signup/              # Auth pages
    api/auth/                     # signup / login / logout / me
    api/habits/                    # List/create habits (scoped to the logged-in user)
    api/habits/[id]/                 # Edit / archive a habit
    api/habits/[id]/toggle/           # Toggle today's completion
    api/habits/[id]/harvest/           # Harvest a fully-grown plant
  components/
    GardenView.tsx               # The farm: drag to move, tap to edit, badge to log/harvest
    HabitModal.tsx                # Create/edit habit form (also handles remove)
    PlantSVG.tsx                   # Per-flower-type bloom renderer, stages 0–5
    PetalBurst.tsx                  # Harvest celebration animation
  db/
    schema.ts                    # Drizzle table definitions (users, habits, completions)
    index.ts                     # Postgres connection + auto-migration on boot
  lib/
    auth.ts                      # Password hashing + session cookie helpers
    growth.ts                    # Streak calculation + harvest-cycle logic
    flowers.ts                   # Flower type definitions
    types.ts
  middleware.ts                  # Redirects unauthenticated visitors to /login
```

## Data model

<<<<<<< HEAD
Two tables: `habits` and `completions` (one row per habit per day it was completed). Streaks and growth stage are derived on the fly from `completions` — nothing is pre-computed or denormalized, so the logic in `src/lib/growth.ts` is the single source of truth and is easy to unit test.

=======
Three tables: `users`, `habits` (each owned by a `userId`), and `completions` (one row per habit per day it was completed). Streaks and growth stage are derived on the fly from `completions` — nothing is pre-computed or denormalized, so the logic in `src/lib/growth.ts` is the single source of truth and is easy to unit test.
>>>>>>> ef80b29 (Add authentication: email/password login, session cookies, per-user data isolation)
