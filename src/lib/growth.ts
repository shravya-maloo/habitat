// Date/streak/growth helpers. Dates are handled as local YYYY-MM-DD strings
// throughout the app so "today" always matches the user's own calendar day.

export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

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

function parse(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// --- Period keys -----------------------------------------------------
// Every frequency reduces a day-level date string down to a "period key":
// two dates in the same period share the same key. Streaks are then just
// "how many consecutive periods have at least one completion", which lets
// daily/weekly/biweekly/monthly all reuse the same streak-walking logic.

function isoWeekKey(d: Date): string {
  // ISO week: Monday-start, week 1 contains the year's first Thursday.
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const day = (date.getDay() + 6) % 7; // Mon=0..Sun=6
  date.setDate(date.getDate() - day + 3); // nearest Thursday
  const firstThursday = new Date(date.getFullYear(), 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3);
  const week = 1 + Math.round((date.getTime() - firstThursday.getTime()) / (7 * 86400000));
  return `${date.getFullYear()}-W${String(week).padStart(2, "0")}`;
}

const BIWEEKLY_EPOCH = new Date(1970, 0, 5).getTime(); // a Monday, fixed anchor for everyone

function biweeklyIndex(d: Date): number {
  const days = Math.floor((d.getTime() - BIWEEKLY_EPOCH) / 86400000);
  return Math.floor(days / 14);
}

export function periodKey(dateKey: string, frequency: Frequency): string {
  const d = parse(dateKey);
  switch (frequency) {
    case "weekly":
      return isoWeekKey(d);
    case "biweekly":
      return `B${biweeklyIndex(d)}`;
    case "monthly":
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    case "daily":
    default:
      return dateKey;
  }
}

function stepsBetweenAdjacentDates(frequency: Frequency): { unit: "day" | "week" | "biweek" | "month" } {
  switch (frequency) {
    case "weekly":
      return { unit: "week" };
    case "biweekly":
      return { unit: "biweek" };
    case "monthly":
      return { unit: "month" };
    default:
      return { unit: "day" };
  }
}

/** The period key for "now", and the one immediately before it. */
function currentAndPreviousPeriod(frequency: Frequency): [string, string] {
  const today = todayKey();
  const current = periodKey(today, frequency);
  const { unit } = stepsBetweenAdjacentDates(frequency);
  let prevDateKey: string;
  if (unit === "day") prevDateKey = addDays(today, -1);
  else if (unit === "week") prevDateKey = addDays(today, -7);
  else if (unit === "biweek") prevDateKey = addDays(today, -14);
  else prevDateKey = addDays(today, -31); // safely lands in the previous month
  return [current, periodKey(prevDateKey, frequency)];
}

/**
 * Walk a period key backward by one step, for the given frequency.
 * Works entirely in period-key space so it never has to re-derive a date.
 */
function stepPeriodBack(key: string, frequency: Frequency): string {
  if (frequency === "daily") return addDays(key, -1);
  if (frequency === "monthly") {
    const [y, m] = key.split("-").map(Number);
    const d = new Date(y, m - 1, 1);
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }
  if (frequency === "biweekly") {
    const idx = Number(key.slice(1));
    return `B${idx - 1}`;
  }
  // weekly: "YYYY-Www" -> subtract 7 days from a date inside that week
  const [yearStr, wStr] = key.split("-W");
  const year = Number(yearStr);
  const week = Number(wStr);
  // Reconstruct a date inside this ISO week (Thursday of week 1 + offset)
  const firstThursday = new Date(year, 0, 4);
  const firstDay = (firstThursday.getDay() + 6) % 7;
  firstThursday.setDate(firstThursday.getDate() - firstDay + 3 + (week - 1) * 7);
  firstThursday.setDate(firstThursday.getDate() - 7);
  return isoWeekKey(firstThursday);
}

/** Consecutive periods ending at "now" or the period right before it. */
export function currentStreak(dates: string[], frequency: Frequency = "daily"): number {
  if (dates.length === 0) return 0;
  const periods = new Set(dates.map((d) => periodKey(d, frequency)));
  const [current, previous] = currentAndPreviousPeriod(frequency);

  let anchor: string | null = null;
  if (periods.has(current)) anchor = current;
  else if (periods.has(previous)) anchor = previous;
  else return 0;

  let streak = 0;
  let cursor = anchor;
  let guard = 0;
  while (periods.has(cursor) && guard < 10000) {
    streak += 1;
    cursor = stepPeriodBack(cursor, frequency);
    guard += 1;
  }
  return streak;
}

export function bestStreak(dates: string[], frequency: Frequency = "daily"): number {
  if (dates.length === 0) return 0;
  const periods = [...new Set(dates.map((d) => periodKey(d, frequency)))];
  periods.sort();

  let best = 1;
  let run = 1;
  for (let i = 1; i < periods.length; i++) {
    if (stepPeriodBack(periods[i], frequency) === periods[i - 1]) {
      run += 1;
    } else {
      run = 1;
    }
    if (run > best) best = run;
  }
  return best;
}

export function hasDoneCurrentPeriod(dates: string[], frequency: Frequency = "daily"): boolean {
  const [current] = currentAndPreviousPeriod(frequency);
  return dates.some((d) => periodKey(d, frequency) === current);
}

export const FREQUENCY_LABEL: Record<Frequency, string> = {
  daily: "Daily",
  weekly: "Weekly",
  biweekly: "Every 2 weeks",
  monthly: "Monthly",
};

export const FREQUENCY_UNIT: Record<Frequency, { singular: string; plural: string }> = {
  daily: { singular: "day", plural: "days" },
  weekly: { singular: "week", plural: "weeks" },
  biweekly: { singular: "period", plural: "periods" },
  monthly: { singular: "month", plural: "months" },
};

export function streakLabel(streak: number, frequency: Frequency): string {
  const unit = FREQUENCY_UNIT[frequency];
  return `${streak} ${streak === 1 ? unit.singular : unit.plural}`;
}

export type GrowthStage = {
  stage: number; // 0-5
  label: string;
  nextAt: number | null; // periods needed for next stage, null if maxed
};

// Thresholds are tuned per frequency so growth paces similarly in real time
// (e.g. "ancient tree" lands around 6-12 weeks of consistency either way).
const STAGE_THRESHOLDS: Record<Frequency, number[]> = {
  daily: [0, 2, 5, 10, 21, 45],
  weekly: [0, 1, 2, 4, 8, 16],
  biweekly: [0, 1, 2, 3, 5, 8],
  monthly: [0, 1, 2, 3, 6, 12],
};

const STAGE_LABELS = ["Seed", "Sprout", "Seedling", "Budding", "Blooming", "Ancient Tree"];

export function growthStage(streak: number, frequency: Frequency = "daily"): GrowthStage {
  const thresholds = STAGE_THRESHOLDS[frequency];
  let stage = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (streak >= thresholds[i]) {
      stage = i;
      break;
    }
  }
  const next = thresholds[stage + 1] ?? null;
  return { stage, label: STAGE_LABELS[stage], nextAt: next };
}
