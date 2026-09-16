export type FlowerType = "sunflower" | "rose" | "tulip" | "daisy" | "lotus" | "hibiscus";

export const FLOWER_TYPES: { key: FlowerType; emoji: string; label: string }[] = [
  { key: "sunflower", emoji: "🌻", label: "Sunflower" },
  { key: "rose", emoji: "🌹", label: "Rose" },
  { key: "tulip", emoji: "🌷", label: "Tulip" },
  { key: "daisy", emoji: "🌼", label: "Daisy" },
  { key: "lotus", emoji: "🪷", label: "Lotus" },
  { key: "hibiscus", emoji: "🌺", label: "Hibiscus" },
];

const EMOJI_TO_FLOWER: Record<string, FlowerType> = Object.fromEntries(
  FLOWER_TYPES.map((f) => [f.emoji, f.key])
);

/** Maps a stored emoji (old activity icons included) to a bloom shape, defaulting to sunflower. */
export function flowerTypeFromEmoji(emoji: string): FlowerType {
  return EMOJI_TO_FLOWER[emoji] ?? "sunflower";
}
