import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { completions, habits } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { todayKey } from "@/lib/growth";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const habitId = Number(id);
  if (!Number.isInteger(habitId)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 });
  }

  const [habit] = await db.select().from(habits).where(eq(habits.id, habitId));
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const date: string = typeof body?.date === "string" ? body.date : todayKey();

  const [existing] = await db
    .select()
    .from(completions)
    .where(and(eq(completions.habitId, habitId), eq(completions.date, date)));

  if (existing) {
    await db.delete(completions).where(eq(completions.id, existing.id));
    return NextResponse.json({ completed: false, date });
  }

  await db.insert(completions).values({ habitId, date, createdAt: new Date().toISOString() });
  return NextResponse.json({ completed: true, date });
}
