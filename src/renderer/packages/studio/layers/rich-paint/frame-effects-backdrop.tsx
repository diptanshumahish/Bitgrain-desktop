import React, { useId } from "react";
import type { FrameLayer } from "@bitgrain/studio-core/model/studio-types";
import { frameEffectShape } from "@bitgrain/studio-core/shape-render/rich/frame-effect-shape";
import { buildShapeRich } from "@bitgrain/studio-core/shape-render/rich/shape-rich";
import { svgSafeId } from "@bitgrain/studio-core/shape-render/svg-id";
import { quantizeRenderScale } from "@bitgrain/core/image/render-scale";
import { RichLayerContent } from "./rich-layer-content";

interface FrameEffectsBackdropProps {
  layer: FrameLayer;
  scale: number;
  opacity: number;
}

export const FrameEffectsBackdrop: React.FC<FrameEffectsBackdropProps> = ({ layer, scale, opacity }) => {
  const reactId = useId();
  const shape = frameEffectShape(layer);
  if (!shape) return null;
  const rich = buildShapeRich(shape, `frm-${svgSafeId(reactId)}`);
  return <RichLayerContent rich={rich} renderScale={quantizeRenderScale(scale)} opacity={opacity} />;
};
