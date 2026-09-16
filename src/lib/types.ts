export type HabitColor = "leaf" | "sun" | "berry" | "sky" | "grape";

export type HabitWithDates = {
  id: number;
  name: string;
  emoji: string;
  color: HabitColor;
  createdAt: string;
  archived: boolean;
  sortOrder: number;
  dates: string[];
};
