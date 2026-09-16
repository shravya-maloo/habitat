"use client";

import { useState } from "react";
import PlantSVG from "./PlantSVG";
import {
  currentStreak,
  bestStreak,
  growthStage,
  todayKey,
  hasDoneCurrentPeriod,
  streakLabel,
  FREQUENCY_LABEL,
} from "@/lib/growth";
import type { HabitWithDates } from "@/lib/types";

const VARIANT_ACCENT: Record<string, string> = {
  leaf: "var(--leaf)",
  sun: "var(--sun)",
  berry: "var(--berry)",
  sky: "var(--sky)",
  grape: "var(--grape)",
};

export default function HabitCard({
  habit,
  onToggle,
  onDelete,
}: {
  habit: HabitWithDates;
  onToggle: (id: number, nowCompleted: boolean) => void;
  onDelete: (id: number) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const streak = currentStreak(habit.dates, habit.frequency);
  const best = bestStreak(habit.dates, habit.frequency);
  const { stage, label, nextAt } = growthStage(streak, habit.frequency);
  const doneToday = habit.dates.includes(todayKey());
  const doneThisPeriod = hasDoneCurrentPeriod(habit.dates, habit.frequency);
  const accent = VARIANT_ACCENT[habit.color] ?? VARIANT_ACCENT.leaf;

  async function handleToggle() {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/habits/${habit.id}/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      onToggle(habit.id, data.completed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="bubble-card pop-in relative flex flex-col items-center gap-2 p-4 pt-3 w-full max-w-[220px]">
      <button
        aria-label="Habit options"
        onClick={() => setMenuOpen((v) => !v)}
        className="absolute top-2 right-2 w-7 h-7 rounded-full grid place-items-center hover:bg-[var(--bg-deep)] text-sm"
      >
        ⋮
      </button>

      {menuOpen && (
        <div className="absolute top-9 right-2 z-10 bubble-card !shadow-none border-2 p-1 text-sm overflow-hidden">
          <button
            className="block w-full text-left px-3 py-1.5 rounded-xl hover:bg-[var(--bg-deep)]"
            onClick={() => {
              setMenuOpen(false);
              onDelete(habit.id);
            }}
          >
            🗑️ Remove
          </button>
        </div>
      )}

      <span
        className="text-[10px] pixel-text px-2 py-1 rounded-full self-start"
        style={{ background: accent, color: "var(--ink)" }}
      >
        {habit.emoji} {label}
      </span>

      <span className="text-[11px] text-[var(--ink-soft)] font-semibold self-start -mt-1">
        {FREQUENCY_LABEL[habit.frequency]}
      </span>

      <div className={`w-28 h-32 ${streak > 0 ? "sway" : ""}`}>
        <PlantSVG stage={stage} variant={habit.color} className="w-full h-full" />
      </div>

      <h3 className="font-bold text-center text-[15px] leading-tight break-words w-full">
        {habit.name}
      </h3>

      <div className="flex items-center gap-3 text-xs text-[var(--ink-soft)] font-semibold">
        <span>🔥 {streakLabel(streak, habit.frequency)}</span>
        <span>🏆 {best}</span>
      </div>

      {nextAt !== null && (
        <p className="text-[11px] text-[var(--ink-soft)] -mt-1">
          {streakLabel(nextAt - streak, habit.frequency)} to next stage
        </p>
      )}

      <button
        onClick={handleToggle}
        disabled={busy}
        className="bubble-btn w-full py-2 mt-1 text-sm disabled:opacity-60"
        style={{ background: doneThisPeriod ? "var(--leaf-bright)" : "var(--paper)" }}
      >
        {habit.frequency === "daily"
          ? doneToday
            ? "✅ Watered today"
            : "💧 Mark done"
          : doneThisPeriod
          ? doneToday
            ? "✅ Watered today"
            : "✅ Done this period"
          : "💧 Mark done today"}
      </button>
    </div>
  );
}
