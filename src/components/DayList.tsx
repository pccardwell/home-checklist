import type { DayItem } from "../types";
import { CheckItem } from "./CheckItem";

type Props = {
  items: DayItem[];
  isChoreDay: boolean;
  isPast: boolean;
  onToggle: (item: DayItem) => void;
};

export function DayList({ items, isChoreDay, isPast, onToggle }: Props) {
  if (items.length === 0) {
    return (
      <p className="day-empty">
        {isPast ? "Nothing checked off." : isChoreDay ? "Nothing scheduled — enjoy!" : "Rest day"}
      </p>
    );
  }
  return (
    <div className="day-list">
      {items.map((item) => (
        <CheckItem key={`${item.chore.id}-${item.date}`} item={item} onToggle={onToggle} />
      ))}
    </div>
  );
}
