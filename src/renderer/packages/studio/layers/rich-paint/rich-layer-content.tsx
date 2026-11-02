import React from "react";
import type { RichRender } from "@bitgrain/studio-core/shape-render/rich/rich-types";
import { RichPaintSvg } from "./rich-paint-svg";
import { BackgroundBlurBackdrop } from "./background-blur-backdrop";
import { richOwnsOpacity } from "@bitgrain/studio-core/shape-render/rich/rich-owns-opacity";

interface RichLayerContentProps {
  rich: RichRender;
  renderScale: number;
  opacity: number;
}

export const RichLayerContent: React.FC<RichLayerContentProps> = ({ rich, renderScale, opacity }) => {
  const ownOpacity = richOwnsOpacity(rich) ? opacity : undefined;
  return (
    <>
      <BackgroundBlurBackdrop rich={rich} opacity={opacity} />
      <RichPaintSvg rich={rich} renderScale={renderScale} opacity={ownOpacity} />
    </>
  );
};
