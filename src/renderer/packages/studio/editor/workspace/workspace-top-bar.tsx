import React from "react";
import { TopBar } from "../../workspace/TopBar";
import { trackEvent } from "@bitgrain/platform/tracker";
import { toggleTheme } from "@bitgrain/ui/theme/global-theme-store";
import { requestCanvasFit, requestCanvasZoom } from "../../state/canvas-fit-request";
import type { StudioWorkspaceProps } from "./studio-workspace-props";
import { freezeDuringGesture } from "./gesture-freeze";

const FrozenTopBar = freezeDuringGesture(TopBar);

type TopBarSourceProps = Pick<
  StudioWorkspaceProps,
  | "effectiveTemplate" | "background" | "layers" | "image" | "pages" | "activePageId" | "zoom" | "dark"
  | "past" | "future" | "workName" | "onRenameWork" | "animation" | "handleExit" | "handleOpenAccount"
  | "undo" | "redo" | "handleAddImage" | "handleAddAdjustment" | "handleLoadBTG" | "handleNewProject"
  | "selectedLayer" | "selectedIds" | "handleApplyKitColor" | "handleApplyKitTextStyle" | "handleApplyKitNumber"
  | "handleVariableColorChange"
> & { onResize: () => void };

export const WorkspaceTopBar = (props: TopBarSourceProps): React.ReactElement => {
  const { undo, redo, dark } = props;
  return (
    <FrozenTopBar
      template={props.effectiveTemplate}
      background={props.background}
      layers={props.layers}
      image={props.image}
      pages={props.pages}
      activePageId={props.activePageId}
      zoom={props.zoom}
      dark={dark}
      canUndo={props.past.length > 0}
      canRedo={props.future.length > 0}
      workName={props.workName}
      onRenameWork={props.onRenameWork}
      onToggleAnimate={props.animation.toggleMode}
      onBack={props.handleExit}
      onOpenAccount={props.handleOpenAccount}
      onUndo={() => {
        undo();
        trackEvent("studio", "undo_used", { details: { source: "toolbar" } });
      }}
      onRedo={() => {
        redo();
        trackEvent("studio", "redo_used", { details: { source: "toolbar" } });
      }}
      onZoomSet={(nextZoom) => {
        trackEvent("studio", "zoom_preset_chosen", { details: { zoom: nextZoom } });
        requestCanvasZoom(nextZoom);
      }}
      onZoomReset={() => {
        trackEvent("studio", "zoom_fit", { details: { source: "view_menu" } });
        requestCanvasFit();
      }}
      onToggleDark={() => {
        trackEvent("studio", "theme_toggled", { details: { to: dark ? "light" : "dark" } });
        toggleTheme();
      }}
      onAddImage={props.handleAddImage}
      onAddAdjustment={props.handleAddAdjustment}
      onLoadBTG={props.handleLoadBTG}
      onStartFresh={props.handleNewProject}
      onResize={props.onResize}
      selectedLayer={props.selectedLayer}
      selectedIds={props.selectedIds}
      onApplyKitColor={props.handleApplyKitColor}
      onApplyKitTextStyle={props.handleApplyKitTextStyle}
      onApplyKitNumber={props.handleApplyKitNumber}
      onVariableColorChange={props.handleVariableColorChange}
    />
  );
};
