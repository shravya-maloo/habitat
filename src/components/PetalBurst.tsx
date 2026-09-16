"use client";

import { useEffect, useState } from "react";

const COLORS = ["var(--berry)", "var(--sun)", "var(--sky)", "var(--grape)", "var(--leaf)", "var(--coral)"];

type Petal = {
  id: number;
  left: number;
  drift: number;
  duration: number;
  delay: number;
  size: number;
  color: string;
  rounded: string;
};

export default function PetalBurst({ onDone }: { onDone: () => void }) {
  const [petals] = useState<Petal[]>(() =>
    Array.from({ length: 46 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      drift: (Math.random() - 0.5) * 160,
      duration: 1.8 + Math.random() * 1.6,
      delay: Math.random() * 0.4,
      size: 8 + Math.random() * 10,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rounded: Math.random() > 0.5 ? "9999px" : "2px 12px",
    }))
  );

  useEffect(() => {
    const t = setTimeout(onDone, 3600);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]" aria-hidden="true">
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.size * 0.7,
              background: p.color,
              borderRadius: p.rounded,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
