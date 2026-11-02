import type { Layer } from "../../model/studio-types";
import { isHorizontalFlow, resolvePadding, type ChildFrame, type LayoutContainer, type Size } from "./layout-container";
import { groupIntoLines, layOutLine, type FlexLine } from "./flex-lines";

interface FlexAxes {
  horizontal: boolean;
  innerMain: number;
  innerCross: number;
  mainStart: number;
  crossStart: number;
}

const flexAxes = (container: LayoutContainer): FlexAxes => {
  const horizontal = isHorizontalFlow(container);
  const pad = resolvePadding(container);
  const innerWidth = container.width - pad.left - pad.right;
  const innerHeight = container.height - pad.top - pad.bottom;
  return {
    horizontal,
    innerMain: horizontal ? innerWidth : innerHeight,
    innerCross: horizontal ? innerHeight : innerWidth,
    mainStart: horizontal ? pad.left : pad.top,
    crossStart: horizontal ? pad.top : pad.left,
  };
};

const baseLine = (container: LayoutContainer, axes: FlexAxes): Omit<FlexLine, "children" | "sizes" | "crossStart" | "lineCross"> => ({
  horizontal: axes.horizontal,
  align: container.alignItems ?? "start",
  justify: container.justifyContent ?? "start",
  innerMain: axes.innerMain,
  gap: container.gap ?? 0,
  mainStart: axes.mainStart,
});

export const computeFlex = (container: LayoutContainer, children: Layer[], sizes: Size[]): ChildFrame[] => {
  const axes = flexAxes(container);
  return layOutLine({
    ...baseLine(container, axes),
    children,
    sizes,
    crossStart: axes.crossStart,
    lineCross: axes.innerCross,
  });
};

export const computeFlexWrap = (container: LayoutContainer, children: Layer[], sizes: Size[]): ChildFrame[] => {
  const axes = flexAxes(container);
  const gap = container.gap ?? 0;
  const mainSizes = sizes.map((size) => (axes.horizontal ? size.width : size.height));
  const lines = groupIntoLines(mainSizes, axes.innerMain, gap);

  const frames: ChildFrame[] = [];
  let crossCursor = axes.crossStart;
  lines.forEach((indices) => {
    const lineSizes = indices.map((index) => sizes[index]);
    const lineCross = Math.max(...lineSizes.map((size) => (axes.horizontal ? size.height : size.width)));
    frames.push(
      ...layOutLine({
        ...baseLine(container, axes),
        children: indices.map((index) => children[index]),
        sizes: lineSizes,
        crossStart: crossCursor,
        lineCross,
      }),
    );
    crossCursor += lineCross + gap;
  });
  return frames;
};
