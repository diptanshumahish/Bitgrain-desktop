import { ACTION_ENTRIES } from "./action-entries";
import { docEntries } from "./doc-entries";
import { EFFECT_ENTRIES } from "./effect-entries";
import { LEARN_ENTRIES } from "./learn-entries";
import { PANEL_ENTRIES } from "./panel-entries";
import type { PaletteEntry } from "./palette-entry";
import { TOOL_ENTRIES } from "./tool-entries";

export const paletteEntries = (): PaletteEntry[] => [
  ...ACTION_ENTRIES,
  ...TOOL_ENTRIES,
  ...PANEL_ENTRIES,
  ...EFFECT_ENTRIES,
  ...LEARN_ENTRIES,
  ...docEntries(),
];

export const SUGGESTED_ENTRY_IDS: string[] = [
  "panel-templates",
  "command-add-text",
  "command-add-image",
  "panel-elements",
  "command-resize-formats",
  "command-export-options",
  "learn-tour",
];
