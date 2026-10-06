import { app, BrowserWindow, protocol, net } from "electron";
import { join, dirname, normalize } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Asserts what a transition actually puts on screen: which clips, at what
// opacity, reading which moment of their source. This is the part that separates
// a real transition from a pair of fades, and it is invisible to a screenshot.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RENDERER_ROOT = join(ROOT, "out/renderer");
const APP_ENTRY = "app://bundle/video-harness.html";

const failures = [];

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

function serveRenderer() {
  protocol.handle("app", (request) => {
    const url = new URL(request.url);
    const raw = decodeURIComponent(url.pathname);
    const rel = raw === "/" || raw === "" ? "/video-harness.html" : raw;
    const resolved = normalize(join(RENDERER_ROOT, rel));
    if (!resolved.startsWith(RENDERER_ROOT)) return new Response("forbidden", { status: 403 });
    return net.fetch(pathToFileURL(resolved).toString());
  });
}

const near = (a, b, tolerance = 0.02) => Math.abs(a - b) <= tolerance;

function check(condition, message) {
  if (!condition) failures.push(message);
}

function layerFor(frame, clipId) {
  return frame.layers.find((l) => l.clipId === clipId) ?? null;
}

async function run() {
  serveRenderer();
  const window = new BrowserWindow({
    width: 900,
    height: 600,
    show: false,
    webPreferences: { preload: join(ROOT, "out/preload/index.mjs"), sandbox: false },
  });
  await window.loadURL(APP_ENTRY);
  await new Promise((r) => setTimeout(r, 1500));

  const harnessReady = await window.webContents.executeJavaScript(
    `Boolean(window.__bitgrainVideoHarness)`,
  );
  if (!harnessReady) {
    failures.push("video harness did not load");
    return finish();
  }

  const run = (options) =>
    window.webContents.executeJavaScript(
      `window.__bitgrainVideoHarness.scenario(${JSON.stringify(options)})`,
    );

  // ── Cross dissolve ────────────────────────────────────────────────────────
  const dissolve = await run({
    kind: "cross-dissolve",
    transitionDuration: 1,
    headHandle: 1,
    tailHandle: 1,
  });
  const [beforeD, startD, midD, endD, afterD] = dissolve;

  check(beforeD.layers.length === 1, "before the overlap only one clip should be live");
  check(afterD.layers.length === 1, "after the overlap only one clip should be live");
  check(startD.layers.length === 2, "a dissolve must put both clips on screen");
  check(midD.layers.length === 2, "both clips must still be live at the midpoint");

  const midA = layerFor(midD, "clip-a");
  const midB = layerFor(midD, "clip-b");
  check(midA !== null && midB !== null, "both clips must be present at the midpoint");
  if (midA && midB) {
    check(near(midA.alpha, 0.5), `outgoing alpha at the midpoint should be 0.5, got ${midA.alpha}`);
    check(near(midB.alpha, 0.5), `incoming alpha at the midpoint should be 0.5, got ${midB.alpha}`);
  }

  // The whole point of handles. The overlap is centred on the cut, so each clip
  // sits exactly on its own boundary at the midpoint; the borrowed footage shows
  // at the ends. Clip A is trimmed to [1s, 5s] of its source, clip B to [1s, 5s]
  // of its own, so anything outside those spans is handle being used.
  const startB = layerFor(startD, "clip-b");
  const endA = layerFor(endD, "clip-a");
  check(
    startB !== null && startB.sourceTime < 1,
    `at the start of the overlap the incoming clip should read before its in point, got ${startB?.sourceTime}`,
  );
  check(
    endA !== null && endA.sourceTime > 5,
    `at the end of the overlap the outgoing clip should read past its out point, got ${endA?.sourceTime}`,
  );

  const startA = layerFor(startD, "clip-a");
  const endB = layerFor(endD, "clip-b");
  check(startA !== null && near(startA.alpha, 1, 0.05), "the outgoing clip starts the dissolve opaque");
  check(endB !== null && near(endB.alpha, 1, 0.05), "the incoming clip ends the dissolve opaque");

  // ── Dip to black ──────────────────────────────────────────────────────────
  const dipBlack = await run({
    kind: "dip-to-black",
    transitionDuration: 1,
    headHandle: 1,
    tailHandle: 1,
  });
  const midBlack = dipBlack[2];
  // At the midpoint of a dip both clips are gone, which is what makes it a dip
  // rather than a blend.
  check(
    midBlack.layers.every((l) => l.alpha < 0.02),
    `dip to black should have nothing visible at the midpoint, got ${JSON.stringify(midBlack.layers.map((l) => l.alpha))}`,
  );
  check(midBlack.washAlpha === 0, "dip to black must not paint a wash");

  // ── Dip to white ──────────────────────────────────────────────────────────
  const dipWhite = await run({
    kind: "dip-to-white",
    transitionDuration: 1,
    headHandle: 1,
    tailHandle: 1,
  });
  check(
    near(dipWhite[2].washAlpha, 1, 0.02),
    `dip to white should be fully washed at the midpoint, got ${dipWhite[2].washAlpha}`,
  );
  check(
    dipWhite[1].washAlpha < 0.05 && dipWhite[3].washAlpha < 0.05,
    "the white wash should be gone at both ends of the overlap",
  );

  // ── Wipe ──────────────────────────────────────────────────────────────────
  const wipe = await run({
    kind: "wipe-left",
    transitionDuration: 1,
    headHandle: 1,
    tailHandle: 1,
  });
  const midWipe = wipe[2];
  const wipeIncoming = layerFor(midWipe, "clip-b");
  check(
    midWipe.layers.every((l) => near(l.alpha, 1)),
    "a wipe reveals rather than blends, so both sides stay opaque",
  );
  check(
    wipeIncoming !== null && near(wipeIncoming.wipeProgress ?? -1, 0.5),
    `the wipe should be half across at the midpoint, got ${wipeIncoming?.wipeProgress}`,
  );

  // ── Orphan pruning ────────────────────────────────────────────────────────
  const prunes = await window.webContents.executeJavaScript(
    `window.__bitgrainVideoHarness.prunes()`,
  );
  check(prunes.intact === 1, "an intact cut should keep its transition");
  check(prunes.clipDeleted === 0, "deleting a clip must drop its transition");
  check(prunes.cutSeparated === 0, "separating the clips must drop the transition");

  console.log(
    "  dissolve   :",
    `mid alphas ${layerFor(midD, "clip-a")?.alpha.toFixed(2)}/${layerFor(midD, "clip-b")?.alpha.toFixed(2)}`,
    `handle use in=${startB?.sourceTime.toFixed(2)} (<1) out=${endA?.sourceTime.toFixed(2)} (>5)`,
  );
  console.log("  dip black  :", `mid alphas ${midBlack.layers.map((l) => l.alpha.toFixed(2)).join("/") || "none"}`);
  console.log("  dip white  :", `wash ${dipWhite[2].washAlpha.toFixed(2)}`);
  console.log("  wipe       :", `progress ${wipeIncoming?.wipeProgress?.toFixed(2)}`);
  console.log("  prune      :", JSON.stringify(prunes));

  finish();
}

function finish() {
  console.log();
  if (failures.length) {
    console.error("TRANSITION CHECK FAILED");
    for (const f of failures) console.error("  " + f);
    app.exit(1);
    return;
  }
  console.log("TRANSITION CHECK PASSED, transitions blend two live clips off their media handles");
  app.exit(0);
}

void app.whenReady().then(() =>
  run().catch((error) => {
    console.error("TRANSITION CHECK CRASHED", error);
    app.exit(1);
  }),
);
