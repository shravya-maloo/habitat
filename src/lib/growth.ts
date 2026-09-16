// Pure date/streak helpers. Dates are handled as local YYYY-MM-DD strings
// throughout the app so "today" always matches the user's own calendar day.

export function todayKey(): string {
  const d = new Date();
  return toKey(d);
}

export function toKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toKey(date);
}

/**
 * Current streak: consecutive days ending today or yesterday.
 * If the most recent completion is older than yesterday, the streak is 0
 * (broken), even though history still counts toward "best streak".
 */
export function currentStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const today = todayKey();
  const yesterday = addDays(today, -1);

  let anchor: string | null = null;
  if (set.has(today)) anchor = today;
  else if (set.has(yesterday)) anchor = yesterday;
  else return 0;

  let streak = 0;
  let cursor = anchor;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

export function bestStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const sorted = [...new Set(dates)].sort();
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (addDays(sorted[i - 1], 1) === sorted[i]) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
  }
  return best;
}

export type GrowthStage = {
  stage: number; // 0-5
  label: string;
  nextAt: number | null; // days needed for next stage, null if maxed
};

const STAGE_THRESHOLDS = [0, 2, 5, 10, 21, 45];
const STAGE_LABELS = ["Seed", "Sprout", "Seedling", "Budding", "Blooming", "Ancient Tree"];

export function growthStage(streak: number): GrowthStage {
  let stage = 0;
  for (let i = STAGE_THRESHOLDS.length - 1; i >= 0; i--) {
    if (streak >= STAGE_THRESHOLDS[i]) {
      stage = i;
      break;
    }
  }
  const next = STAGE_THRESHOLDS[stage + 1] ?? null;
  return { stage, label: STAGE_LABELS[stage], nextAt: next };
}
