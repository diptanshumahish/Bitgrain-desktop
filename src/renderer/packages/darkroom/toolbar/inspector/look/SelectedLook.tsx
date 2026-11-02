import React from "react";
import type { TransformMode } from "@bitgrain/engine/core/types";
import type { StyleSettings } from "@bitgrain/engine/styles/engine/style-types";
import { replaceStyleSettings } from "../../../styles/state/style-store";
import { StyleSettingsControls } from "../../../styles/ui/StyleSettingsControls";
import { EffectPanels } from "../EffectPanels";
import type { ToolbarState } from "../../use-toolbar-state";
import { classicPanelFor } from "./classic-entries";
import { PanelSection } from "./PanelSection";

interface SelectedLookProps {
  state: ToolbarState;
  mainMode: TransformMode;
  settings: StyleSettings;
}

const noop = (): void => undefined;

export const SelectedLook: React.FC<SelectedLookProps> = ({ state, mainMode, settings }) => {
  if (mainMode === "style") {
    return (
      <PanelSection title="Settings">
        <StyleSettingsControls settings={settings} onChange={replaceStyleSettings} onCommit={state.onDone} />
      </PanelSection>
    );
  }
  const panel = classicPanelFor(mainMode);
  if (!panel) return null;
  return (
    <PanelSection title="Settings" flush>
      <EffectPanels state={state} active={panel} close={noop} />
    </PanelSection>
  );
};
