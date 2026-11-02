import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { setStyleEffects, styleSettingsSignal } from "../../styles/state/style-store";
import { findEffect } from "@bitgrain/engine/styles/postfx/effect-registry";
import { EffectRow } from "../../styles/ui/effects/EffectsSection";
import { selectedEffectKeySignal } from "../recipe-selection";

interface EffectStepPanelProps {
  onCommit: () => void;
}

export const EffectStepPanel: React.FC<EffectStepPanelProps> = ({ onCommit }) => {
  const settings = useSignalValue(styleSettingsSignal);
  const effectKey = useSignalValue(selectedEffectKeySignal);
  const effect = findEffect(effectKey);
  if (!effect || !settings.effects[effect.key]?.enabled) {
    return <p className="px-4 py-4 text-[13px] text-[var(--s-text-muted)]">This effect is no longer on the photo. Pick a step in the recipe to edit it.</p>;
  }
  return (
    <div className="px-3 py-2">
      <EffectRow effect={effect} effects={settings.effects} onChange={setStyleEffects} onCommit={onCommit} />
    </div>
  );
};
