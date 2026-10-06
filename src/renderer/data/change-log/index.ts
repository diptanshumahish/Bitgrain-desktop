import type { ChangeLogEntry } from "./types";
import { MARCH_2026_ENTRIES } from "./march-2026";
import { APRIL_2026_ENTRIES } from "./april-2026";
import { MAY_2026_EARLY_ENTRIES } from "./may-2026-early";
import { MAY_2026_MID_ENTRIES } from "./may-2026-mid";
import { MAY_2026_LATE_ENTRIES } from "./may-2026-late";
import { JUNE_2026_ENTRIES } from "./june-2026";
import { JULY_2026_ENTRIES } from "./july-2026";

export type { ChangeLogType, ChangeLogEntry } from "./types";

export const CHANGE_LOG: ChangeLogEntry[] = [
  ...JULY_2026_ENTRIES,
  ...JUNE_2026_ENTRIES,
  ...MAY_2026_LATE_ENTRIES,
  ...MAY_2026_MID_ENTRIES,
  ...MAY_2026_EARLY_ENTRIES,
  ...APRIL_2026_ENTRIES,
  ...MARCH_2026_ENTRIES,
];

export const LATEST_VERSION: string = CHANGE_LOG[0]?.version ?? '0.0.0';
