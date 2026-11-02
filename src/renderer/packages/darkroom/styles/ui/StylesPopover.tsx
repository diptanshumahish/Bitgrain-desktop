import React from "react";
import { Popover, PopoverSection } from "@bitgrain/ui/controls/toolbar/Popover";
import { useSignalValue } from "@bitgrain/core/signal";
import { findStyle } from "@bitgrain/engine/styles/engine/style-registry";
import { replaceStyleSettings, selectStyle, setStyleEffects, styleSettingsSignal } from "../state/style-store";
import { StylePicker } from "./StylePicker";
import { StyleSettingsControls } from "./StyleSettingsControls";
import { EffectsSection } from "./effects/EffectsSection";
import { SurpriseButton } from "./SurpriseButton";

interface StylesPopoverProps {
  onStateChangeFinished: () => void;
  onClose: () => void;
  static?: boolean;
}

const Divider: React.FC = () => <div className="h-px bg-[var(--s-border)] opacity-50" />;

export const StylesPopover: React.FC<StylesPopoverProps> = ({ onStateChangeFinished, onClose, static: isStatic }) => {
  const settings = useSignalValue(styleSettingsSignal);
  const definition = findStyle(settings.styleId);
  return (
    <Popover onClose={onClose} className="w-72" static={isStatic}>
      <div className={isStatic ? "" : "max-h-[72vh] overflow-y-auto"}>
        <PopoverSection title={<span className="flex items-center justify-between">Style<SurpriseButton onCommit={onStateChangeFinished} /></span>}>
          <StylePicker selectedId={definition.id} onSelect={(styleId) => { selectStyle(styleId); onStateChangeFinished(); }} />
        </PopoverSection>
        <Divider />
        <PopoverSection title={definition.label}>
          <StyleSettingsControls settings={settings} onChange={replaceStyleSettings} onCommit={onStateChangeFinished} />
        </PopoverSection>
        <Divider />
        <PopoverSection title="Effects">
          <EffectsSection effects={settings.effects} onChange={setStyleEffects} onCommit={onStateChangeFinished} />
        </PopoverSection>
      </div>
    </Popover>
  );
};
