import type { ShapeLayer } from "../model/studio-types";
import { buildShapeRender } from "../shape-render/shape-nodes";
import { svgNodesToString } from "../shape-render/svg-node/svg-node";
import { svgSafeId } from "../shape-render/svg-id";

interface ShapeSvgOutput {
  svg: string;
  pad: number;
}

export const buildShapeSvg = (layer: ShapeLayer): ShapeSvgOutput => {
  const render = buildShapeRender(layer, `shp-${svgSafeId(layer.id)}`);
  const pad = Math.ceil(render.pad);
  const width = layer.width + pad * 2;
  const height = layer.height + pad * 2;
  const defs = render.defs.length > 0 ? `<defs>${svgNodesToString(render.defs)}</defs>` : "";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${width} ${height}" preserveAspectRatio="none">${defs}${svgNodesToString(render.body)}</svg>`;
  return { svg, pad };
};
