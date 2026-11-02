import React from "react";
import { Circle, Blend } from "lucide-react";
import type { VectorLayer, BlendMode } from "@bitgrain/studio-core/model/studio-types";
import { ScrubField } from "@bitgrain/ui/controls/panel/panelPrimitives";
import { BLEND_MODE_OPTIONS, BLEND_MODE_HINT } from "../ui/blend-modes";
import { Dropdown } from "../ui/dropdown";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";
import { VectorPaintSections } from "./vector/VectorPaintSections";
import { EffectsListSection } from "./paint-list/effects/EffectsListSection";
import { VectorSpecimenCard } from "./vector/VectorSpecimenCard";

interface VectorPropertiesProps {
  layer: VectorLayer;
  pageImage?: string | null;
  onChange: (updates: Partial<VectorLayer>) => void;
  onAlign?: (alignment: string) => void;
}

export const VectorProperties: React.FC<VectorPropertiesProps> = ({
  layer,
  pageImage,
  onChange,
  onAlign,
}) => {
  return (
    <div className="flex flex-col font-editorial">
      <VectorSpecimenCard layer={layer} />
      <PanelGroup title="Position & size">
        {onAlign && <AlignRow onAlign={onAlign} />}
        <PositionSizeFields
          values={{
            x: layer.x,
            y: layer.y,
            width: layer.width,
            height: layer.height,
            rotation: layer.rotation,
            borderRadius: 0,
          }}
          onChange={onChange}
        />
      </PanelGroup>

      <VectorPaintSections layer={layer} pageImage={pageImage ?? null} onChange={onChange} />

      <EffectsListSection effects={layer.layerEffects} onChange={(layerEffects) => onChange({ layerEffects })} />

      <PanelGroup title="Appearance">
        <div className="grid grid-cols-2 gap-2">
          <ScrubField
            label={<Circle size={12} strokeWidth={1.75} />}
            value={Math.round(layer.opacity * 100)}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => onChange({ opacity: v / 100 })}
          />
          <Dropdown
            icon={<Blend size={13} strokeWidth={1.75} />}
            options={BLEND_MODE_OPTIONS}
            title={BLEND_MODE_HINT}
            value={layer.blendMode ?? "normal"}
            onChange={(v) => onChange({ blendMode: v as BlendMode })}
          />
        </div>
      </PanelGroup>
    </div>
  );
};
