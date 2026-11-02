import type { UploadLayer } from "@bitgrain/studio-core/model/studio-types";
import type { IrImageNode } from "../walk/svg-ir";
import { placeRect } from "./placed-box";

export const buildImageLayer = (node: IrImageNode): UploadLayer => ({
  id: `upload-${crypto.randomUUID()}`,
  type: "upload",
  name: node.name,
  src: node.href,
  fit: node.fit,
  borderRadius: 0,
  ...placeRect(node, node.matrix),
  opacity: node.opacity,
  locked: false,
  visible: true,
});
