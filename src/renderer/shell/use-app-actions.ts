import { useEffect } from "react";
import { saveActiveDarkroom, refreshProjects, startAutosave } from "../store/projects-store";
import { openTab, documentTabsSignal, activeTabIdSignal } from "../store/document-tabs-store";
import {
  runSurfaceCommand,
  surfaceCommandsSignal,
  type SurfaceCommand,
} from "../store/surface-commands-store";
import { openSettings } from "../store/account-store";
import type { MenuSurface } from "../../shared/bridge";

// Computes the active surface's menu context — its kind plus the exact document
// commands it has registered — and hands it to the native menu so the OS menu
// bar and right-click menu only offer commands that apply to the active surface.
// The active surface re-registers its command map often (e.g. studio on every
// layer edit), but the command *keys* rarely change, so a signature guard skips
// the IPC + native-menu restamp unless the offered commands actually differ.
let lastSignature = "";

function publishMenuContext(): void {
  const tabs = documentTabsSignal.value;
  const activeId = activeTabIdSignal.value;
  const surface: MenuSurface = (tabs.find((tab) => tab.id === activeId)?.kind ?? "home") as MenuSurface;
  const commands = Object.keys(surfaceCommandsSignal.value[activeId] ?? {}).sort();
  const signature = `${surface}|${commands.join(",")}`;
  if (signature === lastSignature) return;
  lastSignature = signature;
  window.bitgrain?.setMenuContext({ surface, commands });
}

// Bridges native menu actions and app startup to the renderer stores. Loads the
// saved project library once, then routes menu accelerators (Save, New) to the
// right store action. Also keeps the native menu scoped to the active surface.
export function useAppActions(): void {
  useEffect(() => {
    void refreshProjects();
    startAutosave();

    // Keep the native menu in sync with the active surface and its capabilities.
    publishMenuContext();
    const unsubTabs = documentTabsSignal.subscribe(publishMenuContext);
    const unsubActive = activeTabIdSignal.subscribe(publishMenuContext);
    const unsubCommands = surfaceCommandsSignal.subscribe(publishMenuContext);

    const bridge = window.bitgrain;
    const unsubMenu = bridge?.onMenu?.((action) => {
      // Save is surface-routed: the active surface runs its own save handler
      // (studio manual save, darkroom library save); darkroom is the fallback so
      // a Cmd+S with nothing registered still persists the current image.
      if (action === "save" || action === "cmd:save") {
        const activeId = activeTabIdSignal.value;
        const handler = surfaceCommandsSignal.value[activeId]?.save;
        if (handler) handler();
        else void saveActiveDarkroom();
      } else if (action === "new-darkroom") openTab("darkroom");
      else if (action === "new-studio") openTab("studio");
      else if (action === "new-video") openTab("video");
      else if (action === "open-settings") openSettings();
      // Surface-scoped commands (Import/Export .btg, Export image, …) are routed
      // to whichever document is active; they no-op on surfaces that don't
      // register them.
      else if (action.startsWith("cmd:")) {
        runSurfaceCommand(action.slice(4) as SurfaceCommand);
      }
    });

    return () => {
      unsubTabs();
      unsubActive();
      unsubCommands();
      unsubMenu?.();
    };
  }, []);
}
