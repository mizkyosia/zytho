// Pure helpers shared between the server and the client

/** An opened barrel must be finished within this many days */
export const BARREL_LIFETIME_DAYS = 21;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Today, as an ISO date string (YYYY-MM-DD) */
export function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Adds `days` days to an ISO date string */
export function addDays(date: string, days: number): string {
  const d = new Date(date + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Number of days from `from` to `to` (negative if `to` is in the past) */
export function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(to + "T00:00:00Z") - Date.parse(from + "T00:00:00Z")) / DAY_MS,
  );
}

/** Expiry date of a barrel opened at `opened` */
export function barrelExpiry(opened: string | null): string | null {
  return opened ? addDays(opened, BARREL_LIFETIME_DAYS) : null;
}

/** Beers actually sold during a zytho: taken out minus brought back */
export function sold(line: { countBefore: number; countAfter: number }) {
  return line.countBefore - line.countAfter;
}

export const barrelStatusLabels = {
  closed: "Fermé",
  opened: "Ouvert",
  emptied: "Vidé",
} as const;

export type BarrelStatus = keyof typeof barrelStatusLabels;
