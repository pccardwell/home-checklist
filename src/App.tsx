import { useCallback, useEffect, useState } from "react";
import { Week } from "./components/Week";
import { Month } from "./components/Month";
import { Chores } from "./components/Chores";
import { Settings } from "./components/Settings";
import { Celebration } from "./components/Celebration";
import { complete, getData, uncomplete } from "./storage";
import { todayKey } from "./dates";
import { celebrationFor } from "./scheduler";
import { celebrate } from "./celebrate";
import type { CelebrationLevel, DayItem, TabId } from "./types";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: "week", label: "Week", icon: "☰" },
  { id: "month", label: "Month", icon: "▦" },
  { id: "chores", label: "Chores", icon: "✎" },
  { id: "settings", label: "Settings", icon: "⚙" },
];

export function App() {
  const [data, setData] = useState(getData);
  const [tab, setTab] = useState<TabId>("week");
  const [today, setToday] = useState(todayKey);
  const [weekAnchor, setWeekAnchor] = useState(todayKey);
  const [monthAnchor, setMonthAnchor] = useState(todayKey);
  const [celebration, setCelebration] = useState<{ level: CelebrationLevel; key: number } | null>(null);

  useEffect(() => {
    let lastToday = todayKey();
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const now = todayKey();
      if (now !== lastToday) {
        const prev = lastToday;
        setToday(now);
        setWeekAnchor((a) => (a === prev ? now : a));
        setMonthAnchor((a) => (a === prev ? now : a));
        lastToday = now;
      }
      setData(getData());
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const onToggle = useCallback(
    (item: DayItem) => {
      if (item.done && item.completionId) {
        setData(uncomplete(item.completionId));
        return;
      }
      const next = complete(item.chore.id, item.date);
      setData(next);
      const level = celebrationFor(next, item.date, today);
      if (level) {
        celebrate(level);
        setCelebration({ level, key: Date.now() });
      }
    },
    [today],
  );

  const clearCelebration = useCallback(() => setCelebration(null), []);

  return (
    <div className="app">
      {tab === "week" && (
        <Week data={data} today={today} anchor={weekAnchor} onAnchorChange={setWeekAnchor} onToggle={onToggle} />
      )}
      {tab === "month" && (
        <Month data={data} today={today} anchor={monthAnchor} onAnchorChange={setMonthAnchor} onToggle={onToggle} />
      )}
      {tab === "chores" && <Chores data={data} today={today} onChange={setData} />}
      {tab === "settings" && <Settings data={data} onChange={setData} />}

      {celebration && <Celebration key={celebration.key} level={celebration.level} onDone={clearCelebration} />}

      <nav className="nav">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? "active" : ""} onClick={() => setTab(t.id)}>
            <span className="nav-icon" aria-hidden>
              {t.icon}
            </span>
            {t.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
