import { BrowserWindow } from "electron";
import { API_ORIGIN } from "./security";
import { IPC_CHANNELS } from "../shared/bridge";

const WEB_ORIGIN = "https://bitgrain.app";

// Runs the Google OAuth flow inside an app-owned window that shares the default
// Electron session. Google → the backend callback (which sets the session cookie
// in that shared jar) → a redirect back to the web origin. We detect that final
// redirect, close the window, and tell the renderer to re-validate — at which
// point `/auth/me` sees the cookie. This is what lets the browser hand the
// session back to the app without any backend deep-link support.
export function openGoogleAuthWindow(parent: BrowserWindow | null): void {
  const authWindow = new BrowserWindow({
    width: 480,
    height: 720,
    parent: parent ?? undefined,
    modal: false,
    show: true,
    autoHideMenuBar: true,
    title: "Sign in with Google",
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Share the default session so the session cookie lands in the app's jar.
      sandbox: true,
    },
  });

  let settled = false;
  const finish = (): void => {
    if (settled) return;
    settled = true;
    parent?.webContents.send(IPC_CHANNELS.authCallback, "bitgrain://auth?done=1");
    if (!authWindow.isDestroyed()) authWindow.close();
  };

  // Auth is complete once the flow lands back on the web origin (or our deep
  // link): the callback response that triggers that redirect already set the
  // session cookie in the shared session.
  const inspect = (url: string): void => {
    if (url.startsWith(WEB_ORIGIN) || url.startsWith("bitgrain://")) finish();
  };
  authWindow.webContents.on("will-redirect", (_event, url) => inspect(url));
  authWindow.webContents.on("will-navigate", (_event, url) => inspect(url));
  authWindow.webContents.on("did-navigate", (_event, url) => inspect(url));

  void authWindow.loadURL(`${API_ORIGIN}/auth/google`);
}
