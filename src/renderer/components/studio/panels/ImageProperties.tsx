import React from "react";
import type { ImageLayer } from "../../../data/studioTypes";
import { resolveAssetUrl } from "../../../lib/api-client";
import { emitModal } from "../../../lib/event-bus";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";
import { AppearanceControls } from "./appearance-controls";
import { BitgrainEffectControls } from "./BitgrainEffectControls";
import { ShadowGlowControls } from "./shadow-glow-controls";
import { MatchPageButton } from "./match-page-button";
import { ImageFrameCard } from "./image/ImageFrameCard";
import { ColorSection } from "./image/ColorSection";

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
    emitModal({
      type: "add-image",
      title: layer.src ? "Replace image" : "Choose image",
      onPick: (src) => {
        if (onUpload) onUpload(src);
        onChange({ src } as Partial<ImageLayer>);
      },
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
        onCropChange={(crop) => onChange({ crop })}
      />

      <PanelGroup title="Position & Size" actions={onMatchPage && <MatchPageButton onClick={onMatchPage} />}>
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
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
      </PanelGroup>

      <PanelGroup title="Appearance">
        <AppearanceControls
          opacity={layer.opacity}
          blendMode={layer.blendMode}
          onOpacityChange={(opacity) => onChange({ opacity })}
          onBlendModeChange={(blendMode) => onChange({ blendMode })}
        />
      </PanelGroup>

      <ColorSection
        filters={layer.filters}
        colorGrade={layer.colorGrade}
        masks={layer.masks}
        sourceUrl={resolvedSrc}
        hasEffect={!!layer.bitgrainEffect}
        onChange={onChange}
      />

      <PanelGroup title="Effect">
        <BitgrainEffectControls
          effect={layer.bitgrainEffect}
          onChange={(effect) => onChange({ bitgrainEffect: effect })}
        />
      </PanelGroup>

      <ShadowGlowControls shadow={layer.shadow} onChange={(shadow) => onChange({ shadow })} />
    </div>
  );
};
