import {
  AlignCenterHorizontal, AlignCenterVertical, AlignEndHorizontal, AlignEndVertical,
  AlignHorizontalJustifyCenter, AlignHorizontalJustifyEnd, AlignHorizontalJustifyStart, AlignHorizontalSpaceBetween,
  AlignStartHorizontal, AlignStartVertical,
  AlignVerticalJustifyCenter, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalSpaceBetween,
  StretchHorizontal, StretchVertical,
  type LucideIcon,
} from "lucide-react";
import type { SegmentedOption } from "../../workspace-panel/segmented-choice";

const ICON_SIZE = 14;
const ICON_STROKE = 1.75;

const option = (value: string, label: string, Icon: LucideIcon): SegmentedOption => ({
  value,
  label,
  icon: <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} />,
});

export const LAYOUT_OPTIONS: SegmentedOption[] = [
  { value: "none", label: "Free", icon: null },
  { value: "flex-col", label: "Stack", icon: null },
  { value: "flex-row", label: "Row", icon: null },
  { value: "grid", label: "Grid", icon: null },
];

export const ROW_ALIGN_OPTIONS: SegmentedOption[] = [
  option("start", "Align top", AlignStartHorizontal),
  option("center", "Align middle", AlignCenterHorizontal),
  option("end", "Align bottom", AlignEndHorizontal),
  option("stretch", "Stretch to fill", StretchHorizontal),
];

export const COLUMN_ALIGN_OPTIONS: SegmentedOption[] = [
  option("start", "Align left", AlignStartVertical),
  option("center", "Align center", AlignCenterVertical),
  option("end", "Align right", AlignEndVertical),
  option("stretch", "Stretch to fill", StretchVertical),
];

export const ROW_JUSTIFY_OPTIONS: SegmentedOption[] = [
  option("start", "Pack left", AlignHorizontalJustifyStart),
  option("center", "Pack center", AlignHorizontalJustifyCenter),
  option("end", "Pack right", AlignHorizontalJustifyEnd),
  option("between", "Spread out", AlignHorizontalSpaceBetween),
];

export const COLUMN_JUSTIFY_OPTIONS: SegmentedOption[] = [
  option("start", "Pack top", AlignVerticalJustifyStart),
  option("center", "Pack middle", AlignVerticalJustifyCenter),
  option("end", "Pack bottom", AlignVerticalJustifyEnd),
  option("between", "Spread out", AlignVerticalSpaceBetween),
];
