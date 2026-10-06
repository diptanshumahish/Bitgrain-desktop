import { app, BrowserWindow, session } from "electron";
import { mkdir, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUTPUT_DIR = join(ROOT, "test/output");
const SOURCE_IMAGE_URL = "./sample.jpg";

const EFFECTS = [
  { label: "halftone-mono", kind: "halftone", params: { halftoneCell: 6, halftoneStyle: "mono", halftoneAngle: 45 } },
  { label: "halftone-cmyk", kind: "halftone", params: { halftoneCell: 6, halftoneStyle: "cmyk", halftoneAngle: 15 } },
  { label: "dither-floyd", kind: "dither", params: { ditherMethod: "floyd-steinberg", ditherFactor: 1 } },
  { label: "dither-atkinson", kind: "dither", params: { ditherMethod: "atkinson", ditherFactor: 1 } },
  { label: "ascii", kind: "ascii", params: {} },
  { label: "grayscale", kind: "grayscale", params: {} },
];

const failures = [];

function blockNetwork() {
  session.defaultSession.webRequest.onBeforeRequest((details, callback) => {
    const isLocal = /^(file:|data:|blob:|devtools:)/.test(details.url);
    if (!isLocal) {
      failures.push(`network request attempted: ${details.url}`);
      callback({ cancel: true });
      return;
    }
    callback({});
  });
}

async function renderOne(window, effect) {
  return window.webContents.executeJavaScript(`
    (async () => {
      const out = await window.__bitgrainHarness.render({
        imageUrl: ${JSON.stringify(SOURCE_IMAGE_URL)},
        effect: ${JSON.stringify({ kind: effect.kind, params: effect.params })},
        lossless: true,
      });
      return {
        width: out.width,
        height: out.height,
        checksum: out.checksum,
        png: Array.from(out.pngBytes),
      };
    })()
  `);
}

async function run() {
  blockNetwork();

  const window = new BrowserWindow({ show: false, webPreferences: { sandbox: false } });
  window.webContents.on("console-message", (event) => {
    if (event.level === "error") failures.push(`console: ${event.message}`);
  });

  await window.loadFile(join(ROOT, "out/renderer/harness.html"));

  const ready = await window.webContents.executeJavaScript(
    `typeof window.__bitgrainHarness === "object"`,
  );
  if (!ready) {
    failures.push("harness did not load");
    return finish();
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const manifest = {};

  for (const effect of EFFECTS) {
    const result = await renderOne(window, effect);
    const pngBytes = Buffer.from(result.png);

    if (!(pngBytes[0] === 0x89 && pngBytes[1] === 0x50)) {
      failures.push(`${effect.label}: output is not a PNG`);
    }
    if (pngBytes.length < 1000) {
      failures.push(`${effect.label}: output suspiciously small (${pngBytes.length} bytes)`);
    }

    await writeFile(join(OUTPUT_DIR, `${effect.label}.png`), pngBytes);
    manifest[effect.label] = {
      checksum: result.checksum,
      bytes: pngBytes.length,
      width: result.width,
      height: result.height,
    };
    console.log(
      `  ${effect.label.padEnd(18)} ${result.width}x${result.height}` +
        `  ${String(pngBytes.length).padStart(9)} bytes  checksum ${result.checksum}`,
    );
  }

  const repeat = await renderOne(window, EFFECTS[0]);
  if (repeat.checksum !== manifest[EFFECTS[0].label].checksum) {
    failures.push(
      `determinism: repeat render ${repeat.checksum} != ${manifest[EFFECTS[0].label].checksum}`,
    );
  } else {
    console.log(`  determinism: repeat render of ${EFFECTS[0].label} matched exactly`);
  }

  await writeFile(join(OUTPUT_DIR, "checksums.json"), JSON.stringify(manifest, null, 2));
  finish();
}

function finish() {
  if (failures.length) {
    console.error("RENDER CHECK FAILED");
    for (const failure of failures) console.error("  " + failure);
    app.exit(1);
    return;
  }
  console.log("RENDER CHECK PASSED, outputs in test/output/");
  app.exit(0);
}

void app.whenReady().then(() =>
  run().catch((error) => {
    console.error("RENDER CHECK CRASHED", error);
    app.exit(1);
  }),
);
