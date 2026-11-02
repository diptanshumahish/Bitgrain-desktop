import React from "react";
import { Crop, RotateCcw } from "lucide-react";
import type { ImageCrop } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { isDefaultCrop } from "@bitgrain/studio-core/image/image-crop";
import { HeaderIconButton } from "../../ui/HeaderIconButton";
import { cropLayerIdSignal, enterCropMode, exitCropMode } from "../../layers/crop/crop-mode-signal";

interface ImageFrameActionsProps {
  layerId: string;
  crop?: ImageCrop;
  onResetCrop: () => void;
}

export const ImageFrameActions: React.FC<ImageFrameActionsProps> = ({ layerId, crop, onResetCrop }) => {
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
    </div>
  );
};
