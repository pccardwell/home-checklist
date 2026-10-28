import { useEffect } from "react";
import type { CelebrationLevel } from "../types";

type Props = {
  level: CelebrationLevel;
  onDone: () => void;
};

const DURATION: Record<CelebrationLevel, number> = { day: 2400, week: 3600, month: 7000 };

export function Celebration({ level, onDone }: Props) {
  useEffect(() => {
    const t = setTimeout(onDone, DURATION[level]);
    return () => clearTimeout(t);
  }, [level, onDone]);

  if (level === "day") {
    return (
      <div className="toast" role="status">
        <span className="toast-check">✓</span> Day done — nice work!
      </div>
    );
  }

  if (level === "week") {
    return (
      <div className="banner" role="status">
        <div className="banner-title">Week complete!</div>
        <div className="banner-sub">Every chore this week is checked off.</div>
      </div>
    );
  }

  return (
    <div className="overlay" role="dialog" aria-label="Month complete" onClick={onDone}>
      <div className="overlay-inner">
        <div className="trophy" aria-hidden>
          🏆
        </div>
        <div className="overlay-title">Month complete!</div>
        <div className="overlay-sub">Every single chore, done. Your house thanks you.</div>
        <button className="btn">Celebrate 🎉</button>
      </div>
    </div>
  );
}
