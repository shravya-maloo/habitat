"use client";

import { useState } from "react";
import type { HabitColor } from "@/lib/types";

const EMOJIS = ["🌱", "💧", "📚", "🏃", "🧘", "🎨", "🎵", "🥗", "😴", "✍️"];
const COLORS: { key: HabitColor; label: string; swatch: string }[] = [
  { key: "leaf", label: "Leaf", swatch: "var(--leaf)" },
  { key: "sun", label: "Sun", swatch: "var(--sun)" },
  { key: "berry", label: "Berry", swatch: "var(--berry)" },
  { key: "sky", label: "Sky", swatch: "var(--sky)" },
  { key: "grape", label: "Grape", swatch: "var(--grape)" },
];

export default function AddHabitModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (habit: unknown) => void;
}) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🌱");
  const [color, setColor] = useState<HabitColor>("leaf");
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
        body: JSON.stringify({ name, emoji, color }),
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
            className="pixel-outline rounded-2xl px-3 py-2 bg-[var(--bg)] outline-none focus:ring-2 focus:ring-[var(--leaf)]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold">Icon</span>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((e) => (
              <button
                type="button"
                key={e}
                onClick={() => setEmoji(e)}
                className="w-9 h-9 rounded-full grid place-items-center text-lg pixel-outline"
                style={{
                  background: emoji === e ? "var(--sun)" : "var(--paper)",
                }}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-bold">Bloom color</span>
          <div className="flex gap-2">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c.key}
                aria-label={c.label}
                onClick={() => setColor(c.key)}
                className="w-8 h-8 rounded-full pixel-outline"
                style={{
                  background: c.swatch,
                  outline: color === c.key ? "3px solid var(--ink)" : "none",
                  outlineOffset: "2px",
                }}
              />
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
