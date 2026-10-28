import { useMemo, useState } from "react";
import type { AppData, DayItem } from "../types";
import {
  WEEKDAY_SHORT,
  addMonths,
  formatLongDate,
  formatMonth,
  formatShortDate,
  monthDates,
  monthKey,
  parseKey,
  weekday,
} from "../dates";
import { allDone, buildSchedule, progress } from "../scheduler";
import { DayList } from "./DayList";
import { ProgressBar } from "./ProgressBar";

type Props = {
  data: AppData;
  today: string;
  anchor: string;
  onAnchorChange: (date: string) => void;
  onToggle: (item: DayItem) => void;
};

export function Month({ data, today, anchor, onAnchorChange, onToggle }: Props) {
  const dates = monthDates(anchor);
  const first = dates[0];
  const last = dates[dates.length - 1];
  const schedule = useMemo(() => buildSchedule(data, first, last, today), [data, first, last, today]);
  const { done, total } = progress(schedule, dates);
  const { choreDays, weekStartsOn } = data.settings;

  const [picked, setPicked] = useState<string | null>(null);
  const selected =
    picked && monthKey(picked) === monthKey(anchor) ? picked : monthKey(today) === monthKey(anchor) ? today : first;
  const selectedItems = schedule.get(selected) ?? [];

  const lead = (weekday(first) - weekStartsOn + 7) % 7;
  const headers = Array.from({ length: 7 }, (_, i) => WEEKDAY_SHORT[(i + weekStartsOn) % 7]);

  const bigChores = dates.flatMap((d) =>
    (schedule.get(d) ?? []).filter((i) => i.chore.effort === 3).map((i) => ({ ...i, date: d })),
  );

  return (
    <section>
      <header className="top">
        <h1 className="brand">{formatMonth(first)}</h1>
        <div className="pager">
          <button className="btn ghost" aria-label="Previous month" onClick={() => onAnchorChange(addMonths(first, -1))}>
            ‹
          </button>
          <button
            className="btn ghost small"
            disabled={monthKey(today) === monthKey(first)}
            onClick={() => onAnchorChange(today)}
          >
            Today
          </button>
          <button className="btn ghost" aria-label="Next month" onClick={() => onAnchorChange(addMonths(first, 1))}>
            ›
          </button>
        </div>
      </header>

      <div className="card">
        <ProgressBar done={done} total={total} label="Month progress" />
      </div>

      <div className="card month-card">
        <div className="month-grid">
          {headers.map((h) => (
            <div key={h} className="month-wd">
              {h}
            </div>
          ))}
          {Array.from({ length: lead }, (_, i) => (
            <div key={`pad-${i}`} />
          ))}
          {dates.map((date) => {
            const items = schedule.get(date) ?? [];
            const isChoreDay = choreDays.length === 0 || choreDays.includes(weekday(date));
            const hasBig = items.some((i) => i.chore.effort === 3);
            const complete = allDone(items);
            return (
              <button
                key={date}
                className={`month-cell${date === selected ? " selected" : ""}${date === today ? " is-today" : ""}${
                  isChoreDay ? "" : " is-rest"
                }${date < today ? " is-past" : ""}${hasBig ? " has-big" : ""}${complete ? " is-complete" : ""}`}
                onClick={() => setPicked(date)}
              >
                <span className="month-num">{parseKey(date).getDate()}</span>
                <span className="month-dots">
                  {items.slice(0, 6).map((i) => (
                    <span
                      key={i.chore.id}
                      className={`dot effort-${i.chore.effort}${i.done ? " done" : ""}${i.overdue ? " overdue" : ""}`}
                    />
                  ))}
                  {items.length > 6 && <span className="dot-more">+</span>}
                </span>
              </button>
            );
          })}
        </div>
        <div className="legend muted">
          <span>
            <span className="dot effort-1" /> Quick
          </span>
          <span>
            <span className="dot effort-2" /> Medium
          </span>
          <span>
            <span className="dot effort-3" /> Big
          </span>
          <span>
            <span className="dot effort-1 done" /> Done
          </span>
        </div>
      </div>

      <div className={`card day-card${allDone(selectedItems) ? " is-complete" : ""}`}>
        <div className="day-head">
          <h2>{formatLongDate(selected)}</h2>
          {selected === today && <span className="today-badge">Today</span>}
        </div>
        <DayList
          items={selectedItems}
          isChoreDay={choreDays.length === 0 || choreDays.includes(weekday(selected))}
          isPast={selected < today}
          onToggle={onToggle}
        />
      </div>

      {bigChores.length > 0 && (
        <div className="card">
          <h2 className="section-title">Big chores this month</h2>
          <ul className="big-list">
            {bigChores.map((i) => (
              <li key={`${i.chore.id}-${i.date}`} className={i.done ? "done" : ""}>
                <button className="link" onClick={() => setPicked(i.date)}>
                  <span>{i.chore.name}</span>
                  <span className="muted">{formatShortDate(i.date)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
