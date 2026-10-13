import { app, Menu, shell, BrowserWindow } from "electron";
import type { MenuItemConstructorOptions } from "electron";
import { IPC_CHANNELS } from "../shared/bridge";
import type { MenuContext } from "../shared/bridge";

const isMac = process.platform === "darwin";
const PRICING_URL = "https://bitgrain.app/pricing";
const DOCS_URL = "https://bitgrain.app/docs";
const FEEDBACK_URL = "https://bitgrain.app/feedback";

// The menu is surface-aware. The renderer publishes which surface is active and
// exactly which document commands it has registered; both the application menu
// and the right-click menu offer a surface-scoped item only when the active
// surface can actually run it, so the darkroom never shows studio-only canvas
// commands (and vice-versa). Universal items (New, clipboard, Help, Reveal) are
// always present. Defaults to the library dashboard, which owns no commands.
let currentContext: MenuContext = { surface: "home", commands: [] };

const has = (command: string): boolean => currentContext.commands.includes(command);

function sendMenuAction(action: string): void {
  const [window] = BrowserWindow.getAllWindows();
  window?.webContents.send(IPC_CHANNELS.menu, action);
}

const cmd = (action: string) => (): void => sendMenuAction(action);

const revealLabel = isMac
  ? "Reveal Exports in Finder"
  : "Reveal Exports in Explorer";
const revealExports = (): Promise<string> => shell.openPath(app.getPath("downloads"));

// The document commands that belong to whichever surface is active, in menu
// order. Each is emitted only when the surface has registered its command id, so
// the list is empty on Home and grows as the surface gains capabilities.
function surfaceFileItems(): MenuItemConstructorOptions[] {
  const items: MenuItemConstructorOptions[] = [];

  const docFiles: MenuItemConstructorOptions[] = [];
  if (has("save")) docFiles.push({ label: "Save", accelerator: "CmdOrCtrl+S", click: cmd("cmd:save") });
  if (has("open-btg")) docFiles.push({ label: "Import .btg…", accelerator: "CmdOrCtrl+O", click: cmd("cmd:open-btg") });
  if (has("save-btg")) docFiles.push({ label: "Export .btg…", click: cmd("cmd:save-btg") });
  if (docFiles.length) items.push(...docFiles, { type: "separator" });

  const exportLabel = currentContext.surface === "video" ? "Export Video…" : "Export Image…";
  const exportFiles: MenuItemConstructorOptions[] = [];
  if (has("export")) exportFiles.push({ label: exportLabel, accelerator: "CmdOrCtrl+E", click: cmd("cmd:export") });
  if (has("export-options")) exportFiles.push({ label: "Export Options…", accelerator: "CmdOrCtrl+Shift+E", click: cmd("cmd:export-options") });
  if (exportFiles.length) items.push(...exportFiles, { type: "separator" });

  return items;
}

// Canvas/view commands for the active surface (studio only, today).
function surfaceViewItems(): MenuItemConstructorOptions[] {
  const items: MenuItemConstructorOptions[] = [];
  if (has("fit-canvas")) items.push({ label: "Fit to Screen", accelerator: "Shift+1", click: cmd("cmd:fit-canvas") });
  if (has("resize")) items.push({ label: "Resize Canvas…", click: cmd("cmd:resize") });
  if (has("mockup")) items.push({ label: "Place Artwork on Photo…", click: cmd("cmd:mockup") });
  if (has("plugins")) items.push({ label: "Plugins…", click: cmd("cmd:plugins") });
  if (items.length) items.push({ type: "separator" });
  if (has("present")) {
    items.push({ label: "Present", accelerator: "CmdOrCtrl+Return", click: cmd("cmd:present") });
    items.push({ type: "separator" });
  }
  return items;
}

function appMenuTemplate(): MenuItemConstructorOptions[] {
  const template: MenuItemConstructorOptions[] = [];

  if (isMac) {
    template.push({
      label: "Bitgrain",
      submenu: [
        { role: "about", label: "About Bitgrain" },
        { type: "separator" },
        { label: "Account & Settings…", accelerator: "CmdOrCtrl+,", click: cmd("open-settings") },
        { type: "separator" },
        { role: "hide", label: "Hide Bitgrain" },
        { role: "hideOthers" },
        { role: "unhide" },
        { type: "separator" },
        { role: "quit", label: "Quit Bitgrain" },
      ],
    });
  }

  // File: New + Settings are universal; the document/export block below them
  // reflects only what the active surface actually supports.
  template.push({
    label: "File",
    submenu: [
      { label: "New Darkroom", accelerator: "CmdOrCtrl+N", click: cmd("new-darkroom") },
      { label: "New Studio", accelerator: "CmdOrCtrl+Shift+N", click: cmd("new-studio") },
      { label: "New Video", accelerator: "CmdOrCtrl+Alt+N", click: cmd("new-video") },
      { type: "separator" },
      ...(isMac ? [] : [{ label: "Account & Settings…", click: cmd("open-settings") } as const, { type: "separator" as const }]),
      ...surfaceFileItems(),
      { label: revealLabel, click: revealExports },
      { type: "separator" },
      isMac ? { role: "close" } : { role: "quit" },
    ],
  });

  template.push({
    label: "Edit",
    submenu: [
      { role: "undo" },
      { role: "redo" },
      { type: "separator" },
      { role: "cut" },
      { role: "copy" },
      { role: "paste" },
      { role: "selectAll" },
    ],
  });

  // View: the surface's canvas commands (when any) sit above the always-present
  // full-screen toggle. The generic Chromium page-zoom roles stay removed —
  // they'd zoom the whole UI, which is meaningless for a design canvas.
  template.push({
    label: "View",
    submenu: [
      ...surfaceViewItems(),
      { role: "togglefullscreen" },
    ],
  });

  template.push({
    label: "Window",
    submenu: [{ role: "minimize" }, { role: "zoom" }, ...(isMac ? [{ role: "front" as const }] : [])],
  });

  template.push({
    role: "help",
    submenu: [
      { label: "Release Notes", click: cmd("cmd:release-notes") },
      { label: "Documentation", click: () => void shell.openExternal(DOCS_URL) },
      { label: "Report a Bug", click: () => void shell.openExternal(FEEDBACK_URL) },
      { type: "separator" },
      { label: "Bitgrain Pricing", click: () => void shell.openExternal(PRICING_URL) },
    ],
  });

  return template;
}

export function installApplicationMenu(): void {
  Menu.setApplicationMenu(Menu.buildFromTemplate(appMenuTemplate()));
}

// Called whenever the renderer's active surface (or its registered commands)
// change. Restamps the application menu so its items track the active surface;
// the right-click menu reads the same state lazily when it pops.
export function updateMenuContext(context: MenuContext): void {
  currentContext = context;
  installApplicationMenu();
}

// Native right-click menu. Like a native app, there is no menu on empty chrome
// or canvas (surfaces draw their own in-app menus, e.g. studio layers); only text
// fields and selected text get the standard clipboard menu.
export function installContextMenu(window: BrowserWindow): void {
  window.webContents.on("context-menu", (_event, params) => {
    const { editFlags } = params;
    const items: MenuItemConstructorOptions[] = [];
    if (params.isEditable) {
      items.push({ role: "cut", enabled: editFlags.canCut });
      items.push({ role: "copy", enabled: editFlags.canCopy });
      items.push({ role: "paste", enabled: editFlags.canPaste });
      items.push({ type: "separator" });
      items.push({ role: "selectAll", enabled: editFlags.canSelectAll });
    } else if (params.selectionText.trim() && editFlags.canCopy) {
      items.push({ role: "copy" });
    }
    if (items.length) Menu.buildFromTemplate(items).popup({ window });
  });
}
