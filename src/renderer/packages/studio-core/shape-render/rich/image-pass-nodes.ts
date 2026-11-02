import type { VectorFillFit } from "../../model/studio-types";
import { svgNode, type SvgNode } from "../svg-node/svg-node";
import { withAttrs } from "../stroke/stroke-align";
import { partialOpacity } from "./passes/fill-passes";
import type { ImagePaintPass, PaintBox } from "./rich-types";

interface ImagePassNodes {
  pattern: SvgNode;
  node: SvgNode;
}

const fitAspectRatio = (fit: VectorFillFit): string => {
  if (fit === "stretch") return "none";
  if (fit === "cover") return "xMidYMid slice";
  return "xMidYMid meet";
};

export const imagePassNodes = (pass: ImagePaintPass, box: PaintBox, href: string): ImagePassNodes => ({
  pattern: svgNode("pattern", { id: pass.patternId, patternUnits: "userSpaceOnUse", x: 0, y: 0, width: box.width, height: box.height }, [
    svgNode("image", { href, x: 0, y: 0, width: box.width, height: box.height, preserveAspectRatio: fitAspectRatio(pass.image.fit) }),
  ]),
  node: withAttrs(pass.geometry, { fill: `url(#${pass.patternId})`, fillOpacity: partialOpacity(pass.opacity), stroke: "none" }),
});
