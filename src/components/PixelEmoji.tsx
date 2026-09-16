"use client";

import { useEffect, useState } from "react";

// Cache rendered data-URLs by emoji+resolution so repeated icons (e.g. the
// same flower emoji shown in a dozen places) don't re-render a canvas each time.
const cache = new Map<string, string>();

function renderPixelEmoji(emoji: string, resolution: number): string {
  const key = `${emoji}__${resolution}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.clearRect(0, 0, resolution, resolution);
  ctx.font = `${Math.round(resolution * 0.86)}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, resolution / 2, resolution / 2 + resolution * 0.04);

  const url = canvas.toDataURL();
  cache.set(key, url);
  return url;
}

export default function PixelEmoji({
  emoji,
  size = 20,
  resolution = 12,
  className,
  label,
}: {
  emoji: string;
  size?: number;
  /** Canvas resolution the emoji is drawn at before being scaled up crisp — lower = chunkier pixels. */
  resolution?: number;
  className?: string;
  label?: string;
}) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    setSrc(renderPixelEmoji(emoji, resolution));
  }, [emoji, resolution]);

  if (!src) {
    // Before the canvas has rendered client-side (or if it fails), fall back
    // to the plain glyph rather than showing nothing.
    return (
      <span className={className} style={{ fontSize: size, lineHeight: 1 }} aria-hidden={!label}>
        {emoji}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={label ?? ""}
      aria-hidden={!label}
      draggable={false}
      className={className}
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
        display: "inline-block",
        verticalAlign: "middle",
      }}
    />
  );
}
