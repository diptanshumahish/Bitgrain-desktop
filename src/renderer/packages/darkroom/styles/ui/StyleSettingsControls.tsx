import React from "react";
import type { StyleSettings } from "@bitgrain/engine/styles/engine/style-types";
import { findStyle, styleParamSpecs } from "@bitgrain/engine/styles/engine/style-registry";
import { settingsFromLook, withParam } from "../state/style-edits";
import { LooksStrip } from "./LooksStrip";
import { ParamList } from "./ParamList";

interface StyleSettingsControlsProps {
  settings: StyleSettings;
  onChange: (settings: StyleSettings) => void;
  onCommit: () => void;
}

export const StyleSettingsControls: React.FC<StyleSettingsControlsProps> = ({ settings, onChange, onCommit }) => {
  const definition = findStyle(settings.styleId);
  return (
    <div className="flex flex-col gap-2">
      <LooksStrip styleId={definition.id} onApply={(look) => { onChange(settingsFromLook(definition.id, look)); onCommit(); }} />
      <ParamList specs={styleParamSpecs(definition)} values={settings.params}
        onChange={(key, value) => onChange(withParam(settings, key, value))} onCommit={onCommit} />
    </div>
  );
};
