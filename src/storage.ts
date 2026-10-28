import type { AppData, Chore, Completion, Settings } from "./types";
import { ADDED_IN_VERSION, DEFAULT_SETTINGS, SEED_VERSION, defaultChores } from "./defaults";
import { todayKey } from "./dates";

const KEY = "home-checklist:v1";

function fresh(): AppData {
  return {
    settings: { ...DEFAULT_SETTINGS },
    chores: defaultChores(todayKey()),
    completions: [],
    seedVersion: SEED_VERSION,
  };
}

/** Brings older saved data up to the current starter list without undoing the user's edits. */
function upgradeSeeds(data: AppData) {
  if (data.seedVersion >= SEED_VERSION) return;
  const seeds = defaultChores(todayKey());
  const seedByName = new Map(seeds.map((s) => [s.name, s]));
  for (const chore of data.chores) {
    const seed = seedByName.get(chore.name);
    if (seed && chore.description === undefined) chore.description = seed.description;
  }
  const names = new Set(data.chores.map((c) => c.name));
  for (const seed of seeds) {
    const addedIn = ADDED_IN_VERSION[seed.name];
    if (addedIn && addedIn > data.seedVersion && !names.has(seed.name)) data.chores.push(seed);
  }
  data.seedVersion = SEED_VERSION;
}

function normalize(parsed: Partial<AppData>): AppData {
  const data: AppData = {
    settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    chores: parsed.chores ?? defaultChores(todayKey()),
    completions: parsed.completions ?? [],
    seedVersion: parsed.seedVersion ?? (parsed.chores ? 1 : SEED_VERSION),
  };
  upgradeSeeds(data);
  return data;
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const data = fresh();
      save(data);
      return data;
    }
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const data = normalize(parsed);
    if (parsed.seedVersion !== data.seedVersion) save(data);
    return data;
  } catch {
    return fresh();
  }
}

function save(data: AppData) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function mutate(fn: (data: AppData) => void): AppData {
  const data = load();
  fn(data);
  save(data);
  return data;
}

export function getData(): AppData {
  return load();
}

export function updateSettings(patch: Partial<Settings>): AppData {
  return mutate((data) => {
    data.settings = { ...data.settings, ...patch };
  });
}

export function addChore(chore: Omit<Chore, "id">): AppData {
  return mutate((data) => {
    data.chores.push({ ...chore, id: crypto.randomUUID() });
  });
}

export function updateChore(id: string, patch: Partial<Omit<Chore, "id">>): AppData {
  return mutate((data) => {
    data.chores = data.chores.map((c) => (c.id === id ? { ...c, ...patch } : c));
  });
}

export function removeChore(id: string): AppData {
  return mutate((data) => {
    data.chores = data.chores.filter((c) => c.id !== id);
    data.completions = data.completions.filter((c) => c.choreId !== id);
  });
}

export function resetChores(): AppData {
  return mutate((data) => {
    data.chores = defaultChores(todayKey());
    data.completions = [];
    data.seedVersion = SEED_VERSION;
  });
}

export function complete(choreId: string, date: string): AppData {
  return mutate((data) => {
    if (data.completions.some((c) => c.choreId === choreId && c.date === date)) return;
    data.completions.push({ id: crypto.randomUUID(), choreId, date });
  });
}

export function uncomplete(completionId: string): AppData {
  return mutate((data) => {
    data.completions = data.completions.filter((c) => c.id !== completionId);
  });
}

export function lastDone(data: AppData, choreId: string): string | undefined {
  let last: string | undefined;
  for (const c of data.completions) {
    if (c.choreId === choreId && (!last || c.date > last)) last = c.date;
  }
  return last;
}

export function completionsByDate(completions: Completion[]): Map<string, Completion[]> {
  const map = new Map<string, Completion[]>();
  for (const c of completions) {
    const list = map.get(c.date);
    if (list) list.push(c);
    else map.set(c.date, [c]);
  }
  return map;
}

export function exportData(): string {
  return JSON.stringify(load(), null, 2);
}

export function importData(json: string): AppData {
  const parsed = JSON.parse(json) as Partial<AppData>;
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.chores)) {
    throw new Error("That file doesn't look like a Home Checklist backup.");
  }
  const data = normalize(parsed);
  save(data);
  return data;
}
