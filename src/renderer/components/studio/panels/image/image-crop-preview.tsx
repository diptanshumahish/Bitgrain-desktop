import React, { useRef } from "react";
import type { ImageCrop } from "../../../../data/studioTypes";
import { cropImageStyle, type ImageFit } from "../../../../utils/image-crop";
import { ImageFrameMarks } from "./image-frame-marks";
import { usePreviewPan } from "./use-preview-pan";

interface ImageCropPreviewProps {
  src: string;
  fit: ImageFit;
  crop?: ImageCrop;
  width: number;
  height: number;
  maxHeight: number;
  onChange: (crop: ImageCrop) => void;
}

export const ImageCropPreview: React.FC<ImageCropPreviewProps> = ({ src, fit, crop, width, height, maxHeight, onChange }) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const pan = usePreviewPan({ fit, crop, imgRef, onChange });
  const aspect = Math.max(1, width) / Math.max(1, height);

  return (
    <div
      className="relative overflow-hidden rounded-[3px] cursor-grab active:cursor-grabbing touch-none"
      style={{ aspectRatio: aspect, width: `min(100%, ${maxHeight * aspect}px)` }}
      onPointerDown={pan.onPointerDown}
      onPointerMove={pan.onPointerMove}
      onPointerUp={pan.onPointerUp}
      title="Drag to choose what shows"
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        className="w-full h-full block pointer-events-none select-none"
        style={{ ...cropImageStyle(crop), objectFit: fit }}
      />
      <ImageFrameMarks tone="light" />
    </div>
  );
};
