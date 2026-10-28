import type { Effort } from "./types";

export type FrequencyUnit = "days" | "weeks" | "months" | "years";

export const UNIT_DAYS: Record<FrequencyUnit, number> = {
  days: 1,
  weeks: 7,
  months: 30,
  years: 365,
};

export function splitFrequency(days: number): { amount: number; unit: FrequencyUnit } {
  if (days % 365 === 0) return { amount: days / 365, unit: "years" };
  if (days % 30 === 0) return { amount: days / 30, unit: "months" };
  if (days % 7 === 0) return { amount: days / 7, unit: "weeks" };
  return { amount: days, unit: "days" };
}

export function frequencyLabel(days: number): string {
  const { amount, unit } = splitFrequency(days);
  if (amount === 1) {
    return { days: "Daily", weeks: "Weekly", months: "Monthly", years: "Yearly" }[unit];
  }
  return `Every ${amount} ${unit}`;
}

export const EFFORT_LABEL: Record<Effort, string> = {
  1: "Quick",
  2: "Medium",
  3: "Big",
};
