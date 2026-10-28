import type { AppData, CelebrationLevel, Chore, DayItem } from "./types";
import { addDays, monthDates, weekDates, weekday } from "./dates";
import { completionsByDate, lastDone } from "./storage";

export type Schedule = Map<string, DayItem[]>;

/** How many days early a chore may be pulled to even out the load. */
export function slackDays(frequencyDays: number): number {
  return Math.min(7, Math.floor(frequencyDays * 0.25));
}

type Load = { effort: number; count: number };

function sortItems(items: DayItem[]) {
  items.sort(
    (a, b) =>
      Number(b.overdue) - Number(a.overdue) ||
      b.chore.effort - a.chore.effort ||
      a.chore.name.localeCompare(b.chore.name),
  );
}

/**
 * Works out which chores land on each date in [start, end].
 *
 * Past dates only show what was actually completed. From today on, each
 * chore's next due date comes from its last completion (or its start date),
 * and it is placed on the least-loaded allowed chore day within a small
 * window before it's due. Anything already past due is carried onto today.
 */
export function buildSchedule(data: AppData, start: string, end: string, today: string): Schedule {
  const schedule: Schedule = new Map();
  for (let d = start; d <= end; d = addDays(d, 1)) schedule.set(d, []);

  const choreById = new Map(data.chores.map((c) => [c.id, c]));
  const loads = new Map<string, Load>();
  const loadOf = (date: string) => loads.get(date) ?? { effort: 0, count: 0 };
  const addLoad = (date: string, chore: Chore) => {
    const l = loadOf(date);
    loads.set(date, { effort: l.effort + chore.effort, count: l.count + 1 });
  };

  for (const [date, list] of completionsByDate(data.completions)) {
    for (const c of list) {
      const chore = choreById.get(c.choreId);
      if (!chore) continue;
      if (date >= today) addLoad(date, chore);
      schedule.get(date)?.push({ chore, date, done: true, overdue: false, completionId: c.id });
    }
  }

  if (end >= today) {
    const { choreDays, maxPerDay } = data.settings;
    const isChoreDay = (date: string) => choreDays.length === 0 || choreDays.includes(weekday(date));
    const hasRoom = (date: string) => !maxPerDay || loadOf(date).count < maxPerDay;

    const queue: { chore: Chore; due: string }[] = [];
    for (const chore of data.chores) {
      if (!chore.enabled || chore.frequencyDays < 1) continue;
      const last = lastDone(data, chore.id);
      const due = last ? addDays(last, chore.frequencyDays) : chore.startDate;
      if (due < today) {
        addLoad(today, chore);
        schedule.get(today)?.push({ chore, date: today, done: false, overdue: true });
        queue.push({ chore, due: addDays(today, chore.frequencyDays) });
      } else {
        queue.push({ chore, due });
      }
    }

    const nextChoreDay = (from: string, needRoom: boolean): string | undefined => {
      for (let i = 0; i < 14; i++) {
        const d = addDays(from, i);
        if (isChoreDay(d) && (!needRoom || hasRoom(d))) return d;
      }
      return undefined;
    };

    while (queue.length) {
      // Earliest due first; bigger chores claim their spot before small ones.
      let pick = 0;
      for (let i = 1; i < queue.length; i++) {
        const a = queue[i];
        const b = queue[pick];
        if (a.due < b.due || (a.due === b.due && a.chore.effort > b.chore.effort)) pick = i;
      }
      const { chore, due } = queue[pick];
      const slack = slackDays(chore.frequencyDays);
      const windowStart = addDays(due, -slack) < today ? today : addDays(due, -slack);
      if (windowStart > end) {
        queue.splice(pick, 1);
        continue;
      }

      const candidates: string[] = [];
      for (let d = windowStart; d <= due; d = addDays(d, 1)) if (isChoreDay(d)) candidates.push(d);
      const roomy = candidates.filter(hasRoom);

      let placed: string | undefined;
      const pool = roomy.length ? roomy : candidates;
      if (roomy.length || !maxPerDay) {
        for (const d of pool) {
          // Ties go to the later date so chores aren't pulled earlier than needed.
          if (!placed || loadOf(d).effort <= loadOf(placed).effort) placed = d;
        }
      }
      placed ??= nextChoreDay(addDays(due, 1), true) ?? nextChoreDay(addDays(due, 1), false) ?? due;

      addLoad(placed, chore);
      if (placed >= start && placed <= end) {
        schedule.get(placed)?.push({ chore, date: placed, done: false, overdue: false });
      }
      queue[pick] = { chore, due: addDays(placed, chore.frequencyDays) };
    }
  }

  for (const items of schedule.values()) sortItems(items);
  return schedule;
}

export function allDone(items: DayItem[]): boolean {
  return items.length > 0 && items.every((i) => i.done);
}

export function progress(schedule: Schedule, dates: string[]): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const d of dates) {
    for (const item of schedule.get(d) ?? []) {
      total++;
      if (item.done) done++;
    }
  }
  return { done, total };
}

function periodDone(schedule: Schedule, dates: string[]): boolean {
  const { done, total } = progress(schedule, dates);
  return total > 0 && done === total;
}

/** After checking off a chore on `date`, which milestone (if any) did that finish? */
export function celebrationFor(
  data: AppData,
  date: string,
  today: string,
): CelebrationLevel | undefined {
  const week = weekDates(date, data.settings.weekStartsOn);
  const month = monthDates(date);
  const start = week[0] < month[0] ? week[0] : month[0];
  const end = week[6] > month[month.length - 1] ? week[6] : month[month.length - 1];
  const schedule = buildSchedule(data, start, end, today);

  if (!allDone(schedule.get(date) ?? [])) return undefined;
  if (periodDone(schedule, month)) return "month";
  if (periodDone(schedule, week)) return "week";
  return "day";
}
