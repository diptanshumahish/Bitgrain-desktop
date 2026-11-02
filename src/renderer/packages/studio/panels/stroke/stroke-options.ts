import type { DashStyle, LineCap, LineJoin } from "@bitgrain/studio-core/model/studio-types";
import type { StrokeAlign } from "@bitgrain/studio-core/model/paint-types";

export type DashChoice = DashStyle | "custom";

export const DASH_CHOICES: { value: DashChoice; title: string }[] = [
  { value: "solid", title: "Solid" },
  { value: "dashed", title: "Dashed" },
  { value: "dotted", title: "Dotted" },
  { value: "custom", title: "Custom dash" },
];

export const CAP_CHOICES: { value: LineCap; title: string }[] = [
  { value: "butt", title: "Flat end" },
  { value: "round", title: "Round end" },
  { value: "square", title: "Square end" },
];

export const JOIN_CHOICES: { value: LineJoin; title: string }[] = [
  { value: "miter", title: "Sharp corner" },
  { value: "round", title: "Round corner" },
  { value: "bevel", title: "Cut corner" },
];

export const ALIGN_CHOICES: { value: StrokeAlign; label: string; title: string }[] = [
  { value: "inside", label: "Inside", title: "Stroke inside the edge" },
  { value: "center", label: "Center", title: "Stroke centered on the edge" },
  { value: "outside", label: "Outside", title: "Stroke outside the edge" },
];

export const DEFAULT_DASH_RATIO = 3;
export const DEFAULT_GAP_RATIO = 2;
