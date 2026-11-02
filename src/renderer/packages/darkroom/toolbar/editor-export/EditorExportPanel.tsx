import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { shareStateSignal, transparentBgSignal } from "../../state/editor-view-store";
import { ExportPopover } from "../ExportPopover";
import { useToolbarState } from "../use-toolbar-state";
import type { ToolbarCallbacks } from "../toolbar-types";

interface EditorExportPanelProps {
  callbacks: ToolbarCallbacks;
  onClose: () => void;
}

export const EditorExportPanel: React.FC<EditorExportPanelProps> = ({ callbacks, onClose }) => {
  const state = useToolbarState();
  const transparentBg = useSignalValue(transparentBgSignal);
  const shareState = useSignalValue(shareStateSignal);
  return (
    <ExportPopover
      transparentBg={transparentBg}
      onToggleTransparentBg={callbacks.onToggleTransparentBg}
      onDownloadRaster={callbacks.onDownloadRaster}
      onDownloadSvg={callbacks.onDownloadSvg}
      onSharePreset={callbacks.onSharePreset}
      shareState={shareState}
      isLUT={!!state.lutId}
      imageData={state.image ?? undefined}
      effectsData={state.effectsData}
      onClose={onClose}
    />
  );
};
