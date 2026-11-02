import type { TextLayer, VectorPath } from "../../model/studio-types";
import { scaleVectorPath } from "../../geometry/scale-vector-path";
import { anchorsToPath } from "../../geometry/vector-utils";
import { transformCase } from "../../render/text/text-layout";

const PATH_VIEWBOX_SIZE = 100;

export const textPathPixels = (path: VectorPath, width: number, height: number): VectorPath =>
  scaleVectorPath({ anchors: path.anchors, closed: path.closed }, width / PATH_VIEWBOX_SIZE, height / PATH_VIEWBOX_SIZE);

export const textPathD = (path: VectorPath, width: number, height: number): string => {
  const pixels = textPathPixels(path, width, height);
  return anchorsToPath(pixels.anchors, pixels.closed);
};

export const textPathString = (layer: Pick<TextLayer, "content" | "textTransform">): string =>
  transformCase(layer.content.replaceAll("\\n", "\n").replace(/\n+/g, " "), layer.textTransform);
