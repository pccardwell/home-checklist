import { useRef, useState } from "react";
import type { AppData } from "../types";
import { WEEKDAY_SHORT } from "../dates";
import { exportData, importData, resetChores, updateSettings } from "../storage";

type Props = {
  data: AppData;
  onChange: (data: AppData) => void;
};

const PRESETS: { label: string; days: number[] }[] = [
  { label: "Every day", days: [0, 1, 2, 3, 4, 5, 6] },
  { label: "Every other day", days: [1, 3, 5, 0] },
  { label: "Weekdays", days: [1, 2, 3, 4, 5] },
  { label: "Weekends", days: [0, 6] },
  { label: "Saturdays only", days: [6] },
];

function sameDays(a: number[], b: number[]) {
  return a.length === b.length && a.every((d) => b.includes(d));
}

export function Settings({ data, onChange }: Props) {
  const { choreDays, maxPerDay, weekStartsOn } = data.settings;
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const order = Array.from({ length: 7 }, (_, i) => (i + weekStartsOn) % 7);

  const toggleDay = (d: number) => {
    const next = choreDays.includes(d) ? choreDays.filter((x) => x !== d) : [...choreDays, d];
    if (next.length === 0) return;
    onChange(updateSettings({ choreDays: next.sort() }));
  };

  const download = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `home-checklist-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <header className="top">
        <h1 className="brand">Settings</h1>
      </header>

      <div className="card">
        <h2 className="section-title">Chore days</h2>
        <p className="muted small-note">Chores only get scheduled on these days. Overdue chores still show up today.</p>
        <div className="day-toggles">
          {order.map((d) => (
            <button key={d} className={choreDays.includes(d) ? "active" : ""} onClick={() => toggleDay(d)}>
              {WEEKDAY_SHORT[d]}
            </button>
          ))}
        </div>
        <div className="chips">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className={`chip${sameDays(p.days, choreDays) ? " active" : ""}`}
              onClick={() => onChange(updateSettings({ choreDays: [...p.days].sort() }))}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="field">
          <label>Max chores per day</label>
          <select
            value={maxPerDay}
            onChange={(e) => onChange(updateSettings({ maxPerDay: Number(e.target.value) }))}
          >
            <option value={0}>No limit</option>
            {[1, 2, 3, 4, 5, 6, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Week starts on</label>
          <div className="segmented">
            {([0, 1] as const).map((d) => (
              <button
                key={d}
                className={weekStartsOn === d ? "active" : ""}
                onClick={() => onChange(updateSettings({ weekStartsOn: d }))}
              >
                {d === 0 ? "Sunday" : "Monday"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="section-title">Backup</h2>
        <p className="muted small-note">Everything is saved in this browser only. Export a backup to move devices.</p>
        <div className="row">
          <button className="btn secondary" onClick={download}>
            Export
          </button>
          <button className="btn secondary" onClick={() => fileRef.current?.click()}>
            Import
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            try {
              onChange(importData(await file.text()));
              setMessage("Backup restored.");
            } catch (err) {
              setMessage(err instanceof Error ? err.message : "Import failed.");
            }
          }}
        />
        {message && <p className="small-note">{message}</p>}
      </div>

      <div className="card">
        <h2 className="section-title">Start over</h2>
        <p className="muted small-note">Restores the starter chore list and clears all check-offs.</p>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm("Reset all chores to the defaults and clear history?")) onChange(resetChores());
          }}
        >
          Reset chores
        </button>
      </div>
    </section>
  );
}
