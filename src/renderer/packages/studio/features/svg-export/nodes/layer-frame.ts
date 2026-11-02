import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { compactAttrs } from "@bitgrain/studio-core/shape-render/svg-node/svg-node";
import { xmlElement, type XmlElement, type XmlNode } from "../document/xml-node";

const DIGITS = 3;
const FULL_OPACITY = 1;

export interface ExportNodeContext {
  idPrefix: string;
  fallbackImage: string | null;
  rasterScale: number;
}

const num = (value: number): number => Number(value.toFixed(DIGITS));

const rotationOf = (layer: Layer): number => ("rotation" in layer ? layer.rotation ?? 0 : 0);

const layerTransform = (layer: Layer): string => {
  const parts = [`translate(${num(layer.x)} ${num(layer.y)})`];
  const rotation = rotationOf(layer);
  const flipX = layer.flipH ? -1 : 1;
  const flipY = layer.flipV ? -1 : 1;
  if (rotation === 0 && flipX === 1 && flipY === 1) return parts[0];
  const halfW = num(layer.width / 2);
  const halfH = num(layer.height / 2);
  parts.push(`translate(${halfW} ${halfH})`);
  if (rotation !== 0) parts.push(`rotate(${num(rotation)})`);
  if (flipX !== 1 || flipY !== 1) parts.push(`scale(${flipX} ${flipY})`);
  parts.push(`translate(${-halfW} ${-halfH})`);
  return parts.join(" ");
};

const blendStyle = (layer: Layer): string | undefined =>
  layer.blendMode && layer.blendMode !== "normal" ? `mix-blend-mode:${layer.blendMode}` : undefined;

export const frameLayer = (layer: Layer, children: XmlNode[]): XmlElement =>
  xmlElement(
    "g",
    compactAttrs({
      "data-name": layer.name || undefined,
      transform: layerTransform(layer),
      opacity: layer.opacity < FULL_OPACITY ? num(layer.opacity) : undefined,
      style: blendStyle(layer),
    }),
    children,
  );

export const scopedId = (ctx: ExportNodeContext, layer: Layer, suffix: string): string =>
  `${ctx.idPrefix}-${layer.id.replace(/[^a-zA-Z0-9_-]/g, "")}-${suffix}`;
