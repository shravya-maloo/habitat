"use client";

import { useState } from "react";
import PlantSVG from "./PlantSVG";
import { currentStreak, growthStage, streakLabel } from "@/lib/growth";
import type { HabitWithDates } from "@/lib/types";

export default function GardenView({ habits }: { habits: HabitWithDates[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="bubble-card overflow-hidden">
      <div
        className="relative px-6 pt-10 pb-4 overflow-x-auto"
        style={{
          background:
            "linear-gradient(180deg, #cdeeff 0%, #cdeeff 45%, var(--bg-deep) 45%, var(--bg-deep) 100%)",
        }}
      >
        {/* sun */}
        <div
          className="absolute top-4 right-6 w-12 h-12 rounded-full"
          style={{ background: "var(--sun)", border: "3px solid var(--ink)" }}
        />
        {/* rolling hill line */}
        <svg
          viewBox="0 0 400 20"
          preserveAspectRatio="none"
          className="absolute left-0 w-full"
          style={{ top: "43%", height: "24px" }}
        >
          <path d="M0 15 Q 50 0 100 15 T 200 15 T 300 15 T 400 15 V20 H0 Z" fill="var(--bg-deep)" />
        </svg>

        <div className="relative flex items-end gap-1 min-h-[160px] pt-6">
          {habits.map((h) => {
            const streak = currentStreak(h.dates, h.frequency);
            const { stage } = growthStage(streak, h.frequency);
            return (
              <button
                key={h.id}
                onMouseEnter={() => setHovered(h.id)}
                onMouseLeave={() => setHovered((v) => (v === h.id ? null : v))}
                onFocus={() => setHovered(h.id)}
                onBlur={() => setHovered((v) => (v === h.id ? null : v))}
                className="relative shrink-0 w-16 sm:w-20 focus:outline-none"
                aria-label={`${h.name}, ${streakLabel(streak, h.frequency)} streak`}
              >
                <div className={streak > 0 ? "sway" : ""}>
                  <PlantSVG stage={stage} variant={h.color} className="w-full h-auto" />
                </div>

                {hovered === h.id && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-20 bubble-card px-2.5 py-1.5 whitespace-nowrap text-left pop-in">
                    <p className="text-xs font-bold">
                      {h.emoji} {h.name}
                    </p>
                    <p className="text-[11px] text-[var(--ink-soft)]">
                      🔥 {streakLabel(streak, h.frequency)}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
      <p className="text-center text-xs text-[var(--ink-soft)] py-2">
        Hover or tap a plant to see its streak 🌿
      </p>
    </div>
  );
}
