export type HabitColor = "leaf" | "sun" | "berry" | "sky" | "grape";
export type Frequency = "daily" | "weekly" | "biweekly" | "monthly";

export type HabitWithDates = {
  id: number;
  name: string;
  emoji: string;
  color: HabitColor;
  frequency: Frequency;
  createdAt: string;
  archived: boolean;
  sortOrder: number;
  dates: string[];
};
