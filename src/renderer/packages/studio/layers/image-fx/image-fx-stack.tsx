import React from "react";
import type { ImageLayerFx } from "@bitgrain/studio-core/shape-render/image-fx/image-layer-fx";
import { imageInnerShadowFilter, innerShadowFilterId } from "@bitgrain/studio-core/shape-render/image-fx/image-layer-fx";
import { SvgNodes } from "@bitgrain/studio-core/shape-render/svg-node/svg-node-react";

interface ImageFxStackProps {
  layerId: string;
  width: number;
  height: number;
  fx: ImageLayerFx;
  opacity: number;
  shadowFilter: string | undefined;
  backdropClip: React.CSSProperties;
  children: React.ReactNode;
}

const contentFilter = (layerId: string, fx: ImageLayerFx): string | undefined => {
  const parts = [
    fx.inner.length > 0 ? `url(#${innerShadowFilterId(layerId)})` : undefined,
    fx.blur > 0 ? `blur(${fx.blur}px)` : undefined,
  ].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" ") : undefined;
};

export const ImageFxStack: React.FC<ImageFxStackProps> = ({ layerId, width, height, fx, opacity, shadowFilter, backdropClip, children }) => {
  const backdrop = `blur(${fx.backdrop}px)`;
  return (
    <>
      {fx.backdrop > 0 && (
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit]"
          style={{ ...backdropClip, opacity, backdropFilter: backdrop, WebkitBackdropFilter: backdrop }}
        />
      )}
      <div className="absolute inset-0 rounded-[inherit]" style={{ opacity, filter: shadowFilter }}>
        <div className="relative w-full h-full rounded-[inherit]" style={{ filter: contentFilter(layerId, fx) }}>
          {fx.inner.length > 0 && (
            <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
              <defs>
                <SvgNodes nodes={[imageInnerShadowFilter(layerId, fx, width, height)]} />
              </defs>
            </svg>
          )}
          {children}
        </div>
      </div>
    </>
  );
};
