import React, { memo } from "react";
import { PresetsPopover } from "../popovers/PresetsPopover";
import { EditorExportPanel } from "../editor-export/EditorExportPanel";
import { ColourPanels } from "./ColourPanels";
import { InspectorTone } from "./InspectorTone";
import { LookPanel } from "./look/LookPanel";
import { ToneBasics } from "./tone/ToneBasics";
import { EffectStepPanel } from "../../recipe/ui/EffectStepPanel";
import { useToolbarState } from "../use-toolbar-state";
import type { ActivePopover, InspectorPanel, ToolbarCallbacks } from "../toolbar-types";

interface InspectorBodyProps {
  panel: InspectorPanel;
  toggle: (key: ActivePopover) => void;
  close: () => void;
  callbacks: ToolbarCallbacks;
}

const InspectorBodyView: React.FC<InspectorBodyProps> = ({ panel, toggle, close, callbacks }) => {
  const s = useToolbarState();
  return (
    <>
      {panel === "effects" && <LookPanel state={s} toggle={toggle} />}
      {panel === "effect" && <EffectStepPanel onCommit={s.onDone} />}
      <ColourPanels state={s} active={panel} toggle={toggle} close={close} />
      {panel === "tone" && (
        <div className="pt-3">
          <div className="px-3"><ToneBasics state={s} /></div>
          <InspectorTone />
        </div>
      )}
      {panel === "presets" && <PresetsPopover onApplyPreset={s.applyPreset} onClose={close} currentConfig={s.currentConfig} customPresets={callbacks.customPresets} onSaveCustomPreset={callbacks.onSaveCustomPreset} onDeleteCustomPreset={callbacks.onDeleteCustomPreset} static />}
      {panel === "export" && <EditorExportPanel callbacks={callbacks} onClose={close} />}
    </>
  );
};

export const InspectorBody = memo(InspectorBodyView);
