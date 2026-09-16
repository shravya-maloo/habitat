import { NextRequest, NextResponse } from "next/server";
import { db, ensureReady } from "@/db";
import { habits, completions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";
import { FLOWER_TYPES } from "@/lib/flowers";

export async function GET() {
  await ensureReady();
  const allHabits = await db
    .select()
    .from(habits)
    .where(eq(habits.archived, false))
    .orderBy(asc(habits.sortOrder), asc(habits.id));

  const allCompletions = await db.select().from(completions);

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

  const existing = await db.select().from(habits);

  const [created] = await db
    .insert(habits)
    .values({
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
