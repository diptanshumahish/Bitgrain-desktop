import { app, BrowserWindow } from "electron";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const IMAGE_URL = "./sample.jpg";
const TILE_TO = 4000;

// Every case here is a band-splittable chain. The check asserts the banded
// output is byte-identical to the single-pass engine, then reports the speedup
// from spreading the same work across the worker pool.
const CASES = [
  { label: "grayscale", modes: ["grayscale"] },
  { label: "invert", modes: ["invert"] },
  { label: "posterize", modes: ["posterize"], spec: { posterizeLevels: 6 } },
  { label: "duotone", modes: ["duotone"] },
  { label: "colorwash", modes: ["colorwash"] },
  { label: "grayscale+posterize", modes: ["grayscale", "posterize"] },
];

const failures = [];

async function run() {
  const window = new BrowserWindow({ show: false, webPreferences: { sandbox: false } });
  window.webContents.on("console-message", (event) => {
    if (event.level === "error") failures.push(`console: ${event.message}`);
  });

  await window.loadFile(join(ROOT, "out/renderer/harness.html"));
  const ready = await window.webContents.executeJavaScript(
    `typeof window.__bitgrainHarness?.benchmarkBands === "function"`,
  );
  if (!ready) {
    failures.push("band harness did not load");
    return finish();
  }

  console.log(`  source ${IMAGE_URL} tiled to ~${TILE_TO}px, band-parallel vs single-pass\n`);
  console.log(
    "  effect               dims        serial   pooled   speedup  identical",
  );
  console.log("  " + "-".repeat(66));

  for (const testCase of CASES) {
    const result = await window.webContents.executeJavaScript(`
      window.__bitgrainHarness.benchmarkBands(${JSON.stringify({
        imageUrl: IMAGE_URL,
        modes: testCase.modes,
        spec: testCase.spec,
        tileTo: TILE_TO,
      })})
    `);

    const identical = result.bandIdentical && result.pooledIdentical;
    const speedup = result.serialMs / result.pooledMs;
    const dims = `${result.width}x${result.height}`;

    if (!identical) {
      failures.push(
        `${testCase.label}: banded output diverged ` +
          `(serial ${result.serialChecksum}, inProcess ${result.inProcessChecksum}, pooled ${result.pooledChecksum})`,
      );
    }

    console.log(
      "  " +
        testCase.label.padEnd(20) +
        dims.padEnd(12) +
        `${result.serialMs.toFixed(0).padStart(5)}ms` +
        `${result.pooledMs.toFixed(0).padStart(8)}ms` +
        `${speedup.toFixed(2).padStart(8)}x` +
        `   ${identical ? "yes" : "NO"}`,
    );
  }

  const scaling = await window.webContents.executeJavaScript(
    `window.__bitgrainHarness.scalingParity(${JSON.stringify(IMAGE_URL)}, 1600, 1600)`,
  );
  console.log();
  if (scaling.identical) {
    console.log("  scaling parity: OffscreenCanvas downscale is deterministic (export == worker)");
  } else {
    failures.push(
      `scaling parity: ${scaling.firstChecksum} != ${scaling.secondChecksum}`,
    );
  }

  finish();
}

function finish() {
  console.log();
  if (failures.length) {
    console.error("PARALLEL CHECK FAILED");
    for (const failure of failures) console.error("  " + failure);
    app.exit(1);
    return;
  }
  console.log("PARALLEL CHECK PASSED, banded output is byte-identical to single-pass");
  app.exit(0);
}

void app.whenReady().then(() =>
  run().catch((error) => {
    console.error("PARALLEL CHECK CRASHED", error);
    app.exit(1);
  }),
);
