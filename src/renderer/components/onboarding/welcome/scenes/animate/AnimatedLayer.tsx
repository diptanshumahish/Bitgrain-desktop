import React, { useLayoutEffect, useRef } from "react";
import type { TemplateDef } from "../../../../../data/studioTypes";
import { matchReducedMotion } from "../../../../../lib/device-capability";
import { TemplateThumbnail } from "../../../../templates/TemplateThumbnail";
import { ANIMATION_LOOP_MS, loopKeyframes, type LayerMotion } from "./layer-motions";

interface AnimatedLayerProps {
  template: TemplateDef;
  motion: LayerMotion;
}

export const AnimatedLayer: React.FC<AnimatedLayerProps> = ({ template, motion }) => {
  const layerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const layer = layerRef.current;
    if (!layer || matchReducedMotion()) return;
    const loop = layer.animate(loopKeyframes(motion), { duration: ANIMATION_LOOP_MS, iterations: Infinity });
    return () => loop.cancel();
  }, [motion]);

  return (
    <div ref={layerRef} className={`absolute inset-0 ${motion.originClass}`}>
      <TemplateThumbnail template={template} />
    </div>
  );
};
