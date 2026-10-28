export type Effort = 1 | 2 | 3;

export type Chore = {
  id: string;
  name: string;
  room: string;
  frequencyDays: number;
  effort: Effort;
  enabled: boolean;
  /** How-to notes; shown when the chore is expanded. */
  description?: string;
  /** First due date for a chore that has never been completed. */
  startDate: string;
};

export type Completion = {
  id: string;
  choreId: string;
  date: string;
};

export type Settings = {
  /** Weekdays (0 = Sunday … 6 = Saturday) on which chores get scheduled. */
  choreDays: number[];
  /** Soft cap on chores per day; 0 means no cap. */
  maxPerDay: number;
  weekStartsOn: 0 | 1;
};

export type AppData = {
  settings: Settings;
  chores: Chore[];
  completions: Completion[];
  /** Version of the starter chore list this data has been upgraded to. */
  seedVersion: number;
};

export type TabId = "week" | "month" | "chores" | "settings";

export type DayItem = {
  chore: Chore;
  date: string;
  done: boolean;
  overdue: boolean;
  completionId?: string;
};

export type CelebrationLevel = "day" | "week" | "month";
