import React from "react";
import type { RichRender } from "@bitgrain/studio-core/shape-render/rich/rich-types";
import { richSvgString, svgDataUrl } from "@bitgrain/studio-core/shape-render/rich/rich-svg-string";

interface BackgroundBlurBackdropProps {
  rich: RichRender;
  opacity: number;
}

export const BackgroundBlurBackdrop: React.FC<BackgroundBlurBackdropProps> = ({ rich, opacity }) => {
  if (rich.backgroundBlur <= 0 || rich.coverage.length === 0) return null;
  const mask = `url("${svgDataUrl(richSvgString(rich, rich.coverage))}")`;
  const blur = `blur(${rich.backgroundBlur}px)`;
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: -rich.margin,
        top: -rich.margin,
        width: rich.width + rich.margin * 2,
        height: rich.height + rich.margin * 2,
        opacity,
        backdropFilter: blur,
        WebkitBackdropFilter: blur,
        maskImage: mask,
        WebkitMaskImage: mask,
        maskSize: "100% 100%",
        WebkitMaskSize: "100% 100%",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
      }}
    />
  );
};
