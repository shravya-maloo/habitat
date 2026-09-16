import { NextRequest, NextResponse } from "next/server";
import { db, ensureReady } from "@/db";
import { habits, completions } from "@/db/schema";
import { eq } from "drizzle-orm";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  await ensureReady();
  const { id } = await params;
  const habitId = Number(id);
  if (!Number.isInteger(habitId)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 });
  }

  const body = await req.json();
  const updates: Partial<typeof habits.$inferInsert> = {};

  if (typeof body?.name === "string") {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (name.length > 40) return NextResponse.json({ error: "Keep it under 40 characters" }, { status: 400 });
    updates.name = name;
  }
  if (typeof body?.emoji === "string") updates.emoji = body.emoji;
  if (typeof body?.color === "string") updates.color = body.color;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const [updated] = await db.update(habits).set(updates).where(eq(habits.id, habitId)).returning();
  if (!updated) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  await ensureReady();
  const { id } = await params;
  const habitId = Number(id);
  if (!Number.isInteger(habitId)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 });
  }

  // Soft-delete so history (and the grown garden!) survives an accidental click.
  const [archived] = await db
    .update(habits)
    .set({ archived: true })
    .where(eq(habits.id, habitId))
    .returning();

  if (!archived) return NextResponse.json({ error: "Habit not found" }, { status: 404 });

  return NextResponse.json({ ok: true });
}

// Fully purge a habit and its completion history. Used by the "delete forever" action.
export async function POST(_req: NextRequest, { params }: Params) {
  await ensureReady();
  const { id } = await params;
  const habitId = Number(id);
  if (!Number.isInteger(habitId)) {
    return NextResponse.json({ error: "Invalid habit id" }, { status: 400 });
  }

  await db.delete(completions).where(eq(completions.habitId, habitId));
  await db.delete(habits).where(eq(habits.id, habitId));

  return NextResponse.json({ ok: true });
}
