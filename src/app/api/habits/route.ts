import { NextRequest, NextResponse } from "next/server";
import { db, ensureReady } from "@/db";
import { habits, completions } from "@/db/schema";
import { asc, eq, and, inArray, gte, sql } from "drizzle-orm";
import { FLOWER_TYPES } from "@/lib/flowers";
import { getSessionFromCookies } from "@/lib/auth";

export async function GET() {
  await ensureReady();
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const allHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, session.userId), eq(habits.archived, false)))
    .orderBy(asc(habits.sortOrder), asc(habits.id));

  const ids = allHabits.map((h) => h.id);
  const allCompletions = ids.length
    ? await db.select().from(completions).where(inArray(completions.habitId, ids))
    : [];

  const result = allHabits.map((h) => ({
    ...h,
    dates: allCompletions.filter((c) => c.habitId === h.id).map((c) => c.date),
  }));

  return NextResponse.json(result);
}

const COLORS = ["leaf", "sun", "berry", "sky", "grape"];
const EMOJIS = FLOWER_TYPES.map((f) => f.emoji);
const FREQUENCIES = ["daily", "weekly", "biweekly", "monthly"];

export async function POST(req: NextRequest) {
  await ensureReady();
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const name = String(body?.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (name.length > 40) {
    return NextResponse.json({ error: "Keep it under 40 characters" }, { status: 400 });
  }

  const emoji = EMOJIS.includes(body?.emoji) ? body.emoji : FLOWER_TYPES[0].emoji;
  const color = COLORS.includes(body?.color) ? body.color : COLORS[Math.floor(Math.random() * COLORS.length)];
  const frequency = FREQUENCIES.includes(body?.frequency) ? body.frequency : "daily";

  // Idempotency guard: a double-tap, a slow-network re-click, or a retried
  // request can fire this twice in quick succession. If an identical habit
  // for this user was created in the last few seconds, return it instead of
  // creating a duplicate.
  const fiveSecondsAgo = new Date(Date.now() - 5000);
  const [recentDuplicate] = await db
    .select()
    .from(habits)
    .where(
      and(
        eq(habits.userId, session.userId),
        eq(habits.archived, false),
        sql`lower(${habits.name}) = lower(${name})`,
        eq(habits.frequency, frequency),
        gte(habits.createdAt, fiveSecondsAgo)
      )
    )
    .orderBy(asc(habits.id))
    .limit(1);

  if (recentDuplicate) {
    return NextResponse.json({ ...recentDuplicate, dates: [] }, { status: 200 });
  }

  const existing = await db.select().from(habits).where(eq(habits.userId, session.userId));

  try {
    const [created] = await db
      .insert(habits)
      .values({
        userId: session.userId,
        name,
        emoji,
        color,
        frequency,
        sortOrder: existing.length,
        posX: 15 + Math.random() * 70,
        posY: 20 + Math.random() * 55,
      })
      .returning();

    return NextResponse.json({ ...created, dates: [] }, { status: 201 });
  } catch (err) {
    // Postgres unique_violation: two concurrent requests can both pass the
    // time-window check above before either has inserted. The database
    // constraint is what actually stops the duplicate — when it fires,
    // return the habit that won the race instead of erroring out.
    const isUniqueViolation =
      (err as { code?: string })?.code === "23505" || (err as { cause?: { code?: string } })?.cause?.code === "23505";
    if (isUniqueViolation) {
      const [winner] = await db
        .select()
        .from(habits)
        .where(and(eq(habits.userId, session.userId), eq(habits.archived, false), sql`lower(${habits.name}) = lower(${name})`))
        .limit(1);
      if (winner) return NextResponse.json({ ...winner, dates: [] }, { status: 200 });
    }
    throw err;
  }
}
