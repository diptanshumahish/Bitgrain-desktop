import { app, BrowserWindow, protocol, net, ipcMain } from "electron";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// In-memory workspace backend so darkroom autosave has a document store to write
// to during the tab tests (mirrors src/main/workspace.ts).
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

const PROBE = `(() => {
  const pills = [...document.querySelectorAll('[data-app-titlebar] button[title]:not([aria-label])')];
  const active = pills.find((b) => {
    const bg = getComputedStyle(b.parentElement).backgroundColor;
    const m = bg.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return false;
    const parts = m[1].split(',').map((n) => parseFloat(n));
    const alpha = parts[3] === undefined ? 1 : parts[3];
    return alpha > 0.5 && (parts[0] + parts[1] + parts[2]) > 0;
  });
  return {
    tabCount: pills.length,
    titles: pills.map((b) => b.title),
    activeTitle: active ? active.title : null,
    emptyState: document.body.innerText.toLowerCase().includes('drop an image'),
  };
})()`;

async function probe(window) {
  return window.webContents.executeJavaScript(PROBE);
}

async function clickByText(window, selector, text) {
  return window.webContents.executeJavaScript(`(() => {
    const el = [...document.querySelectorAll(${JSON.stringify(selector)})]
      .find((n) => n.textContent.trim().toLowerCase() === ${JSON.stringify(text.toLowerCase())});
    if (el) { el.click(); return true; }
    return false;
  })()`);
}

async function clickAttr(window, selector) {
  return window.webContents.executeJavaScript(
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (el) { el.click(); return true; } return false; })()`,
  );
}

async function createDarkroom(window) {
  await clickAttr(window, '[data-app-titlebar] button[aria-label="create document"]');
  await wait(150);
  await clickAttr(window, 'button[aria-label="create darkroom"]');
  await wait(1500);
}

async function run() {
  serveRenderer();
  registerWorkspace();
  const window = new BrowserWindow({ show: false, webPreferences: { preload: join(ROOT, "out/preload/index.mjs"), sandbox: false } });
  await window.loadURL(APP_ENTRY);
  await wait(3500);

  await clickByText(window, "button", "skip");
  await wait(300);

  // The app opens on the Home dashboard. Open a darkroom tab to test per-document
  // switching, which is what this check is about.
  await createDarkroom(window);

  const start = await probe(window);

  // The first tab may already hold an image from a persisted session. Only load
  // a sample when it is genuinely empty, so the test is robust to either state.
  let afterSample = start;
  if (start.emptyState) {
    const loadedSample = await clickByText(window, "button", "try a sample");
    if (!loadedSample) failures.push("empty tab but no try-a-sample button");
    await wait(2500);
    afterSample = await probe(window);
  }
  if (afterSample.emptyState) failures.push("tab 1 could not get an image");
  const tab1Title = afterSample.activeTitle;
  const startCount = afterSample.tabCount;

  await createDarkroom(window);

  const afterNew = await probe(window);
  if (afterNew.tabCount !== startCount + 1) failures.push(`expected ${startCount + 1} tabs after +, got ${afterNew.tabCount}`);
  if (!afterNew.emptyState) failures.push("new tab is not empty");
  if (afterNew.activeTitle !== "Untitled") failures.push(`new tab should be Untitled, got ${afterNew.activeTitle}`);

  await clickByText(window, "[data-app-titlebar] button[title]", tab1Title ?? "");
  await wait(1500);

  const back = await probe(window);
  if (back.emptyState) failures.push("switching back to tab 1 lost its image");
  if (back.activeTitle !== tab1Title) failures.push(`switching back did not activate tab 1 (${back.activeTitle})`);

  // rename the active tab via double-click, type, Enter
  const renamed = await window.webContents.executeJavaScript(`(() => {
    const btn = [...document.querySelectorAll('[data-app-titlebar] button[title]:not([aria-label])')]
      .find((b) => b.title === ${JSON.stringify(tab1Title)});
    if (!btn) return false;
    btn.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    return true;
  })()`);
  if (!renamed) failures.push("could not start renaming tab 1");
  await wait(300);
  await window.webContents.executeJavaScript(`(() => {
    const input = document.querySelector("[data-app-titlebar] input");
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
    setter.call(input, 'My Photo');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    return true;
  })()`);
  await wait(500);
  const afterRename = await probe(window);
  if (!afterRename.titles.includes("My Photo")) {
    failures.push(`rename did not stick, titles: ${JSON.stringify(afterRename.titles)}`);
  }
  console.log("  rename     :", JSON.stringify(afterRename));

  // drag the last draggable tab onto the first draggable tab and verify reorder
  const beforeOrder = afterRename.titles.filter((t) => t !== "Home");
  await window.webContents.executeJavaScript(`(() => {
    const pills = [...document.querySelectorAll('[data-app-titlebar] div[draggable="true"]')];
    if (pills.length < 2) return false;
    const from = pills[pills.length - 1];
    const to = pills[0];
    const dt = new DataTransfer();
    from.dispatchEvent(new DragEvent('dragstart', { bubbles: true, dataTransfer: dt }));
    to.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer: dt }));
    to.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer: dt }));
    from.dispatchEvent(new DragEvent('dragend', { bubbles: true, dataTransfer: dt }));
    return true;
  })()`);
  await wait(400);
  const afterReorder = await probe(window);
  const newOrder = afterReorder.titles.filter((t) => t !== "Home");
  if (JSON.stringify(newOrder) === JSON.stringify(beforeOrder)) {
    failures.push(`reorder did not change order: ${JSON.stringify(newOrder)}`);
  }
  console.log("  reorder    :", JSON.stringify(afterReorder.titles));

  console.log("  start      :", JSON.stringify(start));
  console.log("  +sample    :", JSON.stringify(afterSample));
  console.log("  +new tab   :", JSON.stringify(afterNew));
  console.log("  switch back:", JSON.stringify(back));

  finish();
}

function finish() {
  console.log();
  if (failures.length) {
    console.error("TABS CHECK FAILED");
    for (const f of failures) console.error("  " + f);
    app.exit(1);
    return;
  }
  console.log("TABS CHECK PASSED, each tab holds its own document");
  app.exit(0);
}

void app.whenReady().then(() =>
  run().catch((error) => {
    console.error("TABS CHECK CRASHED", error);
    app.exit(1);
  }),
);
