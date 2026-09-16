import { NextRequest, NextResponse } from "next/server";
import { db, ensureReady } from "@/db";
import { habits, completions } from "@/db/schema";
import { eq, count, and } from "drizzle-orm";
import { harvestProgress } from "@/lib/growth";
import { getSessionFromCookies } from "@/lib/auth";

type Params = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, { params }: Params) {
  await ensureReady();
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const { id } = await params;
  const habitId = Number(id);
  if (!Number.isInteger(habitId)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 });
  }

  const [habit] = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, habitId), eq(habits.userId, session.userId)));
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
    .where(and(eq(habits.id, habitId), eq(habits.userId, session.userId)))
    .returning();

  return NextResponse.json({ harvestedCount: updated.harvestedCount });
}
