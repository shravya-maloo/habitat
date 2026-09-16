import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { habits, completions } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export async function GET() {
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
const EMOJIS = ["🌱", "💧", "📚", "🏃", "🧘", "🎨", "🎵", "🥗", "😴", "✍️"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = String(body?.name ?? "").trim();

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (name.length > 40) {
    return NextResponse.json({ error: "Keep it under 40 characters" }, { status: 400 });
  }

  const emoji = EMOJIS.includes(body?.emoji) ? body.emoji : "🌱";
  const color = COLORS.includes(body?.color) ? body.color : COLORS[Math.floor(Math.random() * COLORS.length)];

  const existing = await db.select().from(habits);

  const [created] = await db
    .insert(habits)
    .values({
      name,
      emoji,
      color,
      createdAt: new Date().toISOString(),
      sortOrder: existing.length,
    })
    .returning();

  return NextResponse.json({ ...created, dates: [] }, { status: 201 });
}
