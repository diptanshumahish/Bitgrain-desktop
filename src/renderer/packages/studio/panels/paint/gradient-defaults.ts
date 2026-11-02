import type { GradientKind, PaintGradient, PaintStop } from "@bitgrain/studio-core/model/paint-types";

const FALLBACK_COLOR = "#141414";
const CENTER = 0.5;
const INVISIBLE_COLORS = ["transparent", "none", ""];

export interface PanelBox {
  width: number;
  height: number;
}

const baseColor = (color: string): string => (INVISIBLE_COLORS.includes(color.trim()) ? FALLBACK_COLOR : color);

const centeredGeometry = (box: PanelBox): Pick<PaintGradient, "start" | "end" | "aspect"> => ({
  start: { x: CENTER, y: CENTER },
  end: { x: 1, y: CENTER },
  aspect: box.width > 0 ? box.height / box.width : 1,
});

const linearGeometry = (): Pick<PaintGradient, "start" | "end" | "aspect"> => ({
  start: { x: 0, y: CENTER },
  end: { x: 1, y: CENTER },
  aspect: 1,
});

export const createGradient = (kind: GradientKind, color: string, box: PanelBox): PaintGradient => {
  const stops: PaintStop[] = [
    { color: baseColor(color), opacity: 1, pos: 0 },
    { color: baseColor(color), opacity: 0, pos: 1 },
  ];
  return { kind, stops, ...(kind === "linear" ? linearGeometry() : centeredGeometry(box)) };
};

export const changeGradientKind = (gradient: PaintGradient, kind: GradientKind, box: PanelBox): PaintGradient => {
  const wasLinear = gradient.kind === "linear";
  const isLinear = kind === "linear";
  if (wasLinear === isLinear) return { ...gradient, kind };
  return { ...gradient, kind, ...(isLinear ? linearGeometry() : centeredGeometry(box)) };
};
