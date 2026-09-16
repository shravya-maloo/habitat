import { NextRequest, NextResponse } from "next/server";
import { db, ensureReady } from "@/db";
import { habits, completions } from "@/db/schema";
import { asc, eq, and, inArray } from "drizzle-orm";
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

  const existing = await db.select().from(habits).where(eq(habits.userId, session.userId));

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
}
