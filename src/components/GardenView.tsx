"use client";

import { useRef, useState, useCallback } from "react";
import PlantSVG from "./PlantSVG";
import PetalBurst from "./PetalBurst";
import { currentStreak, harvestProgress, streakLabel } from "@/lib/growth";
import type { HabitWithDates } from "@/lib/types";

const CLICK_THRESHOLD_PX = 6;

export default function GardenView({
  habits,
  onHarvest,
  onMove,
}: {
  habits: HabitWithDates[];
  onHarvest: (id: number) => void;
  onMove: (id: number, posX: number, posY: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);
  const [livePos, setLivePos] = useState<Record<number, { x: number; y: number }>>({});
  const [celebrating, setCelebrating] = useState(false);
  const dragStart = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const clampPct = (v: number) => Math.max(4, Math.min(96, v));

  const posFor = useCallback(
    (h: HabitWithDates) => livePos[h.id] ?? { x: h.posX, y: h.posY },
    [livePos]
  );

  function handlePointerDown(e: React.PointerEvent, habitId: number) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStart.current = { x: e.clientX, y: e.clientY, moved: false };
    setDragId(habitId);
  }

  function handlePointerMove(e: React.PointerEvent, habit: HabitWithDates) {
    if (dragId !== habit.id || !containerRef.current || !dragStart.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (Math.abs(dx) > CLICK_THRESHOLD_PX || Math.abs(dy) > CLICK_THRESHOLD_PX) {
      dragStart.current.moved = true;
    }
    const rect = containerRef.current.getBoundingClientRect();
    const x = clampPct(((e.clientX - rect.left) / rect.width) * 100);
    const y = clampPct(((e.clientY - rect.top) / rect.height) * 100);
    setLivePos((prev) => ({ ...prev, [habit.id]: { x, y } }));
  }

  function handlePointerUp(e: React.PointerEvent, habit: HabitWithDates) {
    if (dragId !== habit.id) return;
    const moved = dragStart.current?.moved;
    setDragId(null);
    dragStart.current = null;

    if (moved) {
      const finalPos = livePos[habit.id];
      if (finalPos) onMove(habit.id, finalPos.x, finalPos.y);
      return;
    }

    // A tap, not a drag: try to harvest.
    const progress = harvestProgress(habit.dates.length, habit.harvestedCount);
    if (progress.ready) {
      onHarvest(habit.id);
      setCelebrating(true);
    }
  }

  return (
    <div className="bubble-card overflow-hidden">
      {celebrating && <PetalBurst onDone={() => setCelebrating(false)} />}

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden touch-none select-none"
        style={{
          height: 420,
          background:
            "linear-gradient(180deg, #bdeaff 0%, #bdeaff 30%, #eaf9c8 30%, #cdf0a0 55%, #a9e37f 100%)",
        }}
      >
        {/* sun */}
        <div
          className="absolute top-5 right-8 w-16 h-16 rounded-full bob"
          style={{ background: "var(--sun)", boxShadow: "0 0 0 6px rgba(255,203,61,0.25)" }}
        />
        {/* clouds */}
        <div className="absolute top-8 left-10 w-14 h-6 rounded-full bg-white/80" />
        <div className="absolute top-6 left-16 w-10 h-6 rounded-full bg-white/80" />
        <div className="absolute top-14 left-1/3 w-16 h-6 rounded-full bg-white/70" />

        {/* rolling hill divider */}
        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute left-0 w-full" style={{ top: "27%", height: "30px" }}>
          <path d="M0 18 Q 50 2 100 18 T 200 18 T 300 18 T 400 18 V24 H0 Z" fill="#eaf9c8" />
        </svg>

        {habits.map((h) => {
          const pos = posFor(h);
          const progress = harvestProgress(h.dates.length, h.harvestedCount);
          const streak = currentStreak(h.dates, h.frequency);
          const isDragging = dragId === h.id;

          return (
            <div
              key={h.id}
              onPointerDown={(e) => handlePointerDown(e, h.id)}
              onPointerMove={(e) => handlePointerMove(e, h)}
              onPointerUp={(e) => handlePointerUp(e, h)}
              onMouseEnter={() => setHovered(h.id)}
              onMouseLeave={() => setHovered((v) => (v === h.id ? null : v))}
              className="absolute w-16 sm:w-20 -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: isDragging ? 20 : hovered === h.id ? 15 : 5,
                transition: isDragging ? "none" : "left 0.2s ease, top 0.2s ease",
              }}
            >
              <div className={`relative ${progress.stage > 0 ? "sway" : ""} ${progress.ready ? "bob" : ""}`}>
                <PlantSVG stage={progress.stage} variant={h.color} className="w-full h-auto pointer-events-none" />
                {progress.ready && (
                  <span className="absolute -top-2 -right-1 text-lg pointer-events-none">✨</span>
                )}
              </div>

              {hovered === h.id && !isDragging && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full z-20 bubble-card px-3 py-1.5 whitespace-nowrap text-left pop-in">
                  <p className="text-xs font-bold">
                    {h.emoji} {h.name}
                  </p>
                  <p className="text-[11px] text-[var(--ink-soft)]">
                    🔥 {streakLabel(streak, h.frequency)}
                  </p>
                  <p className="text-[11px] font-bold" style={{ color: progress.ready ? "var(--berry)" : "var(--ink-soft)" }}>
                    {progress.ready ? "🧺 Tap to harvest!" : `${progress.remaining} more to grow`}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-[var(--ink-soft)] py-2 font-semibold">
        Drag a plant to rearrange your farm 🌾 — tap a fully grown one to harvest it!
      </p>
    </div>
  );
}
