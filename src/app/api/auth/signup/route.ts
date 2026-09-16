import { NextRequest, NextResponse } from "next/server";
import { db, ensureReady } from "@/db";
import { users, habits } from "@/db/schema";
import { count, eq, isNull } from "drizzle-orm";
import { hashPassword, setSessionCookie } from "@/lib/auth";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  await ensureReady();
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const [{ value: userCount }] = await db.select({ value: count() }).from(users);
  const passwordHash = await hashPassword(password);

  const [created] = await db.insert(users).values({ email, passwordHash }).returning();

  // The very first account claims any habits created before auth existed,
  // so nobody's existing farm goes missing when this ships.
  if (Number(userCount) === 0) {
    await db.update(habits).set({ userId: created.id }).where(isNull(habits.userId));
  }

  await setSessionCookie({ userId: created.id, email: created.email });

  return NextResponse.json({ id: created.id, email: created.email }, { status: 201 });
}
