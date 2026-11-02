import { svgNodesToString, type SvgNode } from "../svg-node/svg-node";
import type { RichRender } from "./rich-types";

const SVG_NS = "http://www.w3.org/2000/svg";

const richViewBox = (rich: RichRender): string =>
  `${-rich.margin} ${-rich.margin} ${rich.width + rich.margin * 2} ${rich.height + rich.margin * 2}`;

export const richSvgString = (rich: RichRender, nodes: SvgNode[], pixelScale?: number): string => {
  const size = pixelScale
    ? ` width="${(rich.width + rich.margin * 2) * pixelScale}" height="${(rich.height + rich.margin * 2) * pixelScale}"`
    : "";
  const defs = rich.defs.length > 0 ? `<defs>${svgNodesToString(rich.defs)}</defs>` : "";
  return `<svg xmlns="${SVG_NS}" viewBox="${richViewBox(rich)}"${size} preserveAspectRatio="none">${defs}${svgNodesToString(nodes)}</svg>`;
};

export const svgDataUrl = (svg: string): string => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
