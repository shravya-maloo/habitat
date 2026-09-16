"use client";

import { useEffect, useMemo, useState } from "react";
import HabitModal from "@/components/HabitModal";
import GardenView from "@/components/GardenView";
import PixelEmoji from "@/components/PixelEmoji";
import { currentStreak, harvestProgress, todayKey, hasDoneCurrentPeriod } from "@/lib/growth";
import type { HabitWithDates } from "@/lib/types";

export default function Home() {
  const [habits, setHabits] = useState<HabitWithDates[] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<HabitWithDates | null>(null);

  useEffect(() => {
    fetch("/api/habits")
      .then((r) => r.json())
      .then(setHabits)
      .catch(() => setHabits([]));
  }, []);

  const stats = useMemo(() => {
    if (!habits) return null;
    const doneToday = habits.filter((h) => hasDoneCurrentPeriod(h.dates, h.frequency)).length;
    const longestStreak = habits.reduce(
      (max, h) => Math.max(max, currentStreak(h.dates, h.frequency)),
      0
    );
    const readyToHarvest = habits.filter(
      (h) => harvestProgress(h.dates.length, h.harvestedCount).ready
    ).length;
    return { total: habits.length, doneToday, longestStreak, readyToHarvest };
  }, [habits]);

  async function handleToggleToday(id: number) {
    try {
      const res = await fetch(`/api/habits/${id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setHabits((prev) =>
        prev
          ? prev.map((h) => {
              if (h.id !== id) return h;
              const today = todayKey();
              const dates = data.completed ? [...h.dates, today] : h.dates.filter((d) => d !== today);
              return { ...h, dates };
            })
          : prev
      );
    } catch {
      // best-effort; the badge just won't update if this fails
    }
  }

  async function handleDelete(id: number) {
    setHabits((prev) => (prev ? prev.filter((h) => h.id !== id) : prev));
    await fetch(`/api/habits/${id}`, { method: "DELETE" }).catch(() => {});
  }

  function handleCreated(newHabit: unknown) {
    setHabits((prev) => (prev ? [...prev, newHabit as HabitWithDates] : [newHabit as HabitWithDates]));
  }

  function handleSaved(updated: HabitWithDates) {
    setHabits((prev) => (prev ? prev.map((h) => (h.id === updated.id ? { ...h, ...updated } : h)) : prev));
  }

  async function handleHarvest(id: number) {
    setHabits((prev) =>
      prev ? prev.map((h) => (h.id === id ? { ...h, harvestedCount: h.harvestedCount + 1 } : h)) : prev
    );
    try {
      const res = await fetch(`/api/habits/${id}/harvest`, { method: "POST" });
      if (!res.ok) {
        setHabits((prev) =>
          prev ? prev.map((h) => (h.id === id ? { ...h, harvestedCount: h.harvestedCount - 1 } : h)) : prev
        );
      }
    } catch {
      setHabits((prev) =>
        prev ? prev.map((h) => (h.id === id ? { ...h, harvestedCount: h.harvestedCount - 1 } : h)) : prev
      );
    }
  }

  function handleMove(id: number, posX: number, posY: number) {
    setHabits((prev) => (prev ? prev.map((h) => (h.id === id ? { ...h, posX, posY } : h)) : prev));
    fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ posX, posY }),
    }).catch(() => {});
  }

  return (
    <main className="flex-1 flex flex-col items-center px-4 py-8 sm:py-12">
      <header className="w-full max-w-5xl flex flex-col items-center text-center gap-2 mb-8 relative">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/login";
          }}
          className="absolute top-0 right-0 text-xs font-bold text-[var(--ink-soft)] hover:text-[var(--berry)] bubble-btn px-3 py-1.5"
          style={{ background: "var(--paper)" }}
        >
          Log out
        </button>
        <h1
          className="pixel-title text-2xl sm:text-3xl"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--berry), var(--coral), var(--sun), var(--leaf-dark), var(--sky), var(--grape))",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          HABITAT
        </h1>
        <p className="text-[var(--ink-soft)] font-semibold max-w-md">
          Every day you show up, something grows. Miss a day and it waits patiently — pick it back up whenever you&apos;re ready.
        </p>
      </header>

      {stats && habits && habits.length > 0 && (
        <div className="w-full max-w-5xl grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatPill emoji="🪴" value={stats.total} label="Plants" />
          <StatPill emoji="💧" value={`${stats.doneToday}/${stats.total}`} label="On track" />
          <StatPill emoji="🔥" value={stats.longestStreak} label="Best active streak" />
          <StatPill emoji="🧺" value={stats.readyToHarvest} label="Ready to harvest" />
        </div>
      )}

      <section className="w-full max-w-5xl">
        {habits === null && (
          <p className="text-center text-[var(--ink-soft)] font-bold text-sm py-16">Loading your farm…</p>
        )}

        {habits && habits.length === 0 && (
          <div className="bubble-card p-8 text-center max-w-md mx-auto flex flex-col items-center gap-3">
            <PixelEmoji emoji="🌱" size={40} />
            <h2 className="text-base">Your farm is empty</h2>
            <p className="text-sm text-[var(--ink-soft)]">
              Plant your first habit and check back in — it grows every time you log it.
            </p>
          </div>
        )}

        {habits && habits.length > 0 && (
          <GardenView
            habits={habits}
            onHarvest={handleHarvest}
            onMove={handleMove}
            onDelete={handleDelete}
            onEdit={setEditingHabit}
            onToggleToday={handleToggleToday}
          />
        )}
      </section>

      <button
        onClick={() => setShowAddModal(true)}
        className="bubble-btn fixed bottom-6 right-6 px-5 py-3 text-sm z-30"
        style={{ background: "var(--sun)" }}
      >
        + Plant a habit
      </button>

      {showAddModal && <HabitModal onClose={() => setShowAddModal(false)} onCreated={handleCreated} />}

      {editingHabit && (
        <HabitModal
          editHabit={editingHabit}
          onClose={() => setEditingHabit(null)}
          onSaved={handleSaved}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}

function StatPill({ emoji, value, label }: { emoji: string; value: string | number; label: string }) {
  return (
    <div className="bubble-card px-3 py-3 flex flex-col items-center gap-0.5">
      <span><PixelEmoji emoji={emoji} size={22} /></span>
      <span className="text-lg font-extrabold">{value}</span>
      <span className="text-[11px] text-[var(--ink-soft)] text-center leading-tight">{label}</span>
    </div>
  );
}
