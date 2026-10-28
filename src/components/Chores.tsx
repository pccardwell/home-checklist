import { useState } from "react";
import type { AppData, Chore, Effort } from "../types";
import { addDays, formatShortDate } from "../dates";
import { EFFORT_LABEL, UNIT_DAYS, frequencyLabel, splitFrequency, type FrequencyUnit } from "../format";
import { addChore, complete, lastDone, removeChore, updateChore } from "../storage";

type Props = {
  data: AppData;
  today: string;
  onChange: (data: AppData) => void;
};

const UNITS: FrequencyUnit[] = ["days", "weeks", "months", "years"];

function FrequencyInput({ days, onChange }: { days: number; onChange: (days: number) => void }) {
  const initial = splitFrequency(days);
  const [amount, setAmount] = useState(String(initial.amount));
  const [unit, setUnit] = useState<FrequencyUnit>(initial.unit);

  const commit = (nextAmount: string, nextUnit: FrequencyUnit) => {
    const n = Math.max(1, Math.round(Number(nextAmount) || 0));
    if (Number(nextAmount) >= 1) onChange(n * UNIT_DAYS[nextUnit]);
  };

  return (
    <div className="row">
      <input
        type="number"
        inputMode="numeric"
        min={1}
        value={amount}
        aria-label="Repeat every"
        onChange={(e) => {
          setAmount(e.target.value);
          commit(e.target.value, unit);
        }}
      />
      <select
        value={unit}
        aria-label="Unit"
        onChange={(e) => {
          const u = e.target.value as FrequencyUnit;
          setUnit(u);
          commit(amount, u);
        }}
      >
        {UNITS.map((u) => (
          <option key={u} value={u}>
            {u}
          </option>
        ))}
      </select>
    </div>
  );
}

function EffortPicker({ value, onChange }: { value: Effort; onChange: (e: Effort) => void }) {
  return (
    <div className="segmented">
      {([1, 2, 3] as Effort[]).map((e) => (
        <button key={e} type="button" className={value === e ? "active" : ""} onClick={() => onChange(e)}>
          {EFFORT_LABEL[e]}
        </button>
      ))}
    </div>
  );
}

function ChoreEditor({
  chore,
  data,
  today,
  onChange,
  rooms,
}: {
  chore: Chore;
  data: AppData;
  today: string;
  onChange: (data: AppData) => void;
  rooms: string[];
}) {
  const [doneOn, setDoneOn] = useState(today);
  const patch = (p: Partial<Chore>) => onChange(updateChore(chore.id, p));

  return (
    <div className="chore-editor">
      <div className="field">
        <label>Name</label>
        <input value={chore.name} onChange={(e) => patch({ name: e.target.value })} />
      </div>
      <div className="field">
        <label>Room</label>
        <input list="rooms" value={chore.room} onChange={(e) => patch({ room: e.target.value })} />
        <datalist id="rooms">
          {rooms.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>
      <div className="field">
        <label>Repeat every</label>
        <FrequencyInput days={chore.frequencyDays} onChange={(frequencyDays) => patch({ frequencyDays })} />
      </div>
      <div className="field">
        <label>Effort</label>
        <EffortPicker value={chore.effort} onChange={(effort) => patch({ effort })} />
      </div>
      <div className="field">
        <label>How to do it</label>
        <textarea
          value={chore.description ?? ""}
          placeholder="Tips, products, steps…"
          onChange={(e) => patch({ description: e.target.value })}
        />
      </div>
      <div className="field">
        <label>Already did it? Mark done on</label>
        <div className="row">
          <input type="date" value={doneOn} max={today} onChange={(e) => setDoneOn(e.target.value)} />
          <button
            className="btn secondary"
            disabled={!doneOn}
            onClick={() => onChange(complete(chore.id, doneOn))}
          >
            Mark done
          </button>
        </div>
      </div>
      <div className="row">
        <button className="btn secondary" onClick={() => patch({ enabled: !chore.enabled })}>
          {chore.enabled ? "Pause chore" : "Resume chore"}
        </button>
        <button
          className="btn danger"
          onClick={() => {
            if (confirm(`Delete "${chore.name}"?`)) onChange(removeChore(chore.id));
          }}
        >
          Delete
        </button>
      </div>
      {lastDone(data, chore.id) && (
        <p className="muted small-note">Last done {formatShortDate(lastDone(data, chore.id)!)}</p>
      )}
    </div>
  );
}

function NewChore({ today, rooms, onChange }: { today: string; rooms: string[]; onChange: (d: AppData) => void }) {
  const [name, setName] = useState("");
  const [room, setRoom] = useState("");
  const [frequencyDays, setFrequencyDays] = useState(30);
  const [effort, setEffort] = useState<Effort>(1);
  const [description, setDescription] = useState("");

  return (
    <form
      className="card chore-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onChange(
          addChore({
            name: name.trim(),
            room: room.trim() || "Whole house",
            frequencyDays,
            effort,
            enabled: true,
            description: description.trim() || undefined,
            startDate: today,
          }),
        );
        setName("");
        setDescription("");
      }}
    >
      <h2 className="section-title">Add a chore</h2>
      <div className="field">
        <label>Name</label>
        <input value={name} placeholder="e.g. Clean the grill" onChange={(e) => setName(e.target.value)} />
      </div>
      <div className="field">
        <label>Room</label>
        <input list="rooms-new" value={room} placeholder="Whole house" onChange={(e) => setRoom(e.target.value)} />
        <datalist id="rooms-new">
          {rooms.map((r) => (
            <option key={r} value={r} />
          ))}
        </datalist>
      </div>
      <div className="field">
        <label>Repeat every</label>
        <FrequencyInput days={frequencyDays} onChange={setFrequencyDays} />
      </div>
      <div className="field">
        <label>Effort</label>
        <EffortPicker value={effort} onChange={setEffort} />
      </div>
      <div className="field">
        <label>How to do it (optional)</label>
        <textarea
          value={description}
          placeholder="Tips, products, steps…"
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <button className="btn" type="submit" disabled={!name.trim()}>
        Add chore
      </button>
    </form>
  );
}

export function Chores({ data, today, onChange }: Props) {
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const rooms = [...new Set(data.chores.map((c) => c.room))].sort();
  const byRoom = rooms.map((room) => ({
    room,
    chores: data.chores
      .filter((c) => c.room === room)
      .sort((a, b) => a.frequencyDays - b.frequencyDays || a.name.localeCompare(b.name)),
  }));

  return (
    <section>
      <header className="top">
        <h1 className="brand">Chores</h1>
        <button className="btn small" onClick={() => setAdding((a) => !a)}>
          {adding ? "Close" : "+ Add"}
        </button>
      </header>

      {adding && (
        <NewChore
          today={today}
          rooms={rooms}
          onChange={(d) => {
            onChange(d);
            setAdding(false);
          }}
        />
      )}

      {byRoom.map(({ room, chores }) => (
        <div key={room} className="card">
          <h2 className="section-title">{room}</h2>
          <ul className="chore-list">
            {chores.map((chore) => {
              const last = lastDone(data, chore.id);
              const due = last ? addDays(last, chore.frequencyDays) : chore.startDate;
              return (
                <li key={chore.id} className={chore.enabled ? "" : "paused"}>
                  <button className="chore-row" onClick={() => setOpen(open === chore.id ? null : chore.id)}>
                    <span className="chore-row-main">
                      <span className="check-name">{chore.name}</span>
                      <span className="check-meta">
                        {frequencyLabel(chore.frequencyDays)} · {EFFORT_LABEL[chore.effort]}
                        {chore.enabled ? (
                          <> · {due < today ? "overdue" : `due ${formatShortDate(due)}`}</>
                        ) : (
                          " · paused"
                        )}
                      </span>
                    </span>
                    <span className="chevron" aria-hidden>
                      {open === chore.id ? "▾" : "▸"}
                    </span>
                  </button>
                  {open === chore.id && (
                    <ChoreEditor chore={chore} data={data} today={today} onChange={onChange} rooms={rooms} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
