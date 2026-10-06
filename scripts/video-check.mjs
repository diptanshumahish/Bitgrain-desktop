import { app, BrowserWindow, protocol, net, ipcMain } from "electron";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Exercises the video editor's desktop render path end to end: the worker-pool
// preview, the render cache, the tool modes, the status bar and the command
// palette. `surfaces-check` only proves a video tab opens; this proves the
// editor inside it actually works.

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
const consoleErrors = [];

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
const js = (window, source) => window.webContents.executeJavaScript(source);

// Presses a key through the real input path, so the editor's own window-level
// keydown handler runs exactly as it does for a user.
async function press(window, keyCode, modifiers = []) {
  window.webContents.sendInputEvent({ type: "keyDown", keyCode, modifiers });
  window.webContents.sendInputEvent({ type: "char", keyCode, modifiers });
  window.webContents.sendInputEvent({ type: "keyUp", keyCode, modifiers });
  await wait(180);
}

const statusBarText = (window) =>
  js(window, `(() => {
    const rows = [...document.querySelectorAll("div")]
      .filter((n) => n.className && String(n.className).includes("border-t") && n.className.includes("h-6"));
    return rows.length ? rows[rows.length - 1].innerText.replace(/\\n+/g, " | ") : "";
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

  window.webContents.on("console-message", (event) => {
    if (event.level === "error") consoleErrors.push(event.message);
  });

  await window.loadURL(APP_ENTRY);
  await wait(3000);
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Open a video document.
  await js(window, `document.querySelector('[data-app-titlebar] button[aria-label="create document"]')?.click()`);
  await wait(250);
  await js(window, `document.querySelector('button[aria-label="create video"]')?.click()`);
  await wait(3500);

  const editor = await js(window, `(() => ({
    noError: !document.body.innerText.includes("Something went wrong") && !document.body.innerText.includes("Project not found"),
    canvasCount: document.querySelectorAll("canvas").length,
    tools: document.querySelectorAll('[role="radiogroup"][aria-label="Timeline tool"] [role="radio"]').length,
  }))()`);
  if (!editor.noError) failures.push("video editor shows an error");
  if (editor.canvasCount < 1) failures.push("preview canvas is missing");
  if (editor.tools !== 6) failures.push(`expected 6 timeline tools, got ${editor.tools}`);

  // The status bar should be reporting the project format and a live worker pool.
  const status = await statusBarText(window);
  if (!/1920×1080/.test(status)) failures.push(`status bar missing project format: ${status}`);
  if (!/Select/.test(status)) failures.push(`status bar missing active tool: ${status}`);

  // The editor's bottom chrome has to be on screen, not pushed past the fold by
  // the shell's title bar. Text alone does not prove that, so measure it.
  const chrome = await js(window, `(() => {
    const hud = [...document.querySelectorAll("button")].find((b) => b.textContent.trim() === "HUD");
    if (!hud) return { found: false };
    const rect = hud.getBoundingClientRect();
    return { found: true, bottom: Math.round(rect.bottom), viewport: window.innerHeight };
  })()`);
  if (!chrome.found) failures.push("status bar is not in the document");
  if (chrome.found && chrome.bottom > chrome.viewport) {
    failures.push(`status bar sits below the fold (${chrome.bottom} > ${chrome.viewport})`);
  }

  // Tool shortcuts: R selects the ripple tool, V returns to select.
  await press(window, "r");
  const afterR = await statusBarText(window);
  if (!/Ripple/.test(afterR)) failures.push(`R did not select the ripple tool: ${afterR}`);
  await press(window, "v");
  const afterV = await statusBarText(window);
  if (!/Select/.test(afterV)) failures.push(`V did not return to the select tool: ${afterV}`);

  // The preview instrument panel toggles from the backquote key.
  await press(window, "`");
  const hudOn = await js(window, `document.body.innerText.includes("hit rate")`);
  if (!hudOn) failures.push("backquote did not open the perf HUD");
  await press(window, "`");
  const hudOff = await js(window, `!document.body.innerText.includes("hit rate")`);
  if (!hudOff) failures.push("backquote did not close the perf HUD");

  // Command palette opens on the meta chord and finds a command by fuzzy match.
  await press(window, "k", ["cmd", "control"]);
  await wait(300);
  const paletteOpen = await js(window, `!!document.querySelector('input[aria-label="Search commands"]')`);
  if (!paletteOpen) failures.push("command palette did not open");

  await js(window, `(() => {
    const input = document.querySelector('input[aria-label="Search commands"]');
    if (!input) return false;
    const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    setter.call(input, "ripple");
    input.dispatchEvent(new Event("input", { bubbles: true }));
    return true;
  })()`);
  await wait(250);
  const paletteResults = await js(window, `(() => {
    const items = [...document.querySelectorAll('input[aria-label="Search commands"] ~ * button, ul button')];
    return items.map((b) => b.innerText.replace(/\\n+/g, " ")).filter((t) => /ripple/i.test(t)).length;
  })()`);
  if (paletteResults < 1) failures.push("command palette found no ripple commands");

  await press(window, "Escape");
  await wait(200);
  const paletteClosed = await js(window, `!document.querySelector('input[aria-label="Search commands"]')`);
  if (!paletteClosed) failures.push("command palette did not close on escape");

  // Workspaces: ⌥4 is Review, which collapses all three panels down to stubs,
  // and ⌥1 brings them all back.
  const panelCounts = () =>
    js(window, `(() => ({
      mediaBrowser: document.body.innerText.includes("No media yet") || document.body.innerText.includes("Drag files in to import"),
      inspector: document.body.innerText.includes("Nothing selected") || document.body.innerText.includes("Quick keys"),
      stubs: [...document.querySelectorAll('button[aria-label^="Show "]')].map((b) => b.getAttribute("aria-label")),
    }))()`);

  const beforeWorkspace = await panelCounts();
  if (beforeWorkspace.stubs.length !== 0) {
    failures.push(`edit layout should have no collapsed panels, got ${beforeWorkspace.stubs}`);
  }

  await press(window, "4", ["alt"]);
  await wait(300);
  const review = await panelCounts();
  if (review.stubs.length !== 2) {
    failures.push(`review layout should collapse both side panels, got ${JSON.stringify(review.stubs)}`);
  }
  if (review.mediaBrowser) failures.push("media browser still visible in the review layout");
  if (review.inspector) failures.push("inspector still visible in the review layout");

  await press(window, "1", ["alt"]);
  await wait(300);
  const backToEdit = await panelCounts();
  if (backToEdit.stubs.length !== 0) {
    failures.push(`edit layout should restore both panels, got ${JSON.stringify(backToEdit.stubs)}`);
  }
  if (!backToEdit.mediaBrowser) failures.push("media browser did not come back in the edit layout");

  // A single panel toggle works on its own and marks the layout as adjusted.
  await press(window, "[", ["alt"]);
  await wait(250);
  const afterToggle = await panelCounts();
  if (afterToggle.stubs.length !== 1) {
    failures.push(`⌥[ should collapse only the media browser, got ${JSON.stringify(afterToggle.stubs)}`);
  }
  await press(window, "[", ["alt"]);
  await wait(250);

  // The render loop must be running: the preview canvas is sized to the project
  // and painting (a blank project paints black, which is still a painted frame).
  const painted = await js(window, `(() => {
    const canvas = [...document.querySelectorAll("canvas")].find((c) => c.width === 1920 && c.height === 1080);
    if (!canvas) return { found: false };
    const ctx = canvas.getContext("2d");
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return { found: true, alpha: data[3] };
  })()`);
  if (!painted.found) failures.push("no preview canvas at project resolution");
  if (painted.found && painted.alpha !== 255) failures.push("preview canvas was never painted");

  await writeFile(
    join(OUTPUT_DIR, "video-editor.png"),
    (await window.webContents.capturePage()).toPNG(),
  );

  const fatal = consoleErrors.filter(
    (m) => !/DevTools|Autofill|Electron Security Warning/i.test(m),
  );
  if (fatal.length > 0) {
    failures.push(`renderer console errors: ${fatal.slice(0, 3).join(" ~ ")}`);
  }

  console.log("  editor    :", JSON.stringify(editor));
  console.log("  status bar:", status);
  console.log("  tool R→V  :", `${/Ripple/.test(afterR)} → ${/Select/.test(afterV)}`);
  console.log("  palette   :", `open=${paletteOpen} results=${paletteResults}`);

  finish();
}

function finish() {
  console.log();
  if (failures.length) {
    console.error("VIDEO CHECK FAILED");
    for (const f of failures) console.error("  " + f);
    app.exit(1);
    return;
  }
  console.log("VIDEO CHECK PASSED, preview renders and the desktop tooling responds");
  app.exit(0);
}

void app.whenReady().then(() =>
  run().catch((error) => {
    console.error("VIDEO CHECK CRASHED", error);
    app.exit(1);
  }),
);
