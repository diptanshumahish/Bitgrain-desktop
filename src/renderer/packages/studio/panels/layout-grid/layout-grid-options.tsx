import { Columns3, Grid3x3, Rows3 } from "lucide-react";
import type { SegmentedOption } from "../../workspace-panel/segmented-choice";

const ICON_SIZE = 13;
const ICON_STROKE = 1.75;

export const LAYOUT_GRID_KIND_OPTIONS: SegmentedOption[] = [
  { value: "columns", label: "Columns", icon: <Columns3 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
  { value: "rows", label: "Rows", icon: <Rows3 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
  { value: "grid", label: "Grid", icon: <Grid3x3 size={ICON_SIZE} strokeWidth={ICON_STROKE} /> },
];
