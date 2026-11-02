import React from "react";
import { Crop, RefreshCw, RotateCcw } from "lucide-react";
import type { ImageCrop } from "../../../../data/studioTypes";
import { useSignalValue } from "../../../../lib/signal";
import { isDefaultCrop } from "../../../../utils/image-crop";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { cropLayerIdSignal, enterCropMode, exitCropMode } from "../../layers/crop/crop-mode-signal";

interface ImageFrameActionsProps {
  layerId: string;
  crop?: ImageCrop;
  onResetCrop: () => void;
  onReplace: () => void;
}

export const ImageFrameActions: React.FC<ImageFrameActionsProps> = ({ layerId, crop, onResetCrop, onReplace }) => {
  const cropping = useSignalValue(cropLayerIdSignal) === layerId;

  return (
    <div className="flex items-center gap-0.5">
      {!isDefaultCrop(crop) && (
        <HeaderIconButton title="Reset crop" onClick={onResetCrop}>
          <RotateCcw size={12} strokeWidth={1.75} />
        </HeaderIconButton>
      )}
      <HeaderIconButton
        title={cropping ? "Finish cropping on canvas" : "Crop on canvas"}
        active={cropping}
        onClick={() => (cropping ? exitCropMode() : enterCropMode(layerId))}
      >
        <Crop size={12} strokeWidth={1.75} />
      </HeaderIconButton>
      <HeaderIconButton title="Replace image" onClick={onReplace}>
        <RefreshCw size={12} strokeWidth={1.75} />
      </HeaderIconButton>
    </div>
  );
};
