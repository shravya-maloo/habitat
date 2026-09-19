"use client";

import { useRef, useState } from "react";
import type { HabitColor, Frequency, HabitWithDates } from "@/lib/types";
import { FREQUENCY_LABEL } from "@/lib/growth";
import { FLOWER_TYPES } from "@/lib/flowers";
import PixelEmoji from "@/components/PixelEmoji";

const COLORS: { key: HabitColor; label: string; swatch: string }[] = [
  { key: "leaf", label: "Leaf", swatch: "var(--leaf)" },
  { key: "sun", label: "Sun", swatch: "var(--sun)" },
  { key: "berry", label: "Berry", swatch: "var(--berry)" },
  { key: "sky", label: "Sky", swatch: "var(--sky)" },
  { key: "grape", label: "Grape", swatch: "var(--grape)" },
];
const FREQUENCIES: Frequency[] = ["daily", "weekly", "biweekly", "monthly"];

export default function HabitModal({
  editHabit,
  onClose,
  onCreated,
  onSaved,
  onDelete,
}: {
  editHabit?: HabitWithDates;
  onClose: () => void;
  onCreated?: (habit: unknown) => void;
  onSaved?: (habit: HabitWithDates) => void;
  onDelete?: (id: number) => void;
}) {
  const isEdit = !!editHabit;

  const [name, setName] = useState(editHabit?.name ?? "");
  const [emoji, setEmoji] = useState(editHabit?.emoji ?? FLOWER_TYPES[0].emoji);
  const [color, setColor] = useState<HabitColor>(editHabit?.color ?? "leaf");
  const [frequency, setFrequency] = useState<Frequency>(editHabit?.frequency ?? "daily");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  // A synchronous guard against double-submit: React's `submitting` state
  // update is batched and can lag a fast double-click/double-tap by a frame,
  // which is enough for both clicks to see `submitting === false` and both
  // fire the request. A ref updates immediately, closing that window.
  const submitLock = useRef(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitLock.current) return;
    if (!name.trim()) {
      setError("Give your habit a name first.");
      return;
    }
    submitLock.current = true;
    setSubmitting(true);
    setError(null);
    try {
      const url = isEdit ? `/api/habits/${editHabit!.id}` : "/api/habits";
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji, color, frequency }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      if (isEdit) onSaved?.({ ...editHabit!, ...data });
      else onCreated?.(data);
      onClose();
    } finally {
      submitLock.current = false;
      setSubmitting(false);
    }
  }

  function handleDelete() {
    if (!editHabit || !onDelete) return;
    onDelete(editHabit.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-[var(--ink)]/40 z-40 grid place-items-center p-4"
      onClick={onClose}
    >
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="bubble-card pop-in w-full max-w-sm p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-lg flex items-center justify-center gap-2">
          <PixelEmoji emoji="🌿" size={20} /> {isEdit ? "Edit habit" : "New habit"}
        </h2>

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
                <PixelEmoji emoji={f.emoji} size={22} label={f.label} />
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
            {submitting ? (
              "Saving…"
            ) : isEdit ? (
              "Save changes"
            ) : (
              <span className="inline-flex items-center gap-1.5">
                Plant it <PixelEmoji emoji="🌱" size={16} />
              </span>
            )}
          </button>
        </div>

        {isEdit && onDelete && (
          <div className="pt-1 border-t border-[var(--bg-deep)] flex justify-center">
            {!confirmingDelete ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--berry)] pt-2"
              >
                <span className="inline-flex items-center gap-1">
                  <PixelEmoji emoji="🗑️" size={14} /> Remove habit
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 pt-2 text-xs">
                <span className="font-semibold">Remove this habit?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="bubble-btn px-3 py-1"
                  style={{ background: "var(--berry)" }}
                >
                  Yes, remove
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmingDelete(false)}
                  className="font-semibold text-[var(--ink-soft)]"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
