import React from "react";
import type { AdjustmentLayer } from "../../../data/studioTypes";
import { PanelGroup } from "../ui/panel-group";
import { PositionSizeFields } from "../ui/position-size-fields";
import { AlignRow } from "../ui/align-row";
import { AppearanceControls } from "./appearance-controls";
import { AdjustSection } from "./image/AdjustSection";
import { BitgrainEffectControls } from "./BitgrainEffectControls";
import { GradeControls } from "../../../modules/grading/ui/GradeControls";

interface AdjustmentPropertiesProps {
  layer: AdjustmentLayer;
  onChange: (updates: Partial<AdjustmentLayer>) => void;
  onAlign?: (alignment: string) => void;
}

export const AdjustmentProperties: React.FC<AdjustmentPropertiesProps> = ({
  layer,
  onChange,
  onAlign,
}) => (
  <div className="flex flex-col font-editorial">
    <div className="px-4 pt-4 text-[11px] text-[var(--s-text-muted)] leading-snug">
      Applies its effect and color grade to everything below it, within this box.
    </div>

    <PanelGroup title="Position & Size">
      {onAlign && <AlignRow onAlign={onAlign} />}
      <PositionSizeFields
        values={{
          x: layer.x,
          y: layer.y,
          width: layer.width,
          height: layer.height,
          rotation: 0,
          borderRadius: 0,
        }}
        onChange={(updates) => onChange(updates as Partial<AdjustmentLayer>)}
        showRadius={false}
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

    <AdjustSection filters={layer.filters} onChange={(filters) => onChange({ filters })} defaultOpen />

    <PanelGroup title="Effect">
      <BitgrainEffectControls
        effect={layer.bitgrainEffect}
        onChange={(effect) => onChange({ bitgrainEffect: effect })}
      />
    </PanelGroup>

    <PanelGroup title="Color grade">
      <GradeControls grade={layer.colorGrade} onChange={(colorGrade) => onChange({ colorGrade })} />
    </PanelGroup>
  </div>
);
