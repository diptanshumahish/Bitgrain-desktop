import { signal } from "../lib/signal";
import { activeTabIdSignal } from "./document-tabs-store";

// Commands the native OS menu (and context menu) can invoke on the active
// surface. The in-window File/Edit/View menus are gone — they duplicated the
// native menu bar — so each surface instead registers the handlers for the
// menu items that apply to it, keyed by its tab id. `runSurfaceCommand` routes a
// menu action to whichever surface is currently active.
export type SurfaceCommand =
  | "save"
  | "export"
  | "export-options"
  | "open-btg"
  | "save-btg"
  | "new-project"
  | "fit-canvas"
  | "mockup"
  | "resize"
  | "present"
  | "plugins"
  | "release-notes";

type CommandMap = Partial<Record<SurfaceCommand, () => void>>;

export const surfaceCommandsSignal = signal<Record<string, CommandMap>>({});

export const registerSurfaceCommands = (tabId: string, commands: CommandMap): void => {
  surfaceCommandsSignal.value = { ...surfaceCommandsSignal.value, [tabId]: commands };
};

export const clearSurfaceCommands = (tabId: string): void => {
  if (!(tabId in surfaceCommandsSignal.value)) return;
  const next = { ...surfaceCommandsSignal.value };
  delete next[tabId];
  surfaceCommandsSignal.value = next;
};

export const runSurfaceCommand = (command: SurfaceCommand): void => {
  const activeId = activeTabIdSignal.value;
  surfaceCommandsSignal.value[activeId]?.[command]?.();
};
