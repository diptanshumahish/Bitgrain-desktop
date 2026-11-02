import type { ChangeLogEntry } from "./types";
import { MARCH_2026_ENTRIES } from "./2026-first-half/march-2026";
import { APRIL_2026_EARLY_ENTRIES } from "./2026-first-half/april-2026-early";
import { APRIL_2026_MID_ENTRIES } from "./2026-first-half/april-2026-mid";
import { APRIL_2026_LATE_ENTRIES } from "./2026-first-half/april-2026-late";
import { MAY_2026_EARLY_ENTRIES } from "./2026-first-half/may-2026-early";
import { MAY_2026_MID_ENTRIES } from "./2026-first-half/may-2026-mid";
import { MAY_2026_LATE_ENTRIES } from "./2026-first-half/may-2026-late";
import { JUNE_2026_ENTRIES } from "./2026-first-half/june-2026";
import { JULY_2026_ENTRIES } from "./2026-second-half/july-2026";
import { AUGUST_SEPTEMBER_2026_ENTRIES } from "./2026-second-half/august-september-2026";
import { OCTOBER_2026_EARLY_ENTRIES } from "./2026-second-half/october-2026-early";
import { OCTOBER_2026_MID_ENTRIES } from "./2026-second-half/october-2026-mid";

export type { ChangeLogType, ChangeLogEntry } from "./types";

export const CHANGE_LOG: ChangeLogEntry[] = [
  ...OCTOBER_2026_MID_ENTRIES,
  ...OCTOBER_2026_EARLY_ENTRIES,
  ...AUGUST_SEPTEMBER_2026_ENTRIES,
  ...JULY_2026_ENTRIES,
  ...JUNE_2026_ENTRIES,
  ...MAY_2026_LATE_ENTRIES,
  ...MAY_2026_MID_ENTRIES,
  ...MAY_2026_EARLY_ENTRIES,
  ...APRIL_2026_LATE_ENTRIES,
  ...APRIL_2026_MID_ENTRIES,
  ...APRIL_2026_EARLY_ENTRIES,
  ...MARCH_2026_ENTRIES,
];

export const LATEST_VERSION: string = CHANGE_LOG[0]?.version ?? '0.0.0';
