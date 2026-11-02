import React from "react";
import { Circle, Blend } from "lucide-react";
import type { VectorLayer, BlendMode } from "../../../data/studioTypes";
import { ScrubField } from "../ui/panelPrimitives";
import { BLEND_MODE_OPTIONS } from "../ui/blend-modes";
import { Dropdown } from "../ui/dropdown";
import { PanelGroup } from "../ui/panel-group";
import { AlignRow } from "../ui/align-row";
import { PositionSizeFields } from "../ui/position-size-fields";
import { VectorFillSection } from "./VectorFillSection";
import { VectorStrokeSection } from "./vector/VectorStrokeSection";
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
  const isClosed = layer.path.closed;

  return (
    <div className="flex flex-col font-editorial">
      <VectorSpecimenCard layer={layer} />
      <PanelGroup title="Position & Size">
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

      {isClosed && (
        <VectorFillSection layer={layer} pageImage={pageImage ?? null} onChange={onChange} />
      )}

      <VectorStrokeSection layer={layer} onChange={onChange} />

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
            value={layer.blendMode ?? "normal"}
            onChange={(v) => onChange({ blendMode: v as BlendMode })}
          />
        </div>
      </PanelGroup>
    </div>
  );
};
