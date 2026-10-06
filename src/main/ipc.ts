import { app, dialog, ipcMain, shell, BrowserWindow } from "electron";
import { readFile, writeFile } from "node:fs/promises";
import { basename, extname } from "node:path";
import { IPC_CHANNELS } from "../shared/bridge";
import type { AppInfo, MenuContext, OpenedImage, WriteInstanceInput } from "../shared/bridge";
import { performHaptic } from "./haptics";
import { openGoogleAuthWindow } from "./google-auth";
import { updateMenuContext } from "./menu";
import {
  listInstances,
  writeInstance,
  readInstance,
  deleteInstance,
  readInstanceBytes,
} from "./workspace";

const IMAGE_EXTENSIONS = [
  "jpg", "jpeg", "png", "webp", "gif", "bmp", "avif", "svg", "ico",
  "heic", "heif", "tif", "tiff", "dng",
  "cr2", "cr3", "nef", "arw", "raf", "rw2", "orf", "pef", "srw", "dcr",
  "3fr", "fff", "iiq", "mef", "mos", "erf", "x3f",
];

// A generous ceiling for a profile image; anything larger is almost certainly
// not an avatar and is rejected rather than embedded as a giant data URL.
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function featureLineOf(version: string): string {
  const [major, minor] = version.split(".");
  return `${major}.${minor}`;
}

function saveDialogFilters(fileName: string): Electron.FileFilter[] {
  const extension = extname(fileName).replace(".", "").toLowerCase();
  if (!extension) return [{ name: "All files", extensions: ["*"] }];
  return [
    { name: extension.toUpperCase(), extensions: [extension] },
    { name: "All files", extensions: ["*"] },
  ];
}

export function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.appInfo, (): AppInfo => {
    const version = app.getVersion();
    return { version, platform: process.platform, featureLine: featureLineOf(version) };
  });

  ipcMain.handle(
    IPC_CHANNELS.saveFile,
    async (event, fileName: string, bytes: Uint8Array): Promise<string | null> => {
      const window = BrowserWindow.fromWebContents(event.sender);
      const options: Electron.SaveDialogOptions = {
        defaultPath: fileName,
        filters: saveDialogFilters(fileName),
      };
      const result = window
        ? await dialog.showSaveDialog(window, options)
        : await dialog.showSaveDialog(options);
      if (result.canceled || !result.filePath) return null;
      await writeFile(result.filePath, bytes);
      return result.filePath;
    },
  );

  ipcMain.handle(
    IPC_CHANNELS.openImage,
    async (event): Promise<OpenedImage | null> => {
      const window = BrowserWindow.fromWebContents(event.sender);
      const options: Electron.OpenDialogOptions = {
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: IMAGE_EXTENSIONS }],
      };
      const result = window
        ? await dialog.showOpenDialog(window, options)
        : await dialog.showOpenDialog(options);
      const filePath = result.filePaths[0];
      if (result.canceled || !filePath) return null;
      const buffer = await readFile(filePath);
      return {
        filePath,
        fileName: basename(filePath),
        bytes: new Uint8Array(buffer),
      };
    },
  );

  ipcMain.handle(IPC_CHANNELS.showInFolder, (_event, filePath: string): void => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.on(IPC_CHANNELS.haptic, (_event, pattern: number): void => {
    performHaptic(pattern);
  });

  ipcMain.on(IPC_CHANNELS.menuContext, (_event, context: MenuContext): void => {
    if (context && typeof context.surface === "string" && Array.isArray(context.commands)) {
      updateMenuContext(context);
    }
  });

  ipcMain.handle(IPC_CHANNELS.openExternal, (_event, url: string): Promise<void> => {
    // Only allow http(s) and the app's own deep link out to the OS.
    if (/^(https?:|bitgrain:)/i.test(url)) return shell.openExternal(url);
    return Promise.resolve();
  });

  // Avatar proxy. The renderer CSP forbids remote images, so provider avatar CDNs
  // (Google, etc.) can't be loaded there. The main process has no CSP: it fetches
  // the image and hands back a `data:` URL, which the renderer is allowed to
  // render. Fails soft to null so the UI just falls back to the glyph avatar.
  ipcMain.handle(
    IPC_CHANNELS.avatarResolve,
    async (_event, url: string): Promise<string | null> => {
      if (typeof url !== "string" || !/^https:\/\//i.test(url)) return null;
      try {
        const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
        if (!res.ok) return null;
        const contentType = res.headers.get("content-type") ?? "";
        if (!contentType.startsWith("image/")) return null;
        const buffer = Buffer.from(await res.arrayBuffer());
        if (buffer.byteLength === 0 || buffer.byteLength > MAX_AVATAR_BYTES) return null;
        return `data:${contentType};base64,${buffer.toString("base64")}`;
      } catch {
        return null;
      }
    },
  );

  ipcMain.handle(IPC_CHANNELS.googleSignIn, (event): void => {
    openGoogleAuthWindow(BrowserWindow.fromWebContents(event.sender));
  });

  // Never bypass the sign-in gate in production; the test harness overrides this
  // handler with its own mock main that returns true.
  ipcMain.handle(IPC_CHANNELS.authBypass, (): boolean => false);

  ipcMain.handle(IPC_CHANNELS.instanceList, () => listInstances());
  ipcMain.handle(IPC_CHANNELS.instanceWrite, (_event, input: WriteInstanceInput) =>
    writeInstance(input, Date.now()),
  );
  ipcMain.handle(IPC_CHANNELS.instanceRead, (_event, id: string) => readInstance(id));
  ipcMain.handle(IPC_CHANNELS.instanceDelete, (_event, id: string) => deleteInstance(id));

  ipcMain.handle(
    IPC_CHANNELS.instanceExport,
    async (event, id: string, suggestedName: string): Promise<string | null> => {
      const bytes = await readInstanceBytes(id);
      if (!bytes) return null;
      const window = BrowserWindow.fromWebContents(event.sender);
      const options: Electron.SaveDialogOptions = {
        defaultPath: suggestedName.endsWith(".bitgrain")
          ? suggestedName
          : `${suggestedName}.bitgrain`,
        filters: [
          { name: "Bitgrain document", extensions: ["bitgrain"] },
          { name: "All files", extensions: ["*"] },
        ],
      };
      const result = window
        ? await dialog.showSaveDialog(window, options)
        : await dialog.showSaveDialog(options);
      if (result.canceled || !result.filePath) return null;
      await writeFile(result.filePath, bytes);
      return result.filePath;
    },
  );
}
