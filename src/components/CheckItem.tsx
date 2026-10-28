import { useState } from "react";
import type { DayItem } from "../types";
import { EFFORT_LABEL, frequencyLabel } from "../format";

type Props = {
  item: DayItem;
  onToggle: (item: DayItem) => void;
};

export function CheckItem({ item, onToggle }: Props) {
  const { chore, done, overdue } = item;
  const [open, setOpen] = useState(false);
  const description = chore.description?.trim();

  return (
    <div className={`check-item${done ? " done" : ""}${overdue ? " overdue" : ""}`}>
      <div className="check-row">
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          className="check-main"
          onClick={() => onToggle(item)}
        >
          <span className="check-box" aria-hidden>
            <svg viewBox="0 0 24 24">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <span className="check-text">
            <span className="check-name">{chore.name}</span>
            <span className="check-meta">
              {chore.room} · {frequencyLabel(chore.frequencyDays)}
            </span>
          </span>
          <span className="check-tags">
            {overdue && !done && <span className="tag tag-overdue">Overdue</span>}
            <span className={`tag tag-effort-${chore.effort}`}>{EFFORT_LABEL[chore.effort]}</span>
          </span>
        </button>
        {description && (
          <button
            type="button"
            className={`info-btn${open ? " open" : ""}`}
            aria-expanded={open}
            aria-label={open ? "Hide how-to" : "Show how-to"}
            onClick={() => setOpen((o) => !o)}
          >
            ?
          </button>
        )}
      </div>
      {open && description && <p className="check-desc">{description}</p>}
    </div>
  );
}
