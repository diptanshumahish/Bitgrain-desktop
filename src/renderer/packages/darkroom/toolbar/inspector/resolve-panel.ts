import type { ActivePopover, InspectorPanel, PhoneOnlySheet } from "../toolbar-types";

const DEFAULT_PANEL: InspectorPanel = "effects";

const PANEL_ALIASES: Partial<Record<InspectorPanel, InspectorPanel>> = {
  algorithm: "effects", halftone: "effects", popart: "effects", ascii: "effects", braille: "effects",
  contour: "effects", inkwash: "effects", manga: "effects", styles: "effects", filters: "effects",
  "haze-bloom": "effects", adjust: "tone",
};

const PHONE_ONLY_SHEETS: ReadonlySet<ActivePopover> = new Set<PhoneOnlySheet>(["more", "recipe", "recipe-add"]);

const isInspectorPanel = (active: ActivePopover): active is InspectorPanel => active !== null && !PHONE_ONLY_SHEETS.has(active);

export const resolveInspectorPanel = (active: ActivePopover): InspectorPanel => {
  const panel = isInspectorPanel(active) ? active : DEFAULT_PANEL;
  return PANEL_ALIASES[panel] ?? panel;
};
