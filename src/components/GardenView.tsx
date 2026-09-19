"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import PlantSVG from "./PlantSVG";
import PetalBurst from "./PetalBurst";
import PixelEmoji from "./PixelEmoji";
import { currentStreak, harvestProgress, streakLabel, hasDoneCurrentPeriod } from "@/lib/growth";
import { flowerTypeFromEmoji } from "@/lib/flowers";
import type { HabitWithDates } from "@/lib/types";

const HOLD_MS = 220;
const MOVE_ARM_PX = 8;
const TAP_MAX_MS = 350;

export default function GardenView({
  habits,
  onHarvest,
  onMove,
  onDelete,
  onEdit,
  onToggleToday,
}: {
  habits: HabitWithDates[];
  onHarvest: (id: number) => void;
  onMove: (id: number, posX: number, posY: number) => void;
  onDelete: (id: number) => void;
  onEdit: (habit: HabitWithDates) => void;
  onToggleToday: (id: number) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  // Touch devices fire a synthetic mouseenter on tap with no matching
  // mouseleave, which would otherwise leave this tooltip stuck open forever.
  // Only devices with real hover support (a mouse/trackpad) get the tooltip;
  // the caption at the bottom of the farm already explains the interaction
  // model for everyone else.
  const [supportsHover, setSupportsHover] = useState(false);
  useEffect(() => {
    setSupportsHover(window.matchMedia("(hover: hover)").matches);
  }, []);
  const [dragId, setDragId] = useState<number | null>(null);
  const [overTrash, setOverTrash] = useState(false);
  const [livePos, setLivePos] = useState<Record<number, { x: number; y: number }>>({});
  const [celebrating, setCelebrating] = useState(false);
  const dragInfo = useRef<{ startX: number; startY: number; startTime: number; armed: boolean; moved: boolean } | null>(null);
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clampPct = (v: number) => Math.max(4, Math.min(96, v));
  const posFor = useCallback((h: HabitWithDates) => livePos[h.id] ?? { x: h.posX, y: h.posY }, [livePos]);

  function isOverTrash(clientX: number, clientY: number) {
    if (!trashRef.current) return false;
    const r = trashRef.current.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }

  function handlePointerDown(e: React.PointerEvent, habit: HabitWithDates) {
    (e.target as Element).setPointerCapture(e.pointerId);
    dragInfo.current = { startX: e.clientX, startY: e.clientY, startTime: Date.now(), armed: false, moved: false };
    setDragId(habit.id);
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => {
      if (dragInfo.current) dragInfo.current.armed = true;
    }, HOLD_MS);
  }

  function handlePointerMove(e: React.PointerEvent, habit: HabitWithDates) {
    if (dragId !== habit.id || !containerRef.current || !dragInfo.current) return;
    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;
    if (Math.hypot(dx, dy) > MOVE_ARM_PX) dragInfo.current.armed = true;
    if (!dragInfo.current.armed) return;

    dragInfo.current.moved = true;
    setOverTrash(isOverTrash(e.clientX, e.clientY));
    const rect = containerRef.current.getBoundingClientRect();
    const x = clampPct(((e.clientX - rect.left) / rect.width) * 100);
    const y = clampPct(((e.clientY - rect.top) / rect.height) * 100);
    setLivePos((prev) => ({ ...prev, [habit.id]: { x, y } }));
  }

  function handlePointerUp(e: React.PointerEvent, habit: HabitWithDates) {
    if (dragId !== habit.id) return;
    if (holdTimer.current) clearTimeout(holdTimer.current);
    const info = dragInfo.current;
    const elapsed = info ? Date.now() - info.startTime : 0;
    const wasDrag = info?.moved;
    const droppedOnTrash = wasDrag && isOverTrash(e.clientX, e.clientY);

    setDragId(null);
    setOverTrash(false);
    dragInfo.current = null;

    if (droppedOnTrash) {
      onDelete(habit.id);
      setLivePos((prev) => {
        const next = { ...prev };
        delete next[habit.id];
        return next;
      });
      return;
    }

    if (wasDrag) {
      const finalPos = livePos[habit.id];
      if (finalPos) onMove(habit.id, finalPos.x, finalPos.y);
      return;
    }

    if (elapsed < TAP_MAX_MS) {
      onEdit(habit);
    }
  }

  return (
    <div className="bubble-card overflow-hidden">
      {celebrating && <PetalBurst onDone={() => setCelebrating(false)} />}

      <div
        ref={containerRef}
        className="relative w-full overflow-hidden touch-none select-none"
        style={{
          height: 440,
          background:
            "linear-gradient(180deg, #bdeaff 0%, #bdeaff 26%, #eaf9c8 26%, #b9e888 55%, #86d661 100%)",
        }}
      >
        <div
          className="absolute top-5 right-8 w-16 h-16 rounded-full bob"
          style={{ background: "var(--sun)", boxShadow: "0 0 0 6px rgba(255,203,61,0.25)" }}
        />
        <div className="absolute top-8 left-10 w-14 h-6 rounded-full bg-white/80" />
        <div className="absolute top-6 left-16 w-10 h-6 rounded-full bg-white/80" />
        <div className="absolute top-14 left-1/3 w-16 h-6 rounded-full bg-white/70" />

        <svg viewBox="0 0 400 24" preserveAspectRatio="none" className="absolute left-0 w-full" style={{ top: "24%", height: "30px" }}>
          <path d="M0 18 Q 50 2 100 18 T 200 18 T 300 18 T 400 18 V24 H0 Z" fill="#eaf9c8" />
        </svg>

        {habits.map((h) => {
          const pos = posFor(h);
          const progress = harvestProgress(h.dates.length, h.harvestedCount);
          const streak = currentStreak(h.dates, h.frequency);
          const doneThisPeriod = hasDoneCurrentPeriod(h.dates, h.frequency);
          const isDragging = dragId === h.id;

          return (
            <div
              key={h.id}
              onMouseEnter={() => setHovered(h.id)}
              onMouseLeave={() => setHovered((v) => (v === h.id ? null : v))}
              className="absolute w-16 sm:w-20 -translate-x-1/2 -translate-y-full"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                zIndex: isDragging ? 30 : hovered === h.id ? 15 : 5,
                transition: isDragging ? "none" : "left 0.2s ease, top 0.2s ease",
              }}
            >
              <div
                onPointerDown={(e) => handlePointerDown(e, h)}
                onPointerMove={(e) => handlePointerMove(e, h)}
                onPointerUp={(e) => handlePointerUp(e, h)}
                className="relative cursor-pointer"
                style={{ transform: isDragging ? "scale(1.12)" : "scale(1)", transition: "transform 0.12s ease" }}
              >
                <div className={progress.stage > 0 && !isDragging ? "sway" : ""}>
                  <PlantSVG
                    stage={progress.stage}
                    variant={h.color}
                    flower={flowerTypeFromEmoji(h.emoji)}
                    className="w-full h-auto pointer-events-none"
                  />
                </div>
              </div>

              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (progress.ready) {
                    onHarvest(h.id);
                    setCelebrating(true);
                  } else {
                    onToggleToday(h.id);
                  }
                }}
                aria-label={progress.ready ? "Harvest" : "Mark done today"}
                className="absolute -top-3 left-1/2 -translate-x-1/2 w-7 h-7 rounded-full grid place-items-center bubble-btn"
                style={{
                  background: progress.ready ? "var(--sun)" : doneThisPeriod ? "var(--leaf-bright)" : "var(--paper)",
                }}
              >
                <PixelEmoji emoji={progress.ready ? "🧺" : doneThisPeriod ? "✅" : "💧"} size={16} />
              </button>

              {hovered === h.id && !isDragging && supportsHover && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 -translate-y-full z-20 bubble-card px-3 py-1.5 whitespace-nowrap text-left pop-in">
                  <p className="text-xs font-bold flex items-center gap-1">
                    <PixelEmoji emoji={h.emoji} size={14} /> {h.name}
                  </p>
                  <p className="text-[11px] text-[var(--ink-soft)] flex items-center gap-1">
                    <PixelEmoji emoji="🔥" size={12} /> {streakLabel(streak, h.frequency)}
                  </p>
                  <p className="text-[11px] font-bold" style={{ color: "var(--ink-soft)" }}>
                    Tap to edit · hold + drag to move
                  </p>
                </div>
              )}
            </div>
          );
        })}

        <div
          ref={trashRef}
          className="absolute bottom-3 left-3 w-14 h-14 rounded-full grid place-items-center"
          style={{
            background: overTrash ? "var(--berry)" : "var(--paper)",
            border: "3px solid rgba(43,33,64,0.15)",
            transform: dragId !== null ? (overTrash ? "scale(1.18)" : "scale(1.05)") : "scale(1)",
            opacity: dragId !== null ? 1 : 0.8,
            transition: "transform 0.15s ease, background 0.15s ease, opacity 0.15s ease",
            boxShadow: overTrash ? "0 0 0 6px rgba(255,93,162,0.25)" : "none",
          }}
        >
          <PixelEmoji emoji="🗑️" size={28} />
        </div>
      </div>
      <p className="text-center text-xs text-[var(--ink-soft)] py-2 font-semibold flex flex-wrap items-center justify-center gap-1">
        <span>Tap a flower to edit it · hold + drag to move it, or drop it on</span>
        <PixelEmoji emoji="🗑️" size={14} />
        <span>to remove · tap</span>
        <PixelEmoji emoji="💧" size={14} />
        <span>/</span>
        <PixelEmoji emoji="🧺" size={14} />
        <span>to log progress</span>
      </p>
    </div>
  );
}
