import { app, BrowserWindow, shell, nativeTheme } from "electron";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { APP_ENTRY } from "./protocol";

const DEFAULT_WIDTH = 1440;
const DEFAULT_HEIGHT = 900;
const MIN_WIDTH = 1024;
const MIN_HEIGHT = 700;
const CANVAS_BACKGROUND = "#0B0B11";
const TITLE_BAR_HEIGHT = 40;
const TRAFFIC_LIGHT_INSET = { x: 16, y: 13 };
const OVERLAY_SYMBOL_COLOR = "#e4e4e7";

const isMac = process.platform === "darwin";

// The Bitgrain mark, resolved from the packaged renderer bundle or, in dev, from
// the source public dir. Used for the Windows/Linux window icon; macOS ignores
// the window icon and uses the bundle icon instead. Returns undefined if neither
// path exists so the app still launches.
function resolveIconPath(): string | undefined {
  const candidates = [
    join(import.meta.dirname, "../renderer/bitgrainlogo.png"),
    join(process.cwd(), "src/renderer/public/bitgrainlogo.png"),
  ];
  return candidates.find((candidate) => existsSync(candidate));
}

function titleBarConfig(): Partial<Electron.BrowserWindowConstructorOptions> {
  if (isMac) {
    return {
      titleBarStyle: "hiddenInset",
      trafficLightPosition: TRAFFIC_LIGHT_INSET,
    };
  }
  return {
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: CANVAS_BACKGROUND,
      symbolColor: OVERLAY_SYMBOL_COLOR,
      height: TITLE_BAR_HEIGHT,
    },
  };
}

export function createMainWindow(): BrowserWindow {
  nativeTheme.themeSource = "dark";

  const iconPath = resolveIconPath();
  // macOS: a packaged build already shows the bundle icon (the rounded
  // `icon.icns`). We must NOT override it at runtime — doing so replaced the
  // proper app icon with the flat logo the moment the window opened. Only set a
  // dock icon in dev (unpackaged), where there is no bundle icon, and prefer the
  // rounded source art so even the dev dock icon looks right.
  if (isMac && !app.isPackaged && app.dock) {
    const devDockIcon = [
      join(process.cwd(), "build/icon.png"),
      join(process.cwd(), "src/renderer/public/bitgrainlogo.png"),
    ].find((candidate) => existsSync(candidate));
    if (devDockIcon) app.dock.setIcon(devDockIcon);
  }

  const window = new BrowserWindow({
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    show: false,
    backgroundColor: CANVAS_BACKGROUND,
    // Windows/Linux keep the native menu bar visible (File/Edit/View live there,
    // not in-window). macOS ignores this — its menu is the system menu bar.
    autoHideMenuBar: false,
    ...(iconPath ? { icon: iconPath } : {}),
    ...titleBarConfig(),
    webPreferences: {
      preload: join(import.meta.dirname, "../preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      // In dev the renderer is served from the vite localhost origin, which the
      // prod backend's CORS won't allow; drop web security so dev can still hit
      // the API. Production keeps it on and relies on the session CORS shim.
      webSecurity: !process.env["ELECTRON_RENDERER_URL"],
    },
  });

  window.once("ready-to-show", () => window.show());

  window.webContents.setWindowOpenHandler(({ url }) => {
    void shell.openExternal(url);
    return { action: "deny" };
  });

  const devServerUrl = process.env["ELECTRON_RENDERER_URL"];
  if (devServerUrl) {
    void window.loadURL(devServerUrl);
  } else {
    void window.loadURL(APP_ENTRY);
  }

  return window;
}
