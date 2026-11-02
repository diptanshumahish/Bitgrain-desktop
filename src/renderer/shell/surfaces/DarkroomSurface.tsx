import { useEffect } from "react";
import { Home } from "@bitgrain/darkroom/editor/Home";
import { imageSignal } from "@bitgrain/darkroom/state/image-store";
import { emitExportDialog } from "@bitgrain/darkroom/toolbar/export-dialog/export-dialog-events";
import { useSignalValue } from "@bitgrain/core/signal";
import { activeTabIdSignal } from "../../store/document-tabs-store";
import { registerSurfaceCommands, clearSurfaceCommands } from "../../store/surface-commands-store";
import { saveActiveDarkroom } from "../../store/projects-store";

// The darkroom tab: web's redesigned image editor (top bar, inspector, export
// dialog) inside the desktop window. The surface only adds the native-menu
// commands. It renders inside an <Activity> boundary (SurfaceRouter), so these
// effects run only while the darkroom is the visible tab.
export function DarkroomSurface() {
  const tabId = useSignalValue(activeTabIdSignal);
  const hasImage = useSignalValue(imageSignal) !== null;

  useEffect(() => {
    registerSurfaceCommands(tabId, {
      save: () => void saveActiveDarkroom(),
      ...(hasImage ? { export: emitExportDialog, "export-options": emitExportDialog } : {}),
    });
    return () => clearSurfaceCommands(tabId);
  }, [tabId, hasImage]);

  return <Home />;
}
