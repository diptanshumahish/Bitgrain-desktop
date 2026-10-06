import type { GroupLayer, Layer, AlignItems, JustifyContent } from "../data/studioTypes";

export interface ChildFrame {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

const leadAndGap = (
  justify: JustifyContent,
  freeSpace: number,
  count: number,
): { lead: number; extraGap: number } => {
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

const computeFlex = (group: GroupLayer): ChildFrame[] => {
  const horizontal = group.layout === "flex-row";
  const padding = group.padding ?? 0;
  const gap = group.gap ?? 0;
  const align = group.alignItems ?? "start";
  const children = group.layers;
  const innerMain = (horizontal ? group.width : group.height) - padding * 2;
  const innerCross = (horizontal ? group.height : group.width) - padding * 2;

  const totalMain =
    children.reduce((sum, child) => sum + (horizontal ? child.width : child.height), 0) +
    gap * Math.max(0, children.length - 1);
  const freeSpace = Math.max(0, innerMain - totalMain);
  const { lead, extraGap } = leadAndGap(group.justifyContent ?? "start", freeSpace, children.length);

  const frames: ChildFrame[] = [];
  let cursor = padding + lead;
  children.forEach((child) => {
    const mainSize = horizontal ? child.width : child.height;
    const crossSize = horizontal ? child.height : child.width;
    const stretched = align === "stretch";
    const finalCross = stretched ? innerCross : crossSize;
    const crossPos = padding + (stretched ? 0 : crossOffset(align, innerCross, crossSize));
    frames.push({
      id: child.id,
      x: horizontal ? cursor : crossPos,
      y: horizontal ? crossPos : cursor,
      width: horizontal ? child.width : finalCross,
      height: horizontal ? finalCross : child.height,
    });
    cursor += mainSize + gap + extraGap;
  });
  return frames;
};

const groupIntoLines = (
  children: Layer[],
  horizontal: boolean,
  innerMain: number,
  gap: number,
): Layer[][] => {
  const lines: Layer[][] = [];
  let current: Layer[] = [];
  let used = 0;
  children.forEach((child) => {
    const mainSize = horizontal ? child.width : child.height;
    const next = current.length === 0 ? mainSize : used + gap + mainSize;
    if (current.length > 0 && next > innerMain) {
      lines.push(current);
      current = [child];
      used = mainSize;
    } else {
      current.push(child);
      used = next;
    }
  });
  if (current.length > 0) lines.push(current);
  return lines;
};

const layOutLine = (
  line: Layer[],
  horizontal: boolean,
  align: AlignItems,
  justify: JustifyContent,
  innerMain: number,
  gap: number,
  mainStart: number,
  crossStart: number,
  lineCross: number,
): ChildFrame[] => {
  const totalMain =
    line.reduce((sum, child) => sum + (horizontal ? child.width : child.height), 0) +
    gap * Math.max(0, line.length - 1);
  const freeSpace = Math.max(0, innerMain - totalMain);
  const { lead, extraGap } = leadAndGap(justify, freeSpace, line.length);

  const frames: ChildFrame[] = [];
  let cursor = mainStart + lead;
  line.forEach((child) => {
    const mainSize = horizontal ? child.width : child.height;
    const crossSize = horizontal ? child.height : child.width;
    const stretched = align === "stretch";
    const finalCross = stretched ? lineCross : crossSize;
    const crossPos = crossStart + (stretched ? 0 : crossOffset(align, lineCross, crossSize));
    frames.push({
      id: child.id,
      x: horizontal ? cursor : crossPos,
      y: horizontal ? crossPos : cursor,
      width: horizontal ? child.width : finalCross,
      height: horizontal ? finalCross : child.height,
    });
    cursor += mainSize + gap + extraGap;
  });
  return frames;
};

const computeFlexWrap = (group: GroupLayer): ChildFrame[] => {
  const horizontal = group.layout === "flex-row";
  const padding = group.padding ?? 0;
  const gap = group.gap ?? 0;
  const align = group.alignItems ?? "start";
  const justify = group.justifyContent ?? "start";
  const innerMain = (horizontal ? group.width : group.height) - padding * 2;
  const lines = groupIntoLines(group.layers, horizontal, innerMain, gap);

  const frames: ChildFrame[] = [];
  let crossCursor = padding;
  lines.forEach((line) => {
    const lineCross = Math.max(...line.map((child) => (horizontal ? child.height : child.width)));
    frames.push(
      ...layOutLine(line, horizontal, align, justify, innerMain, gap, padding, crossCursor, lineCross),
    );
    crossCursor += lineCross + gap;
  });
  return frames;
};

const computeGrid = (group: GroupLayer): ChildFrame[] => {
  const children = group.layers;
  if (children.length === 0) return [];
  const padding = group.padding ?? 0;
  const gap = group.gap ?? 0;
  const cellWidth = Math.max(...children.map((child) => child.width));
  const cellHeight = Math.max(...children.map((child) => child.height));
  const innerWidth = group.width - padding * 2;
  const columns = Math.max(1, Math.floor((innerWidth + gap) / (cellWidth + gap)));

  return children.map((child, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    return {
      id: child.id,
      x: padding + column * (cellWidth + gap) + (cellWidth - child.width) / 2,
      y: padding + row * (cellHeight + gap) + (cellHeight - child.height) / 2,
      width: child.width,
      height: child.height,
    };
  });
};

export const computeAutoLayout = (group: GroupLayer): ChildFrame[] | null => {
  if (!group.layout || group.layout === "none") return null;
  if (group.layout === "grid") return computeGrid(group);
  if (group.wrap) return computeFlexWrap(group);
  return computeFlex(group);
};

export const applyFrame = (child: Layer, frame: ChildFrame | undefined): Layer => {
  if (!frame) return child;
  return { ...child, x: frame.x, y: frame.y, width: frame.width, height: frame.height };
};

export const laidOutChildren = (group: GroupLayer): Layer[] => {
  const frames = computeAutoLayout(group);
  if (!frames) return group.layers;
  const frameById = new Map<string, ChildFrame>(frames.map((frame) => [frame.id, frame]));
  return group.layers.map((child) => applyFrame(child, frameById.get(child.id)));
};

const centerOf = (frames: ChildFrame[], id: string): { x: number; y: number } => {
  const frame = frames.find((candidate) => candidate.id === id);
  if (!frame) return { x: 0, y: 0 };
  return { x: frame.x + frame.width / 2, y: frame.y + frame.height / 2 };
};

const flexTargetIndex = (
  layers: Layer[],
  frames: ChildFrame[],
  draggedId: string,
  pointer: number,
  horizontal: boolean,
): number => {
  const others = layers.filter((layer) => layer.id !== draggedId);
  let index = 0;
  for (const other of others) {
    const center = centerOf(frames, other.id);
    if ((horizontal ? center.x : center.y) < pointer) index += 1;
  }
  return index;
};

const gridSwapTarget = (
  layers: Layer[],
  frames: ChildFrame[],
  draggedId: string,
  pointerX: number,
  pointerY: number,
): number => {
  const distanceTo = (id: string): number => {
    const center = centerOf(frames, id);
    return (center.x - pointerX) ** 2 + (center.y - pointerY) ** 2;
  };
  const ownDistance = distanceTo(draggedId);
  let best = -1;
  let bestDistance = ownDistance;
  layers.forEach((layer, index) => {
    if (layer.id === draggedId) return;
    const distance = distanceTo(layer.id);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = index;
    }
  });
  return best;
};

const flexFitSize = (group: GroupLayer): { width: number; height: number } | null => {
  const children = group.layers;
  if (children.length === 0) return null;
  const horizontal = group.layout === "flex-row";
  const padding = group.padding ?? 0;
  const gap = group.gap ?? 0;
  const mainTotal =
    children.reduce((sum, child) => sum + (horizontal ? child.width : child.height), 0) +
    gap * (children.length - 1) +
    padding * 2;
  const crossTotal = Math.max(...children.map((child) => (horizontal ? child.height : child.width))) + padding * 2;
  return horizontal ? { width: mainTotal, height: crossTotal } : { width: crossTotal, height: mainTotal };
};

const flexWrapFitSize = (group: GroupLayer): { width: number; height: number } | null => {
  const children = group.layers;
  if (children.length === 0) return null;
  const horizontal = group.layout === "flex-row";
  const padding = group.padding ?? 0;
  const gap = group.gap ?? 0;
  const innerMain = (horizontal ? group.width : group.height) - padding * 2;
  const lines = groupIntoLines(children, horizontal, innerMain, gap);
  const crossTotal =
    lines.reduce(
      (sum, line) => sum + Math.max(...line.map((child) => (horizontal ? child.height : child.width))),
      0,
    ) +
    gap * Math.max(0, lines.length - 1) +
    padding * 2;
  const mainTotal = (horizontal ? group.width : group.height);
  return horizontal ? { width: mainTotal, height: crossTotal } : { width: crossTotal, height: mainTotal };
};

const gridFitSize = (group: GroupLayer): { width: number; height: number } | null => {
  const children = group.layers;
  if (children.length === 0) return null;
  const padding = group.padding ?? 0;
  const gap = group.gap ?? 0;
  const cellWidth = Math.max(...children.map((child) => child.width));
  const cellHeight = Math.max(...children.map((child) => child.height));
  const innerWidth = group.width - padding * 2;
  const columns = Math.max(1, Math.floor((innerWidth + gap) / (cellWidth + gap)));
  const rows = Math.ceil(children.length / columns);
  return {
    width: columns * cellWidth + (columns - 1) * gap + padding * 2,
    height: rows * cellHeight + (rows - 1) * gap + padding * 2,
  };
};

export const fitGroupSize = (group: GroupLayer): { width: number; height: number } | null => {
  if (!group.layout || group.layout === "none") return null;
  if (group.layout === "grid") return gridFitSize(group);
  if (group.wrap) return flexWrapFitSize(group);
  return flexFitSize(group);
};

export const reorderByPointer = (
  group: GroupLayer,
  frames: ChildFrame[],
  draggedId: string,
  pointerX: number,
  pointerY: number,
): Layer[] | null => {
  const layers = group.layers;
  const currentIndex = layers.findIndex((layer) => layer.id === draggedId);
  if (currentIndex < 0) return null;

  if (group.layout === "grid") {
    const swapIndex = gridSwapTarget(layers, frames, draggedId, pointerX, pointerY);
    if (swapIndex < 0) return null;
    const next = [...layers];
    [next[currentIndex], next[swapIndex]] = [next[swapIndex], next[currentIndex]];
    return next;
  }

  const horizontal = group.layout === "flex-row";
  const pointer = horizontal ? pointerX : pointerY;
  const targetIndex = flexTargetIndex(layers, frames, draggedId, pointer, horizontal);
  if (targetIndex === currentIndex) return null;
  const rest = layers.filter((layer) => layer.id !== draggedId);
  rest.splice(Math.min(targetIndex, rest.length), 0, layers[currentIndex]);
  return rest;
};
