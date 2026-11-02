import React from "react";
import { EditorInspector } from "../../toolbar/inspector/EditorInspector";
import { MobileToolbar } from "../../toolbar/MobileToolbar";
import { ImageExportDialogPortal } from "../../toolbar/export-dialog/ImageExportDialogPortal";
import { activePanelSignal } from "../../toolbar/panel-state/active-panel-store";
import { useSignalValue } from "@bitgrain/core/signal";
import { imageSignal } from "../../state/image-store";
import { MOBILE_IMAGE_ACCEPT } from "../accept-formats";
import { useInspectorEscape } from "./use-inspector-escape";
import { RecipePanel } from "../../recipe/ui/RecipePanel";
import { useEditorLayout } from "../../toolbar/panel-state/editor-layout-store";
import type { ActivePopover, ToolbarCallbacks } from "../../toolbar/toolbar-types";

interface EditorWorkspaceProps {
  callbacks: ToolbarCallbacks;
  onToggleCompare: () => void;
  onClear: () => void;
  children: React.ReactNode;
}

const toggle = (key: ActivePopover): void => {
  activePanelSignal.value = activePanelSignal.value === key ? null : key;
};

const close = (): void => {
  activePanelSignal.value = null;
};

export const EditorWorkspace: React.FC<EditorWorkspaceProps> = ({ callbacks, onToggleCompare, onClear, children }) => {
  const active = useSignalValue(activePanelSignal);
  const hasImage = useSignalValue(imageSignal) !== null;
  const layout = useEditorLayout();
  const isPhone = layout === "phone";
  useInspectorEscape(close);

  return (
    <>
      <div className="flex-1 min-h-0 flex">
        {hasImage && layout === "recipe" && <RecipePanel active={active} />}
        <div className="flex-1 min-w-0 flex flex-col relative">{children}</div>
        {!isPhone && <EditorInspector active={active} toggle={toggle} close={close} callbacks={callbacks} />}
      </div>
      {isPhone && (
        <MobileToolbar
          active={active}
          toggle={toggle}
          close={close}
          callbacks={callbacks}
          onClear={onClear}
          onToggleCompare={onToggleCompare}
          imageAccept={MOBILE_IMAGE_ACCEPT}
        />
      )}
      <ImageExportDialogPortal callbacks={callbacks} />
    </>
  );
};
