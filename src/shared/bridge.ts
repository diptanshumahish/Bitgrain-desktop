export type DesktopPlatform = "darwin" | "win32" | "linux";

export interface AppInfo {
  version: string;
  platform: string;
  featureLine: string;
}

export interface OpenedImage {
  filePath: string;
  fileName: string;
  bytes: Uint8Array;
}

export type HapticPattern = "generic" | "alignment" | "level";

// The three document kinds. Every open document is one instance of one kind,
// stored as a single self-contained `.bitgrain` file in the workspace folder.
export type InstanceKind = "darkroom" | "studio" | "video";

// The lightweight record kept in the workspace index. `thumbnail` is a small
// data-URL preview embedded directly so the Home library renders offline with no
// second round-trip. The full document lives in `<id>.bitgrain`.
export interface InstanceRecord {
  id: string;
  kind: InstanceKind;
  title: string;
  createdAt: number;
  updatedAt: number;
  thumbnail: string | null;
}

export interface WriteInstanceInput {
  id: string;
  kind: InstanceKind;
  title: string;
  // The serialized document, a JSON string. Assets are embedded as data URLs so
  // the file is portable and reopens identically with the network unplugged.
  doc: string;
  thumbnail?: string | null;
}

export interface LoadedInstance {
  record: InstanceRecord;
  doc: string;
}

export interface BitgrainBridge {
  platform: string;
  appInfo(): Promise<AppInfo>;
  saveFile(fileName: string, bytes: Uint8Array): Promise<string | null>;
  openImage(): Promise<OpenedImage | null>;
  showInFolder(filePath: string): Promise<void>;
  haptic(pattern: HapticPattern): void;
  listInstances(): Promise<InstanceRecord[]>;
  readInstance(id: string): Promise<LoadedInstance | null>;
  writeInstance(input: WriteInstanceInput): Promise<InstanceRecord>;
  deleteInstance(id: string): Promise<void>;
  exportInstance(id: string, suggestedName: string): Promise<string | null>;
  openExternal(url: string): Promise<void>;
  // Fetches a remote avatar (e.g. the provider's CDN) in the main process, which
  // is not bound by the renderer CSP, and returns it as a `data:` URL the
  // renderer can render directly. Returns null on any failure. Bundling isn't an
  // option for user-specific images, and the renderer must never load remote
  // images itself, so this is the sanctioned path.
  resolveAvatar(url: string): Promise<string | null>;
  // Publishes the active surface's menu context so the native application menu
  // and right-click menu only offer commands that apply to it.
  setMenuContext(context: MenuContext): void;
  // Opens the Google OAuth flow in an app-owned window that shares the session,
  // so the sign-in cookie is captured by the app (resolves on completion).
  startGoogleSignIn(): Promise<void>;
  // True only in the automated test harness, so the sign-in gate can be skipped;
  // always false in production.
  authBypass(): Promise<boolean>;
  // Fires when the app is opened via its `bitgrain://` deep link (e.g. the Google
  // OAuth browser handshake returns), carrying the callback URL.
  onAuthCallback(handler: (url: string) => void): () => void;
  onMenu(handler: (action: string) => void): () => void;
}

export type MenuAction =
  | "save"
  | "open-image"
  | "new-darkroom"
  | "new-studio"
  | "new-video";

// The four surface kinds the native menu can be scoped to. "home" is the library
// dashboard, which owns no document commands.
export type MenuSurface = "home" | InstanceKind;

// What the active surface can do right now. `surface` selects the base set of
// applicable menu items; `commands` is the exact list of surface-scoped command
// ids the active document has registered, so the menu never offers a command the
// surface can't actually run.
export interface MenuContext {
  surface: MenuSurface;
  commands: string[];
}

export const HAPTIC_CODES: Record<HapticPattern, number> = {
  generic: 0,
  alignment: 1,
  level: 2,
};

export const IPC_CHANNELS = {
  appInfo: "app:info",
  saveFile: "file:save",
  openImage: "file:open-image",
  showInFolder: "file:show-in-folder",
  haptic: "ui:haptic",
  instanceList: "workspace:list",
  instanceRead: "workspace:read",
  instanceWrite: "workspace:write",
  instanceDelete: "workspace:delete",
  instanceExport: "workspace:export",
  openExternal: "app:open-external",
  googleSignIn: "auth:google-start",
  authBypass: "auth:bypass",
  authCallback: "auth:callback",
  menu: "app:menu",
  avatarResolve: "app:resolve-avatar",
  menuContext: "app:menu-context",
} as const;
