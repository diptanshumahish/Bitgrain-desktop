import { app, BrowserWindow, protocol, net, ipcMain } from "electron";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// In-memory workspace backend mirroring src/main/workspace.ts, so the surfaces
// (especially video, which loads its project by instance id) have a functioning
// document store without touching disk.
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
const RENDERER_ROOT = join(ROOT, "out/renderer");
const OUTPUT_DIR = join(ROOT, "test/output");
const APP_ENTRY = "app://bundle/index.html";

const failures = [];

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
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

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const clickText = (window, selector, text) =>
  window.webContents.executeJavaScript(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
      .find((n) => n.textContent.trim().toLowerCase().includes(${JSON.stringify(text.toLowerCase())}));
    if (el) { el.click(); return true; }
    return false;
  })()`);

const tabInfo = (window) =>
  window.webContents.executeJavaScript(`(() => {
    const pills = [...document.querySelectorAll('[data-app-titlebar] button[title]:not([aria-label])')];
    return { tabTitles: pills.map((b) => b.textContent.trim()), tabCount: pills.length };
  })()`);

async function run() {
  serveRenderer();
  registerWorkspace();
  const window = new BrowserWindow({
    width: 1600,
    height: 1000,
    show: false,
    webPreferences: { preload: join(ROOT, "out/preload/index.mjs"), sandbox: false },
  });
  await window.loadURL(APP_ENTRY);
  await wait(3000);
  await mkdir(OUTPUT_DIR, { recursive: true });

  const atHome = await window.webContents.executeJavaScript(
    `document.body.innerText.includes("What are we making?")`,
  );
  if (!atHome) failures.push("did not land on the home dashboard");

  // open Studio from the dashboard's "Blank design" quick action
  const openedStudio = await clickText(window, "a", "Blank design");
  if (!openedStudio) failures.push("could not click the Studio tool card");
  await wait(3500);

  const studioRendered = await window.webContents.executeJavaScript(`(() => {
    const canvases = document.querySelectorAll("canvas").length;
    const noError = !document.body.innerText.includes("Something went wrong");
    return { canvases, noError, text: document.body.innerText.slice(0, 60) };
  })()`);
  if (!studioRendered.noError) failures.push("studio surface shows an error boundary");

  await writeFile(
    join(OUTPUT_DIR, "studio.png"),
    (await window.webContents.capturePage()).toPNG(),
  );

  const afterStudio = await tabInfo(window);
  if (afterStudio.tabCount !== 2) failures.push(`expected Home + Studio tabs, got ${afterStudio.tabCount}`);

  // add a darkroom tab via the + create menu
  await window.webContents.executeJavaScript(
    `document.querySelector('[data-app-titlebar] button[aria-label="create document"]')?.click()`,
  );
  await wait(200);
  await window.webContents.executeJavaScript(
    `document.querySelector('button[aria-label="create darkroom"]')?.click()`,
  );
  await wait(2000);

  const afterDark = await tabInfo(window);
  if (afterDark.tabCount !== 3) failures.push(`expected Home + Studio + Darkroom, got ${afterDark.tabCount}`);

  const darkroomRendered = await window.webContents.executeJavaScript(
    `document.body.innerText.toLowerCase().includes("drop an image") || document.querySelectorAll("canvas").length > 0`,
  );
  if (!darkroomRendered) failures.push("darkroom tab did not render the editor");

  // add a video tab via the + create menu and confirm the editor renders
  await window.webContents.executeJavaScript(
    `document.querySelector('[data-app-titlebar] button[aria-label="create document"]')?.click()`,
  );
  await wait(200);
  await window.webContents.executeJavaScript(
    `document.querySelector('button[aria-label="create video"]')?.click()`,
  );
  await wait(3500);

  const videoRendered = await window.webContents.executeJavaScript(`(() => ({
    noError: !document.body.innerText.includes("Something went wrong") && !document.body.innerText.includes("Project not found"),
    hasEditor: document.body.innerText.includes("Untitled video") && document.body.innerText.includes("Export"),
  }))()`);
  if (!videoRendered.noError) failures.push("video surface shows an error");
  if (!videoRendered.hasEditor) failures.push("video editor did not render");

  const afterVideo = await tabInfo(window);
  if (afterVideo.tabCount !== 4) failures.push(`expected 4 tabs with video, got ${afterVideo.tabCount}`);

  console.log("  after studio:", JSON.stringify(afterStudio));
  console.log("  after +dark :", JSON.stringify(afterDark));
  console.log("  after +video:", JSON.stringify(afterVideo));
  console.log("  studio canvases:", studioRendered.canvases);

  finish();
}

function finish() {
  console.log();
  if (failures.length) {
    console.error("SURFACES CHECK FAILED");
    for (const f of failures) console.error("  " + f);
    app.exit(1);
    return;
  }
  console.log("SURFACES CHECK PASSED, home + darkroom + studio + video tabs coexist");
  app.exit(0);
}

void app.whenReady().then(() =>
  run().catch((error) => {
    console.error("SURFACES CHECK CRASHED", error);
    app.exit(1);
  }),
);
