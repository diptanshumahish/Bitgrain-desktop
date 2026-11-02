import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { maskBounds } from "@bitgrain/studio-core/mask/mask-bounds";
import { useMaskImage } from "./use-mask-image";
import { maskEffectPad } from "./mask-effect-pad";

interface MaskScopeViewProps {
  mask: Layer;
  zIndex: number;
  scale: number;
  pageImage: string | null;
  maskNode: React.ReactNode;
  chrome: React.ReactNode;
  children: React.ReactNode;
}

export const MaskScopeView: React.FC<MaskScopeViewProps> = ({ mask, zIndex, scale, pageImage, maskNode, chrome, children }) => {
  const bounds = maskBounds(mask, maskEffectPad(mask));
  const wrapperRef = useMaskImage(mask, bounds, scale, pageImage);
  return (
    <>
      <div className="absolute left-0 top-0 opacity-0" style={{ zIndex }}>
        {maskNode}
      </div>
      <div
        ref={wrapperRef}
        className="absolute [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
        style={{ left: bounds.x, top: bounds.y, width: bounds.width, height: bounds.height, zIndex }}
      >
        <div className="absolute" style={{ left: -bounds.x, top: -bounds.y }}>
          {children}
        </div>
      </div>
      {chrome}
    </>
  );
};
