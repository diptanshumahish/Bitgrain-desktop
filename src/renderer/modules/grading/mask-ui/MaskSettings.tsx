import React from "react";
import { Slider } from "../../../components/studio/ui/slider";
import { BtnGroup } from "../../../components/studio/ui/panelPrimitives";
import type { MaskEffectMode, MaskLayer } from "../mask/mask-types";
import { MaskHeader } from "./mask-header";
import { MaskAreaControls } from "./mask-area-controls";
import { ToggleRow } from "./refine/toggle-row";
import { trackEvent } from "../../../lib/tracker";

export interface MaskOverlayToggle {
  value: boolean;
  onChange: (value: boolean) => void;
}

interface MaskSettingsProps {
  mask: MaskLayer;
  sourceUrl: string | null;
  hasEffect: boolean;
  overlay?: MaskOverlayToggle;
  onChange: (mask: MaskLayer) => void;
  onDelete: () => void;
  onCommit?: () => void;
}

const AMOUNT_MAX = 100;

const EFFECT_OPTIONS: Array<{ value: MaskEffectMode; label: string }> = [
  { value: "keep", label: "keep effect here" },
  { value: "remove", label: "remove effect here" },
];

export const MaskSettings: React.FC<MaskSettingsProps> = ({ mask, sourceUrl, hasEffect, overlay, onChange, onDelete, onCommit }) => {
  const update = (patch: Partial<MaskLayer>): void => onChange({ ...mask, ...patch });

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border border-[var(--s-accent)] bg-[var(--s-bg-panel)]">
      <MaskHeader
        mask={mask}
        onRename={(name) => update({ name })}
        onToggleVisible={() => {
          update({ visible: !mask.visible });
          trackEvent("grading", "mask_visibility_toggled", { details: { visible: !mask.visible } });
        }}
        onDelete={onDelete}
        onCommit={onCommit}
      />
      {overlay && <ToggleRow label="show area in red" value={overlay.value} onChange={overlay.onChange} />}
      <MaskAreaControls area={mask.area} sourceUrl={sourceUrl} onChange={(area) => update({ area })} onCommit={onCommit} />
      <Slider label="strength" value={mask.amount} max={AMOUNT_MAX} suffix="%" onChange={(amount) => update({ amount })} onCommit={onCommit} />
      {hasEffect && (
        <BtnGroup
          options={EFFECT_OPTIONS}
          value={mask.effect}
          onChange={(effect) => {
            update({ effect: effect as MaskEffectMode });
            onCommit?.();
            trackEvent("grading", "mask_effect_changed", { details: { effect } });
          }}
        />
      )}
    </div>
  );
};
