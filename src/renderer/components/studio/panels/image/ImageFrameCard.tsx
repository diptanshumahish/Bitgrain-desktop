import React from "react";
import { ImagePlus } from "lucide-react";
import type { ImageCrop } from "../../../../data/studioTypes";
import { formatRatio, formatSize } from "../../../../utils/dimension-format";
import { DEFAULT_CROP, MAX_CROP_ZOOM, MIN_CROP_ZOOM, clampCrop, type ImageFit } from "../../../../utils/image-crop";
import { Slider } from "../../ui/slider";
import { ImageFrameMarks } from "./image-frame-marks";
import { ImageCropPreview } from "./image-crop-preview";
import { ImageFrameActions } from "./image-frame-actions";

interface ImageFrameCardProps {
  layerId: string;
  src: string | null;
  fit: ImageFit;
  crop?: ImageCrop;
  width: number;
  height: number;
  onReplace: () => void;
  onCropChange: (crop: ImageCrop | undefined) => void;
  children?: React.ReactNode;
}

const PERCENT = 100;
const PREVIEW_HEIGHT = 132;

const EmptyPreview: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="relative w-full h-full flex flex-col items-center justify-center gap-1.5 border-none p-0 cursor-pointer bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)]"
  >
    <ImagePlus size={18} strokeWidth={1.5} />
    <span className="text-[11px]">Choose an image</span>
    <ImageFrameMarks tone="muted" />
  </button>
);

export const ImageFrameCard: React.FC<ImageFrameCardProps> = ({
  layerId, src, fit, crop, width, height, onReplace, onCropChange, children,
}) => {
  const current = crop ?? DEFAULT_CROP;

  return (
    <div className="flex flex-col gap-3 px-4 pt-4">
      <div className="rounded-xl border border-[var(--s-border)] overflow-hidden">
        <div className="flex items-center justify-center h-[132px] p-2 bg-[var(--s-bg-input)]">
          {src ? (
            <ImageCropPreview src={src} fit={fit} crop={crop} width={width} height={height} maxHeight={PREVIEW_HEIGHT} onChange={onCropChange} />
          ) : (
            <EmptyPreview onClick={onReplace} />
          )}
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-[12.5px] font-semibold text-[var(--s-text)] [font-variant-numeric:tabular-nums] truncate">
              {formatSize(width, height)}
            </span>
            <span className="text-[10.5px] text-[var(--s-text-subtle)] shrink-0">{formatRatio(width, height)}</span>
          </div>
          {src && <ImageFrameActions layerId={layerId} crop={crop} onResetCrop={() => onCropChange(undefined)} onReplace={onReplace} />}
        </div>
      </div>
      {src && (
        <Slider
          label="Zoom"
          value={Math.round(current.zoom * PERCENT)}
          min={MIN_CROP_ZOOM * PERCENT}
          max={MAX_CROP_ZOOM * PERCENT}
          step={1}
          suffix="%"
          onChange={(value) => onCropChange(clampCrop({ ...current, zoom: value / PERCENT }))}
        />
      )}
      {children}
    </div>
  );
};
