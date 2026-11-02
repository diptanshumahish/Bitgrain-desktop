import type { AlignItems, JustifyContent, Layer } from "../../model/studio-types";
import { sizingOf, type ChildFrame, type Size } from "./layout-container";

export interface FlexLine {
  children: Layer[];
  sizes: Size[];
  horizontal: boolean;
  align: AlignItems;
  justify: JustifyContent;
  innerMain: number;
  gap: number;
  mainStart: number;
  crossStart: number;
  lineCross: number;
}

export const groupIntoLines = (mainSizes: number[], innerMain: number, gap: number): number[][] => {
  const lines: number[][] = [];
  let current: number[] = [];
  let used = 0;
  mainSizes.forEach((mainSize, index) => {
    const next = current.length === 0 ? mainSize : used + gap + mainSize;
    if (current.length > 0 && next > innerMain) {
      lines.push(current);
      current = [index];
      used = mainSize;
      return;
    }
    current.push(index);
    used = next;
  });
  if (current.length > 0) lines.push(current);
  return lines;
};

const leadAndGap = (justify: JustifyContent, freeSpace: number, count: number): { lead: number; extraGap: number } => {
  if (justify === "center") return { lead: freeSpace / 2, extraGap: 0 };
  if (justify === "end") return { lead: freeSpace, extraGap: 0 };
  if (justify === "between") return { lead: 0, extraGap: count > 1 ? freeSpace / (count - 1) : 0 };
  return { lead: 0, extraGap: 0 };
};

const crossOffset = (align: AlignItems, available: number, size: number): number => {
  if (align === "center") return (available - size) / 2;
  if (align === "end") return available - size;
  return 0;
};

const resolveMainSizes = (line: FlexLine): number[] => {
  const { children, sizes, horizontal, innerMain, gap } = line;
  const isFill = children.map((child) => sizingOf(child, horizontal) === "fill");
  const fillCount = isFill.filter(Boolean).length;
  const baseMain = sizes.map((size) => (horizontal ? size.width : size.height));
  if (fillCount === 0) return baseMain;
  const fixedTotal =
    baseMain.reduce((sum, size, index) => (isFill[index] ? sum : sum + size), 0) +
    gap * Math.max(0, children.length - 1);
  const fillSize = Math.max(0, innerMain - fixedTotal) / fillCount;
  return baseMain.map((size, index) => (isFill[index] ? fillSize : size));
};

export const layOutLine = (line: FlexLine): ChildFrame[] => {
  const { children, sizes, horizontal, align, justify, innerMain, gap, mainStart, crossStart, lineCross } = line;
  const mainSizes = resolveMainSizes(line);
  const totalMain = mainSizes.reduce((sum, size) => sum + size, 0) + gap * Math.max(0, children.length - 1);
  const { lead, extraGap } = leadAndGap(justify, Math.max(0, innerMain - totalMain), children.length);

  let cursor = mainStart + lead;
  return children.map((child, index) => {
    const mainSize = mainSizes[index];
    const baseCross = horizontal ? sizes[index].height : sizes[index].width;
    const stretched = align === "stretch" || sizingOf(child, !horizontal) === "fill";
    const crossSize = stretched ? lineCross : baseCross;
    const crossPos = crossStart + (stretched ? 0 : crossOffset(align, lineCross, crossSize));
    const frame: ChildFrame = {
      id: child.id,
      x: horizontal ? cursor : crossPos,
      y: horizontal ? crossPos : cursor,
      width: horizontal ? mainSize : crossSize,
      height: horizontal ? crossSize : mainSize,
    };
    cursor += mainSize + gap + extraGap;
    return frame;
  });
};
