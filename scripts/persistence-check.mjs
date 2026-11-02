import { app, BrowserWindow, protocol, net, ipcMain } from "electron";
import { mkdtemp, readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RENDERER_ROOT = join(ROOT, "out/renderer");
const failures = [];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const tempUserData = await mkdtemp(join(tmpdir(), "bg-persist-"));
const workspaceDir = join(tempUserData, "workspace");
const indexPath = join(workspaceDir, "index.json");
const instanceFile = (id) => join(workspaceDir, `${id.replace(/[^a-zA-Z0-9_-]/g, "")}.bitgrain`);

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

async function readIndex() {
  try {
    return JSON.parse(await readFile(indexPath, "utf8"));
  } catch {
    return [];
  }
}
async function writeIndex(records) {
  await mkdir(workspaceDir, { recursive: true });
  await writeFile(indexPath, JSON.stringify(records, null, 2));
}

// Minimal main mirroring src/main/workspace.ts on-disk contract: one
// self-contained `<id>.bitgrain` file per instance plus an index.json of records.
function registerHandlers() {
  ipcMain.handle("auth:bypass", () => true);
  ipcMain.handle("workspace:list", async () =>
    (await readIndex()).sort((a, b) => b.updatedAt - a.updatedAt),
  );
  ipcMain.handle("workspace:write", async (_e, input) => {
    await mkdir(workspaceDir, { recursive: true });
    await writeFile(instanceFile(input.id), input.doc);
    const records = await readIndex();
    const id = input.id.replace(/[^a-zA-Z0-9_-]/g, "");
    const existing = records.find((r) => r.id === id);
    const record = {
      id,
      kind: input.kind,
      title: input.title,
      createdAt: existing?.createdAt ?? Date.now(),
      updatedAt: Date.now(),
      thumbnail: input.thumbnail !== undefined ? input.thumbnail : existing?.thumbnail ?? null,
    };
    await writeIndex([record, ...records.filter((r) => r.id !== id)]);
    return record;
  });
  ipcMain.handle("workspace:read", async (_e, id) => {
    const records = await readIndex();
    const record = records.find((r) => r.id === id.replace(/[^a-zA-Z0-9_-]/g, ""));
    if (!record) return null;
    const doc = await readFile(instanceFile(id), "utf8");
    return { record, doc };
  });
  ipcMain.handle("workspace:delete", async (_e, id) => {
    const records = await readIndex();
    await writeIndex(records.filter((r) => r.id !== id.replace(/[^a-zA-Z0-9_-]/g, "")));
    await rm(instanceFile(id), { force: true });
  });
}

function serveProtocol() {
  protocol.handle("app", (req) => {
    const url = new URL(req.url);
    const p = decodeURIComponent(url.pathname);
    const rel = p === "/" ? "/index.html" : p;
    const resolved = normalize(join(RENDERER_ROOT, rel));
    if (!resolved.startsWith(RENDERER_ROOT)) return new Response("forbidden", { status: 403 });
    return net.fetch(pathToFileURL(resolved).toString());
  });
}

const clickText = (window, text) =>
  window.webContents.executeJavaScript(`(() => {
    const el = [...document.querySelectorAll('button')]
      .find((n) => n.textContent.trim().toLowerCase() === ${JSON.stringify(text.toLowerCase())});
    if (el) { el.click(); return true; } return false;
  })()`);

const clickAttr = (window, selector) =>
  window.webContents.executeJavaScript(
    `(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (el) { el.click(); return true; } return false; })()`,
  );

async function run() {
  registerHandlers();
  serveProtocol();
  const window = new BrowserWindow({
    show: false,
    webPreferences: { preload: join(ROOT, "out/preload/index.mjs"), sandbox: false },
  });
  await window.loadURL("app://bundle/index.html");
  await wait(2800);

  await clickAttr(window, 'header button[aria-label="create document"]');
  await wait(150);
  await clickAttr(window, 'button[aria-label="create darkroom"]');
  await wait(1200);
  // A new darkroom tab must be blank: nothing is auto-restored. Load a sample so
  // there is a document worth saving.
  const empty = await window.webContents.executeJavaScript(
    `document.body.innerText.toLowerCase().includes("drop an image")`,
  );
  if (!empty) failures.push("new darkroom tab was not blank (auto-restored a document)");
  await clickAttr(window, 'button[aria-label^="Try the sample photo"]');
  await wait(2800);

  window.webContents.send("app:menu", "save");
  await wait(2500);

  let savedAt = 0;
  if (!existsSync(indexPath)) {
    failures.push("no workspace index written to disk");
  } else {
    const records = JSON.parse(await readFile(indexPath, "utf8"));
    if (records.length !== 1) failures.push(`expected 1 saved instance, got ${records.length}`);
    const r = records[0];
    if (r && r.kind !== "darkroom") failures.push(`saved kind wrong: ${r.kind}`);
    if (r && !r.thumbnail) failures.push("saved instance has no thumbnail");
    if (r && !existsSync(instanceFile(r.id))) failures.push("no .bitgrain file for saved instance");
    if (r) {
      const doc = await readFile(instanceFile(r.id), "utf8");
      if (!doc.includes('"image":"data:')) {
        failures.push("saved .bitgrain does not embed the asset as a data URL");
      }
    }
    savedAt = r?.updatedAt ?? 0;
    console.log("  on disk:", JSON.stringify({ ...r, thumbnail: r?.thumbnail ? "<data-url>" : null }));
  }

  // Autosave: change the document (toggle colorize), wait past the interval, and
  // confirm the saved instance updated on disk without a manual save.
  await clickText(window, "colorize");
  await wait(6000);
  const afterAuto = JSON.parse(await readFile(indexPath, "utf8"))[0];
  if (!afterAuto || afterAuto.updatedAt <= savedAt) {
    failures.push("autosave did not update the instance after an edit");
  }
  if (afterAuto && !afterAuto.thumbnail) {
    failures.push("autosave dropped the thumbnail");
  }
  console.log("  autosaved:", afterAuto?.updatedAt > savedAt);

  window.webContents.reload();
  await wait(3500);

  const library = await window.webContents.executeJavaScript(`(() => ({
    hasLibrary: document.body.innerText.includes("Library"),
    thumbs: document.querySelectorAll('img[src^="data:"]').length,
  }))()`);
  if (!library.hasLibrary) failures.push("Library not shown after reload");
  if (library.thumbs < 1) failures.push("no saved thumbnail after reload");
  console.log("  after reload:", JSON.stringify(library));

  finish();
}

async function finish() {
  await rm(tempUserData, { recursive: true, force: true }).catch(() => {});
  console.log();
  if (failures.length) {
    console.error("PERSISTENCE CHECK FAILED");
    for (const f of failures) console.error("  " + f);
    app.exit(1);
    return;
  }
  console.log("PERSISTENCE CHECK PASSED, instances survive a reload");
  app.exit(0);
}

void app.whenReady().then(() =>
  run().catch(async (error) => {
    await rm(tempUserData, { recursive: true, force: true }).catch(() => {});
    console.error("PERSISTENCE CHECK CRASHED", error);
    app.exit(1);
  }),
);
