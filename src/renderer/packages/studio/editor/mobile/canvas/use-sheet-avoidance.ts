import { useLayoutEffect } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";

const SHEET_SHIFT_VAR = "--mobile-sheet-shift";
const AVOID_MARGIN_PX = 16;

interface AvoidanceInput {
  layer: Layer | null;
  scale: number;
  sheetTop: number | null;
}

const computeShift = (container: HTMLElement, page: HTMLElement, input: AvoidanceInput): number => {
  const { layer, scale, sheetTop } = input;
  if (!layer || sheetTop === null) return 0;
  const containerTop = container.getBoundingClientRect().top;
  const pageTop = containerTop + page.offsetTop - container.scrollTop;
  const layerTop = pageTop + layer.y * scale;
  const layerBottom = layerTop + layer.height * scale;
  const overlap = layerBottom + AVOID_MARGIN_PX - sheetTop;
  const headroom = layerTop - containerTop - AVOID_MARGIN_PX;
  return Math.max(0, Math.min(overlap, headroom));
};

export const useSheetAvoidance = (
  containerRef: React.RefObject<HTMLDivElement | null>,
  pageRef: React.RefObject<HTMLDivElement | null>,
  input: AvoidanceInput,
): void => {
  const { layer, scale, sheetTop } = input;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const page = pageRef.current;
    if (!container || !page) return;
    const shift = computeShift(container, page, { layer, scale, sheetTop });
    page.style.setProperty(SHEET_SHIFT_VAR, `${-shift}px`);
  }, [containerRef, pageRef, layer, scale, sheetTop]);
};
