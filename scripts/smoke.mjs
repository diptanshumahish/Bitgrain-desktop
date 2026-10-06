import { app, BrowserWindow, protocol, net, ipcMain } from "electron";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Minimal in-memory workspace backend so startup's instance-list refresh has a
// handler to answer (mirrors src/main/workspace.ts). Keeps the smoke log clean.
const wsStore = new Map();
function registerWorkspace() {
  ipcMain.handle("auth:bypass", () => true);
  ipcMain.handle("workspace:list", () =>
    [...wsStore.values()].map((v) => v.record).sort((a, b) => b.updatedAt - a.updatedAt),
  );
  ipcMain.handle("workspace:write", (_e, input) => {
    const prev = wsStore.get(input.id);
    const record = {
      id: input.id,
      kind: input.kind,
      title: input.title,
      createdAt: prev?.record.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      thumbnail: input.thumbnail !== undefined ? input.thumbnail : prev?.record.thumbnail ?? null,
    };
    wsStore.set(input.id, { record, doc: input.doc });
    return record;
  });
  ipcMain.handle("workspace:read", (_e, id) => wsStore.get(id) ?? null);
  ipcMain.handle("workspace:delete", (_e, id) => {
    wsStore.delete(id);
  });
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "test/output");
const RENDERER_ROOT = join(ROOT, "out/renderer");
const APP_ENTRY = "app://bundle/index.html";
const SETTLE_MS = 4000;

const errors = [];

// Mirrors src/main/protocol.ts so the smoke test loads over the exact same
// app:// origin production uses, which is what makes absolute asset paths (the
// logo, samples, fonts) resolve.
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true },
  },
]);

function serveRenderer() {
  protocol.handle("app", (request) => {
    const url = new URL(request.url);
    const raw = decodeURIComponent(url.pathname);
    const rel = raw === "/" || raw === "" ? "/index.html" : raw;
    const resolved = normalize(join(RENDERER_ROOT, rel));
    if (!resolved.startsWith(RENDERER_ROOT)) return new Response("forbidden", { status: 403 });
    return net.fetch(pathToFileURL(resolved).toString());
  });
}

function record(kind, message) {
  errors.push(`[${kind}] ${message}`);
}

async function run() {
  const window = new BrowserWindow({
    width: 1440,
    height: 900,
    show: false,
    webPreferences: {
      preload: join(ROOT, "out/preload/index.mjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  window.webContents.on("console-message", (event) => {
    if (event.level === "error") record("console", event.message);
  });
  window.webContents.on("did-fail-load", (_e, code, description) => {
    record("load", `${code} ${description}`);
  });
  window.webContents.on("render-process-gone", (_e, details) => {
    record("crash", details.reason);
  });
  window.webContents.on("preload-error", (_e, path, error) => {
    record("preload", `${path} ${error.message}`);
  });

  await window.loadURL(APP_ENTRY);
  await new Promise((resolve) => setTimeout(resolve, SETTLE_MS));

  const probe = await window.webContents.executeJavaScript(`
    (() => {
      const logo = document.querySelector('img[src="/bitgrainlogo.png"]');
      return {
        rootChildren: document.getElementById("root")?.childElementCount ?? 0,
        hasBridge: typeof window.bitgrain === "object",
        canvasCount: document.querySelectorAll("canvas").length,
        logoFound: !!logo,
        logoLoaded: !!logo && logo.complete && logo.naturalWidth > 0,
        bodyText: document.body.innerText.slice(0, 400),
      };
    })()
  `);

  const image = await window.webContents.capturePage();
  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(join(OUTPUT_DIR, "smoke.png"), image.toPNG());

  console.log("probe:", JSON.stringify(probe, null, 2));
  if (probe.rootChildren === 0) record("render", "React root is empty");
  if (!probe.hasBridge) record("bridge", "window.bitgrain missing");
  if (probe.logoFound && !probe.logoLoaded) record("asset", "logo failed to load over app://");

  if (errors.length) {
    console.error("SMOKE FAILED");
    for (const error of errors) console.error("  " + error);
    app.exit(1);
    return;
  }

  console.log("SMOKE PASSED, screenshot at test/output/smoke.png");
  app.exit(0);
}

void app.whenReady().then(() => {
  serveRenderer();
  registerWorkspace();
  return run().catch((error) => {
    console.error("SMOKE CRASHED", error);
    app.exit(1);
  });
});
