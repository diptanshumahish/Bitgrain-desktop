import { trackEvent } from "@bitgrain/platform/tracker";
import type { PaletteEntry } from "../entries/palette-entry";
import { closePalette, paletteQuerySignal } from "../state/palette-store";

export const runPaletteEntry = (entry: PaletteEntry): void => {
  trackEvent("studio", "palette_command_run", {
    details: { entry_id: entry.id, group: entry.group, had_query: paletteQuerySignal.value.trim().length > 0 },
  });
  closePalette();
  entry.run();
};
