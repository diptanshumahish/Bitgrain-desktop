import React from "react";
import { PhotoLookSections } from "./style-look/PhotoLookSections"
import type { ImageLayer } from "@bitgrain/studio-core/model/studio-types";
import { resolveAssetUrl } from "@bitgrain/api/api-client";
import { emitStudioModal } from "../modals/studio-dialog/host/studio-modal-events";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";
import { AppearanceControls } from "./appearance-controls";
import { ImageEffectsSection } from "./paint-list/effects/image/ImageEffectsSection";
import { MatchPageButton } from "./match-page-button";
import { ImageFrameCard } from "./image/ImageFrameCard";
import { CornerRadiusFields } from "./corner/CornerRadiusFields";
import { removeLayerBackground } from "@bitgrain/darkroom/background-removal/actions/remove-layer-background";

interface ImagePropertiesProps {
  layer: ImageLayer;
  onChange: (updates: Partial<ImageLayer>) => void;
  onUpload?: (dataUrl: string) => void;
  onAlign?: (alignment: string) => void;
  onMatchPage?: () => void;
}

export const ImageProperties: React.FC<ImagePropertiesProps> = ({
  layer,
  onChange,
  onUpload,
  onAlign,
  onMatchPage,
}) => {
  const resolvedSrc = resolveAssetUrl(layer.src) ?? layer.src ?? null;

  const openPicker = () => {
    emitStudioModal({
      type: "add-image",
      title: layer.src ? "Replace image" : "Choose image",
      onPick: (src) => {
        if (onUpload) onUpload(src);
        onChange({ src } as Partial<ImageLayer>);
      },
    });
  };

  const removeBackground = (): void => {
    if (!resolvedSrc || !layer.src) return;
    void removeLayerBackground({
      sourceUrl: resolvedSrc,
      originalSrc: layer.src,
      layerName: layer.name,
      applySrc: (src) => onChange({ src }),
    });
  };

  return (
    <div className="flex flex-col font-editorial pb-6">
      <ImageFrameCard
        layerId={layer.id}
        src={resolvedSrc}
        fit={layer.fit}
        crop={layer.crop}
        width={layer.width}
        height={layer.height}
        onReplace={openPicker}
        onRemoveBackground={removeBackground}
        onCropChange={(crop) => onChange({ crop })}
      />

      <PhotoLookSections layer={layer} sourceUrl={resolvedSrc} onChange={onChange} />

      <PanelGroup title="Position & size" actions={onMatchPage && <MatchPageButton onClick={onMatchPage} />}>
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          showRadius={false}
          values={{
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation ?? 0,
            borderRadius: layer.borderRadius ?? 0,
          }}
          onChange={onChange}
        />
        <CornerRadiusFields
          radius={layer.borderRadius ?? 0}
          radii={layer.cornerRadii}
          smoothing={layer.cornerSmoothing}
          onChange={onChange}
        />
      </PanelGroup>

      <PanelGroup title="Appearance">
        <AppearanceControls
          opacity={layer.opacity}
          blendMode={layer.blendMode}
          onOpacityChange={(opacity) => onChange({ opacity })}
          onBlendModeChange={(blendMode) => onChange({ blendMode })}
        />
      </PanelGroup>

      <ImageEffectsSection layerId={layer.id} fields={{ shadow: layer.shadow, layerEffects: layer.layerEffects }} supportsEdge={false} onChange={onChange} />
    </div>
  );
};
