// Builds the DMG installer-window background from the source art at
// build/installer-bg.png. The source is treated as the @2x asset (~1322x818 for
// the 661x409 installer window); this derives an exact 1x PNG and combines both
// into a Retina-tagged TIFF that electron-builder uses as the background, so the
// installer looks sharp on Retina and non-Retina displays. Run: `npm run dmg-bg`.
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = join(ROOT, "build");

const SOURCE = join(BUILD, "installer-bg.png");
const AT1X = join(BUILD, "dmg-bg.png");
const AT2X = join(BUILD, "dmg-bg@2x.png");
const TIFF = join(BUILD, "dmg-background.tiff");

// Must match the `build.dmg.window` size in package.json.
const W1 = 661;
const H1 = 409;

if (!existsSync(SOURCE)) {
  console.error(`missing ${SOURCE} — add the installer artwork there first.`);
  process.exit(1);
}

// sips takes height then width. Normalize to exact 1x and 2x pixel sizes.
execFileSync("sips", ["-z", String(H1 * 2), String(W1 * 2), SOURCE, "--out", AT2X]);
execFileSync("sips", ["-z", String(H1), String(W1), SOURCE, "--out", AT1X]);
execFileSync("tiffutil", ["-cathidpicheck", AT1X, AT2X, "-out", TIFF]);

console.log("wrote", AT1X, AT2X, TIFF);
