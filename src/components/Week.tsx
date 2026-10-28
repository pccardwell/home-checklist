import { useMemo } from "react";
import type { AppData, DayItem } from "../types";
import { addDays, formatDayLabel, formatShortDate, weekDates, weekday } from "../dates";
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

export function Week({ data, today, anchor, onAnchorChange, onToggle }: Props) {
  const dates = weekDates(anchor, data.settings.weekStartsOn);
  const schedule = useMemo(
    () => buildSchedule(data, dates[0], dates[6], today),
    [data, dates[0], today],
  );
  const { done, total } = progress(schedule, dates);
  const isThisWeek = dates.includes(today);
  const { choreDays } = data.settings;

  return (
    <section>
      <header className="top">
        <h1 className="brand">{isThisWeek ? "This week" : "Week"}</h1>
        <div className="pager">
          <button className="btn ghost" aria-label="Previous week" onClick={() => onAnchorChange(addDays(anchor, -7))}>
            ‹
          </button>
          <span className="date-chip">
            {formatShortDate(dates[0])} – {formatShortDate(dates[6])}
          </span>
          <button className="btn ghost" aria-label="Next week" onClick={() => onAnchorChange(addDays(anchor, 7))}>
            ›
          </button>
        </div>
      </header>

      {!isThisWeek && (
        <button className="btn secondary jump" onClick={() => onAnchorChange(today)}>
          Back to this week
        </button>
      )}

      <div className="card">
        <ProgressBar done={done} total={total} label="Week progress" />
      </div>

      {dates.map((date) => {
        const items = schedule.get(date) ?? [];
        const isChoreDay = choreDays.length === 0 || choreDays.includes(weekday(date));
        const isPast = date < today;
        const complete = allDone(items);
        return (
          <div
            key={date}
            className={`card day-card${date === today ? " is-today" : ""}${
              (!isChoreDay || isPast) && items.length === 0 ? " is-rest" : ""
            }${isPast ? " is-past" : ""}${complete ? " is-complete" : ""}`}
          >
            <div className="day-head">
              <h2>
                {formatDayLabel(date)} <span className="muted">{formatShortDate(date)}</span>
              </h2>
              {date === today && <span className="today-badge">Today</span>}
              {complete && <span className="done-badge">All done</span>}
            </div>
            <DayList items={items} isChoreDay={isChoreDay} isPast={isPast} onToggle={onToggle} />
          </div>
        );
      })}
    </section>
  );
}
