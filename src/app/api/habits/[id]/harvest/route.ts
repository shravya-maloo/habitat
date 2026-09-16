import { NextRequest, NextResponse } from "next/server";
import { db, ensureReady } from "@/db";
import { habits, completions } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { harvestProgress } from "@/lib/growth";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  await ensureReady();
  const { id } = await params;
  const habitId = Number(id);
  if (!Number.isInteger(habitId)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 });
  }

  const [habit] = await db.select().from(habits).where(eq(habits.id, habitId));
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  const [{ value: total }] = await db
    .select({ value: count() })
    .from(completions)
    .where(eq(completions.habitId, habitId));

  const progress = harvestProgress(Number(total), habit.harvestedCount);
  if (!progress.ready) {
    return NextResponse.json({ error: "Not fully grown yet" }, { status: 400 });
  }

  const [updated] = await db
    .update(habits)
    .set({ harvestedCount: habit.harvestedCount + 1 })
    .where(eq(habits.id, habitId))
    .returning();

  return NextResponse.json({ harvestedCount: updated.harvestedCount });
}
