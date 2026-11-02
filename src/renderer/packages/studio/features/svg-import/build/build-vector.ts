import type { GroupLayer, Layer, VectorLayer } from "@bitgrain/studio-core/model/studio-types";
import type { Subpath } from "../geometry/subpath-types";
import { subpathsBounds } from "../geometry/subpath-bounds";
import type { IrPathNode } from "../walk/svg-ir";
import { subpathToAnchors, type NormalBox } from "./subpath-anchors";
import { orientForEvenOdd } from "./ring-orientation";
import { paintColor, paintGradient } from "./paint-gradient";
import { wrapInGroup } from "./group-box";

const MIN_EXTENT = 1;

const normalBoxFor = (subpaths: Subpath[]): NormalBox => {
  const bounds = subpathsBounds(subpaths);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;
  return {
    x: width < MIN_EXTENT ? (bounds.minX + bounds.maxX - MIN_EXTENT) / 2 : bounds.minX,
    y: height < MIN_EXTENT ? (bounds.minY + bounds.maxY - MIN_EXTENT) / 2 : bounds.minY,
    width: Math.max(width, MIN_EXTENT),
    height: Math.max(height, MIN_EXTENT),
  };
};

const strokeFields = (node: IrPathNode): Pick<VectorLayer, "strokeColor" | "strokeWidth" | "lineCap" | "lineJoin" | "dashStyle" | "dashPattern"> => {
  const stroke = node.stroke;
  if (!stroke) return { strokeColor: "transparent", strokeWidth: 0, lineCap: "butt", lineJoin: "miter", dashStyle: "solid" };
  return {
    strokeColor: paintColor(stroke.paint),
    strokeWidth: stroke.width,
    lineCap: stroke.lineCap,
    lineJoin: stroke.lineJoin,
    dashStyle: stroke.dash ? "dashed" : "solid",
    ...(stroke.dash ? { dashPattern: stroke.dash } : {}),
  };
};

const ringsFor = (node: IrPathNode, subpaths: Subpath[], closed: boolean, box: NormalBox) => {
  const rings = subpaths.map((subpath) => subpathToAnchors(subpath, closed, box));
  return closed && node.fillRule === "evenodd" && rings.length > 1 ? orientForEvenOdd(rings) : rings;
};

const vectorFrom = (node: IrPathNode, subpaths: Subpath[], closed: boolean, name: string): VectorLayer => {
  const box = normalBoxFor(subpaths);
  const [anchors, ...extraRings] = ringsFor(node, subpaths, closed, box);
  const fillGradient = closed ? paintGradient(node.fill, box) : undefined;
  return {
    id: `vector-${crypto.randomUUID()}`,
    type: "vector",
    name,
    x: box.x,
    y: box.y,
    width: box.width,
    height: box.height,
    opacity: node.opacity,
    locked: false,
    visible: true,
    rotation: 0,
    path: { anchors, closed, ...(extraRings.length > 0 ? { extraRings } : {}) },
    fill: closed ? paintColor(node.fill) : "transparent",
    ...(fillGradient ? { fillGradient } : {}),
    ...strokeFields(node),
  };
};

export const buildVectorLayers = (node: IrPathNode): Layer => {
  const filled = node.fill.kind !== "none";
  const allClosed = node.subpaths.every((subpath) => subpath.closed);
  if (filled || allClosed || node.subpaths.length === 1) {
    return vectorFrom(node, node.subpaths, filled || allClosed, node.name);
  }
  const parts = node.subpaths.map((subpath, index) => vectorFrom(node, [subpath], subpath.closed, `${node.name} ${index + 1}`));
  const group: GroupLayer = wrapInGroup(parts.map((part) => ({ ...part, opacity: 1 })), node.name);
  return { ...group, opacity: node.opacity };
};
