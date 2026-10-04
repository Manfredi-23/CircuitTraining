// Calendar helpers shared by the core modules. Local dates, YYYY-MM-DD.

import { localDate, mondayOf } from './climbing';

export { localDate, mondayOf };

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d + n));
}

/** Whole days from `a` to `b`, both local dates. */
export function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

/** Local date of an ISO timestamp. */
export function dayOf(iso: string): string {
  return localDate(new Date(iso));
}
