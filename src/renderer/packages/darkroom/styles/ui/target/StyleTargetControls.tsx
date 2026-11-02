import React from "react";
import { Sparkles } from "lucide-react";
import type { StyleSettings } from "@bitgrain/engine/styles/engine/style-types";
import { StyleSettingsControls } from "../StyleSettingsControls";
import { EffectsSection } from "../effects/EffectsSection";
import { StyleTargetCard } from "./StyleTargetCard";

interface StyleTargetControlsProps {
  settings: StyleSettings | null;
  thumbSource: string;
  onBrowse: () => void;
  onChange: (settings: StyleSettings) => void;
}

const noop = (): void => undefined;

export const StyleTargetControls: React.FC<StyleTargetControlsProps> = ({ settings, thumbSource, onBrowse, onChange }) => {
  if (!settings) {
    return (
      <button type="button" onClick={onBrowse}
        className="w-full h-9 flex items-center justify-center gap-1.5 rounded-lg border border-dashed border-[var(--s-border)] text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:border-[var(--s-border-hover)] transition-colors">
        <Sparkles size={13} />
        Choose a style
      </button>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      <StyleTargetCard styleId={settings.styleId} thumbSource={thumbSource} onChange={onBrowse} />
      <StyleSettingsControls settings={settings} onChange={onChange} onCommit={noop} />
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[var(--s-text-subtle)]">Effects</span>
        <EffectsSection effects={settings.effects} onChange={(effects) => onChange({ ...settings, effects })} onCommit={noop} />
      </div>
    </div>
  );
};
