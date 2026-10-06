import { app, BrowserWindow } from "electron";
import { createMainWindow } from "./window";
import { registerIpcHandlers } from "./ipc";
import { configureSession } from "./security";
import { registerAppScheme, serveRendererOverAppScheme } from "./protocol";
import { installApplicationMenu, installContextMenu } from "./menu";
import { IPC_CHANNELS } from "../shared/bridge";

const isMac = process.platform === "darwin";
const isDev = !!process.env["ELECTRON_RENDERER_URL"];

// The app is Bitgrain, not "Electron". Set the name before anything reads it so
// the macOS app menu, About panel, and dock all say Bitgrain (in dev the default
// would otherwise be "Electron"; packaged builds use productName).
app.setName("Bitgrain");
app.setAboutPanelOptions({ applicationName: "Bitgrain" });

// Deep link for the Google OAuth browser handshake: the browser returns to
// bitgrain://auth?… and the OS hands it to this app.
app.setAsDefaultProtocolClient("bitgrain");

if (!app.requestSingleInstanceLock()) {
  app.quit();
}

const AUTH_SCHEME = "bitgrain://";

// Forwards a captured deep link to the renderer's auth flow.
function forwardAuthCallback(url: string | undefined): void {
  if (!url || !url.startsWith(AUTH_SCHEME)) return;
  const [window] = BrowserWindow.getAllWindows();
  if (!window) return;
  if (window.isMinimized()) window.restore();
  window.focus();
  window.webContents.send(IPC_CHANNELS.authCallback, url);
}

// macOS delivers deep links via open-url.
app.on("open-url", (event, url) => {
  event.preventDefault();
  forwardAuthCallback(url);
});

// Windows/Linux deliver the deep link in the argv of the second launch.
app.on("second-instance", (_event, argv) => {
  const [existing] = BrowserWindow.getAllWindows();
  if (existing) {
    if (existing.isMinimized()) existing.restore();
    existing.focus();
  }
  forwardAuthCallback(argv.find((arg) => arg.startsWith(AUTH_SCHEME)));
});

if (!isDev) registerAppScheme();

void app.whenReady().then(() => {
  if (!isDev) serveRendererOverAppScheme();
  configureSession(isDev);
  registerIpcHandlers();
  installApplicationMenu();
  const window = createMainWindow();
  installContextMenu(window);

  // Deep link that launched the app cold (Windows/Linux).
  forwardAuthCallback(process.argv.find((arg) => arg.startsWith(AUTH_SCHEME)));

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      installContextMenu(createMainWindow());
    }
  });
});

app.on("window-all-closed", () => {
  if (!isMac) app.quit();
});
