import React, { useState } from "react";
import type { ImageCrop } from "../../../../data/studioTypes";
import { fittedRect, type ImageFit } from "../../../../utils/image-crop";

interface CropGhostProps {
  src: string;
  fit: ImageFit;
  crop?: ImageCrop;
  width: number;
  height: number;
  scale: number;
}

interface NaturalSize {
  width: number;
  height: number;
}

const GHOST_OPACITY = 0.35;

export const CropGhost: React.FC<CropGhostProps> = ({ src, fit, crop, width, height, scale }) => {
  const [natural, setNatural] = useState<NaturalSize | null>(null);
  const rect = natural ? fittedRect(fit, natural.width, natural.height, { x: 0, y: 0, width, height }, crop) : null;

  return (
    <div
      className="absolute pointer-events-none"
      style={
        rect
          ? { left: rect.x, top: rect.y, width: rect.width, height: rect.height, outline: `${1 / scale}px dashed var(--s-canvas-selection)` }
          : { visibility: "hidden" }
      }
    >
      <img
        src={src}
        alt=""
        draggable={false}
        className="w-full h-full block"
        style={{ opacity: GHOST_OPACITY }}
        onLoad={(event) => setNatural({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })}
      />
    </div>
  );
};
