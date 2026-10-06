import React from "react";
import type { AdjustmentLayer } from "../../../data/studioTypes";
import { Section } from "../ui/panelPrimitives";
import { PositionSizeFields } from "../ui/position-size-fields";
import { AlignRow } from "../ui/align-row";
import { AppearanceControls } from "./appearance-controls";
import { BitgrainEffectControls } from "./BitgrainEffectControls";

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
    <div className="px-3.5 pt-4 pb-1 text-[11px] text-[var(--s-text-muted)] leading-snug">
      Applies its effect to everything below it, within this box.
    </div>

    <Section title="Position & Size">
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
    </Section>

    <Section title="Appearance">
      <AppearanceControls
        opacity={layer.opacity}
        blendMode={layer.blendMode}
        filters={layer.filters}
        onOpacityChange={(opacity) => onChange({ opacity })}
        onBlendModeChange={(blendMode) => onChange({ blendMode })}
        onFiltersChange={(filters) => onChange({ filters })}
      />
    </Section>

    <Section title="Effect">
      <BitgrainEffectControls
        effect={layer.bitgrainEffect}
        onChange={(effect) => onChange({ bitgrainEffect: effect })}
      />
    </Section>
  </div>
);
