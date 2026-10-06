import { contextBridge, ipcRenderer } from "electron";
import { IPC_CHANNELS, HAPTIC_CODES } from "../shared/bridge";
import type {
  AppInfo,
  BitgrainBridge,
  HapticPattern,
  OpenedImage,
  InstanceRecord,
  WriteInstanceInput,
  LoadedInstance,
  MenuContext,
} from "../shared/bridge";

const bridge: BitgrainBridge = {
  platform: process.platform,
  appInfo: (): Promise<AppInfo> => ipcRenderer.invoke(IPC_CHANNELS.appInfo),
  saveFile: (fileName: string, bytes: Uint8Array): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.saveFile, fileName, bytes),
  openImage: (): Promise<OpenedImage | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.openImage),
  showInFolder: (filePath: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.showInFolder, filePath),
  haptic: (pattern: HapticPattern): void =>
    ipcRenderer.send(IPC_CHANNELS.haptic, HAPTIC_CODES[pattern]),
  listInstances: (): Promise<InstanceRecord[]> =>
    ipcRenderer.invoke(IPC_CHANNELS.instanceList),
  readInstance: (id: string): Promise<LoadedInstance | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.instanceRead, id),
  writeInstance: (input: WriteInstanceInput): Promise<InstanceRecord> =>
    ipcRenderer.invoke(IPC_CHANNELS.instanceWrite, input),
  deleteInstance: (id: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.instanceDelete, id),
  exportInstance: (id: string, suggestedName: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.instanceExport, id, suggestedName),
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.openExternal, url),
  resolveAvatar: (url: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.avatarResolve, url),
  setMenuContext: (context: MenuContext): void =>
    ipcRenderer.send(IPC_CHANNELS.menuContext, context),
  startGoogleSignIn: (): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.googleSignIn),
  authBypass: (): Promise<boolean> => ipcRenderer.invoke(IPC_CHANNELS.authBypass),
  onAuthCallback: (handler: (url: string) => void): (() => void) => {
    const listener = (_event: unknown, url: string): void => handler(url);
    ipcRenderer.on(IPC_CHANNELS.authCallback, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.authCallback, listener);
  },
  onMenu: (handler: (action: string) => void): (() => void) => {
    const listener = (_event: unknown, action: string): void => handler(action);
    ipcRenderer.on(IPC_CHANNELS.menu, listener);
    return () => ipcRenderer.removeListener(IPC_CHANNELS.menu, listener);
  },
};

contextBridge.exposeInMainWorld("bitgrain", bridge);
