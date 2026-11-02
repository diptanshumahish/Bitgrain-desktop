export type GuideAxis = "x" | "y";

export interface PageGuide {
  id: string;
  axis: GuideAxis;
  position: number;
  preset?: "repeat";
}

export type LayoutGridKind = "columns" | "rows" | "grid";

export interface LayoutGrid {
  id: string;
  kind: LayoutGridKind;
  count: number;
  gutter: number;
  margin: number;
  size: number;
  color: string;
  visible: boolean;
}

const DEFAULT_LAYOUT_GRID_COLOR = "#ff3d7f";

const DEFAULT_COLUMN_COUNT = 12;
const DEFAULT_ROW_COUNT = 6;
const DEFAULT_GUTTER = 20;
const DEFAULT_MARGIN = 40;
const DEFAULT_SQUARE_SIZE = 10;

const makeGridId = (): string => `grid-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const makeGuideId = (): string => `guide-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const makeLayoutGrid = (kind: LayoutGridKind): LayoutGrid => ({
  id: makeGridId(),
  kind,
  count: kind === "rows" ? DEFAULT_ROW_COUNT : DEFAULT_COLUMN_COUNT,
  gutter: DEFAULT_GUTTER,
  margin: DEFAULT_MARGIN,
  size: DEFAULT_SQUARE_SIZE,
  color: DEFAULT_LAYOUT_GRID_COLOR,
  visible: true,
});
