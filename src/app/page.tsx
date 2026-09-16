"use client";

import { useEffect, useMemo, useState } from "react";
import HabitCard from "@/components/HabitCard";
import AddHabitModal from "@/components/AddHabitModal";
import { currentStreak, todayKey } from "@/lib/growth";
import type { HabitWithDates } from "@/lib/types";

export default function Home() {
  const [habits, setHabits] = useState<HabitWithDates[] | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then(setHabits)
      .catch(() => setHabits([]));
  }, []);

  const stats = useMemo(() => {
    if (!habits) return null;
    const today = todayKey();
    const doneToday = habits.filter((h) => h.dates.includes(today)).length;
    const longestStreak = habits.reduce((max, h) => Math.max(max, currentStreak(h.dates)), 0);
    const grownPlants = habits.filter((h) => currentStreak(h.dates) >= 21).length;
    return { total: habits.length, doneToday, longestStreak, grownPlants };
  }, [habits]);

  function handleToggle(id: number, nowCompleted: boolean) {
    setHabits((prev) =>
      prev
        ? prev.map((h) => {
            if (h.id !== id) return h;
            const today = todayKey();
            const dates = nowCompleted
              ? [...h.dates, today]
              : h.dates.filter((d) => d !== today);
            return { ...h, dates };
          })
        : prev
    );
  }

  async function handleDelete(id: number) {
    setHabits((prev) => (prev ? prev.filter((h) => h.id !== id) : prev));
    await fetch(`/api/habits/${id}`, { method: "DELETE" });
  }

  function handleCreated(newHabit: unknown) {
    setHabits((prev) => (prev ? [...prev, newHabit as HabitWithDates] : [newHabit as HabitWithDates]));
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      <header className="w-full max-w-5xl flex flex-col items-center text-center gap-2 mb-8">
        <h1 className="text-2xl sm:text-3xl" style={{ color: "var(--leaf-dark)" }}>
          🌻 HABITAT
        </h1>
        <p className="text-[var(--ink-soft)] font-medium max-w-md">
          Every day you show up, something grows. Miss a day and it waits patiently — pick it back up whenever you&apos;re ready.
        </p>
      </header>

      {stats && habits && habits.length > 0 && (
        <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatPill emoji="🪴" value={stats.total} label="Plants" />
          <StatPill emoji="💧" value={`${stats.doneToday}/${stats.total}`} label="Watered today" />
          <StatPill emoji="🔥" value={stats.longestStreak} label="Best active streak" />
          <StatPill emoji="🌳" value={stats.grownPlants} label="Fully bloomed" />
        </div>
      )}

      <section className="w-full max-w-5xl">
        {habits === null && (
          <p className="text-center text-[var(--ink-soft)] pixel-text text-xs py-16">Loading your garden…</p>
        )}

        {habits && habits.length === 0 && (
          <div className="bubble-card p-8 text-center max-w-md mx-auto flex flex-col items-center gap-3">
            <span className="text-4xl">🌱</span>
            <h2 className="text-base">Your garden is empty</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Plant your first habit and check back in daily — it grows with your streak.
            </p>
          </div>
        )}

        {habits && habits.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center">
            {habits.map((h) => (
              <HabitCard key={h.id} habit={h} onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </section>

      <button
        onClick={() => setShowModal(true)}
        className="bubble-btn fixed bottom-6 right-6 px-5 py-3 text-sm z-30"
        style={{ background: "var(--sun)" }}
      >
        + Plant a habit
      </button>

      {showModal && <AddHabitModal onClose={() => setShowModal(false)} onCreated={handleCreated} />}
    </main>
  );
}

function StatPill({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
  return (
    <div className="bubble-card px-3 py-3 flex flex-col items-center gap-0.5">
      <span className="text-xl">{emoji}</span>
      <span className="text-lg font-extrabold">{value}</span>
      <span className="text-[11px] text-[var(--ink-soft)] text-center leading-tight">{label}</span>
    </div>
  );
}
