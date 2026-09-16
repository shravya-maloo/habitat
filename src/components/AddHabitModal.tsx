"use client";

import { useState } from "react";
import type { HabitColor, Frequency } from "@/lib/types";
import { FREQUENCY_LABEL } from "@/lib/growth";
import { FLOWER_TYPES } from "@/lib/flowers";

const COLORS: { key: HabitColor; label: string; swatch: string }[] = [
  { key: "leaf", label: "Leaf", swatch: "var(--leaf)" },
  { key: "sun", label: "Sun", swatch: "var(--sun)" },
  { key: "berry", label: "Berry", swatch: "var(--berry)" },
  { key: "sky", label: "Sky", swatch: "var(--sky)" },
  { key: "grape", label: "Grape", swatch: "var(--grape)" },
];
const FREQUENCIES: Frequency[] = ["daily", "weekly", "biweekly", "monthly"];

export default function AddHabitModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (habit: unknown) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState(FLOWER_TYPES[0].emoji);
  const [color, setColor] = useState<HabitColor>("leaf");
  const [frequency, setFrequency] = useState<Frequency>("daily");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give your habit a name first.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/habits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji, color, frequency }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      onCreated(data);
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-[var(--ink)]/40 z-40 grid place-items-center p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bubble-card pop-in w-full max-w-sm p-6 flex flex-col gap-4"
      >
        <h2 className="text-lg">🌿 New habit</h2>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-bold" htmlFor="habit-name">
            What do you want to grow?
          </label>
          <input
            id="habit-name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Drink water, read 10 pages..."
            maxLength={40}
            className="soft-outline rounded-2xl px-3 py-2 bg-[var(--bg)] outline-none focus:ring-2 focus:ring-[var(--leaf)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold">Flower</span>
          <div className="grid grid-cols-3 gap-2">
            {FLOWER_TYPES.map((f) => (
              <button
                type="button"
                key={f.key}
                onClick={() => setEmoji(f.emoji)}
                className="soft-outline rounded-2xl py-2 flex flex-col items-center gap-0.5"
                style={{
                  background: emoji === f.emoji ? "var(--sun)" : "var(--paper)",
                }}
              >
                <span className="text-xl">{f.emoji}</span>
                <span className="text-[10px] font-semibold">{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold">Petal color</span>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c.key}
                aria-label={c.label}
                onClick={() => setColor(c.key)}
                className="w-8 h-8 rounded-full soft-outline"
                style={{
                  background: c.swatch,
                  outline: color === c.key ? "3px solid var(--ink)" : "none",
                  outlineOffset: "2px",
                }}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold">How often?</span>
          <div className="grid grid-cols-2 gap-2">
            {FREQUENCIES.map((f) => (
              <button
                type="button"
                key={f}
                onClick={() => setFrequency(f)}
                className="soft-outline rounded-2xl px-2 py-1.5 text-sm font-semibold"
                style={{
                  background: frequency === f ? "var(--leaf-bright)" : "var(--paper)",
                }}
              >
                {FREQUENCY_LABEL[f]}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-[var(--berry)] font-semibold">{error}</p>}

        <div className="flex gap-2 mt-1">
          <button
            type="button"
            onClick={onClose}
            className="bubble-btn flex-1 py-2 text-sm"
            style={{ background: "var(--paper)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="bubble-btn flex-1 py-2 text-sm disabled:opacity-60"
            style={{ background: "var(--leaf-bright)" }}
          >
            {submitting ? "Planting…" : "Plant it 🌱"}
          </button>
        </div>
      </form>
    </div>
  );
}
