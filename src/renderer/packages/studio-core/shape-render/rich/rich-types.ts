import type { BlendMode, VectorFillImage } from "../../model/studio-types";
import type { SvgNode } from "../svg-node/svg-node";

export interface SvgPaintPass {
  kind: "svg";
  nodes: SvgNode[];
  blendMode?: BlendMode;
}

export interface ImagePaintPass {
  kind: "image";
  geometry: SvgNode;
  image: VectorFillImage;
  opacity: number;
  blendMode?: BlendMode;
  patternId: string;
}

export type PaintPass = SvgPaintPass | ImagePaintPass;

export interface PaintBox {
  width: number;
  height: number;
}

export interface FillPassesResult {
  defs: SvgNode[];
  passes: PaintPass[];
  silhouette: SvgNode[];
}

export interface RichRender extends PaintBox {
  defs: SvgNode[];
  passes: PaintPass[];
  silhouette: SvgNode[];
  coverage: SvgNode[];
  margin: number;
  layerBlur: number;
  backgroundBlur: number;
  idBase: string;
}
