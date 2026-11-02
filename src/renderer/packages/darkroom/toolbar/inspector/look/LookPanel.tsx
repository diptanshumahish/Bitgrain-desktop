import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { setStyleEffects, styleSettingsSignal } from "../../../styles/state/style-store";
import { EffectsSection } from "../../../styles/ui/effects/EffectsSection";
import { mainEffectOf } from "../../effects/main-effect-modes";
import { useEditorLayout } from "../../panel-state/editor-layout-store";
import type { ToolbarState } from "../../use-toolbar-state";
import type { ActivePopover } from "../../toolbar-types";
import { PanelSection } from "./PanelSection";
import { SelectedLook } from "./SelectedLook";
import { StyleCard } from "./StyleCard";
import { LookShortcuts } from "./LookShortcuts";

interface LookPanelProps {
  state: ToolbarState;
  toggle: (key: ActivePopover) => void;
}

export const LookPanel: React.FC<LookPanelProps> = ({ state, toggle }) => {
  const settings = useSignalValue(styleSettingsSignal);
  const mainMode = mainEffectOf(state.mode);
  const showsRecipe = useEditorLayout() === "recipe";
  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-2 px-3 pt-3 pb-3 border-b border-[var(--s-border)]">
        <StyleCard mainMode={mainMode} styleId={settings.styleId} />
        {!showsRecipe && <LookShortcuts state={state} toggle={toggle} />}
      </div>
      <SelectedLook state={state} mainMode={mainMode} settings={settings} />
      {!showsRecipe && (
        <PanelSection title="Effects">
          <EffectsSection effects={settings.effects} onChange={setStyleEffects} onCommit={state.onDone} />
        </PanelSection>
      )}
    </div>
  );
};
