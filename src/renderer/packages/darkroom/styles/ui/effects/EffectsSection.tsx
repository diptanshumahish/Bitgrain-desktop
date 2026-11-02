import React from "react";
import { X } from "lucide-react";
import type { EffectStates } from "@bitgrain/engine/styles/engine/style-types";
import { activeEffectKeys, activeEffects } from "@bitgrain/engine/styles/postfx/effect-registry";
import type { EffectDefinition } from "@bitgrain/engine/styles/postfx/effect-definition";
import { withEffectEnabled, withEffectValue, withEffectValues } from "../../state/style-edits";
import { ParamList } from "../ParamList";
import { AddEffectButton } from "./AddEffectButton";

interface EffectsSectionProps {
  effects: EffectStates;
  onChange: (effects: EffectStates) => void;
  onCommit: () => void;
}

interface EffectRowProps extends EffectsSectionProps {
  effect: EffectDefinition;
}

const PresetChips: React.FC<EffectRowProps> = ({ effect, effects, onChange, onCommit }) => (
  <div className="flex flex-wrap gap-1 px-2 pb-1">
    {(effect.presets ?? []).map((preset) => (
      <button key={preset.name} type="button" onClick={() => { onChange(withEffectValues(effects, effect.key, preset.values)); onCommit(); }}
        className="h-6 px-2 rounded-md bg-[var(--s-bg-input)] text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors">
        {preset.name}
      </button>
    ))}
  </div>
);

export const EffectRow: React.FC<EffectRowProps> = (props) => {
  const { effect, effects, onChange, onCommit } = props;
  return (
    <div className="flex flex-col gap-1.5 py-2 border-b border-[var(--s-border)] last:border-b-0">
      <div className="flex items-center justify-between px-2">
        <span className="text-[12px] font-medium text-[var(--s-text)]">{effect.label}</span>
        <button type="button" aria-label={`Remove ${effect.label}`} onClick={() => { onChange(withEffectEnabled(effects, effect.key, false)); onCommit(); }}
          className="w-6 h-6 flex items-center justify-center rounded-md text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)]">
          <X size={12} />
        </button>
      </div>
      {effect.presets && <PresetChips {...props} />}
      <ParamList specs={effect.params} values={effects[effect.key]?.values ?? {}}
        onChange={(key, value) => onChange(withEffectValue(effects, effect.key, key, value))} onCommit={onCommit} />
    </div>
  );
};

export const EffectsSection: React.FC<EffectsSectionProps> = ({ effects, onChange, onCommit }) => {
  const active = activeEffects(effects);
  const activeKeys = activeEffectKeys(effects);
  return (
    <div className="flex flex-col gap-2">
      {active.length > 0 && (
        <div className="rounded-md border border-[var(--s-border)]">
          {active.map((effect) => <EffectRow key={effect.key} effect={effect} effects={effects} onChange={onChange} onCommit={onCommit} />)}
        </div>
      )}
      <AddEffectButton activeKeys={activeKeys} onAdd={(key) => { onChange(withEffectEnabled(effects, key, true)); onCommit(); }} />
    </div>
  );
};
