import { pgTable, serial, text, timestamp, boolean, integer, doublePrecision } from "drizzle-orm/pg-core";

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  emoji: text("emoji").notNull().default("🌱"),
  color: text("color").notNull().default("leaf"),
  frequency: text("frequency").notNull().default("daily"), // daily | weekly | biweekly | monthly
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  archived: boolean("archived").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  harvestedCount: integer("harvested_count").notNull().default(0),
  posX: doublePrecision("pos_x").notNull().default(50),
  posY: doublePrecision("pos_y").notNull().default(50),
});

export const completions = pgTable("completions", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD, local day the habit was completed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type Completion = typeof completions.$inferSelect;
