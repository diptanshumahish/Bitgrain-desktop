// Bundles every Google Fonts family the web app loads from the CDN into
// src/renderer/public/fonts/google/, so the desktop app never requests a font
// at runtime. Run by hand after a web re-sync; not part of build or verify.
//
//   node scripts/fetch-google-fonts.mjs [--web ../imgi] [--stage <dir>] [--budget-mb 120]
//
// Sheets come straight from the web sources (parsed, not retyped), plus an
// "extra" sheet with any Google family the public templates use that no other
// sheet covers. Each sheet is staged, measured, then installed in priority
// order until the size budget would be exceeded.
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rm, cp, stat, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const WEB = resolve(arg("web", join(ROOT, "..", "imgi")));
const STAGE = resolve(arg("stage", join(ROOT, "node_modules", ".cache", "google-fonts-stage")));
const BUDGET = Number(arg("budget-mb", "120")) * 1024 * 1024;
const OUT = join(ROOT, "src", "renderer", "public", "fonts", "google");
const PUBLIC_PREFIX = "/fonts/google/files";
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const TEMPLATES_API = "https://api.bitgrain.app/api/templates";
const PRIORITY = ["ui", "studio", "curated", "extra", "indic", "world"];

const readHref = async (rel, name) => {
  const src = await readFile(join(WEB, rel), "utf8");
  const match = src.match(new RegExp(`${name}\\s*=\\s*["'\`]([^"'\`]+)["'\`]`));
  if (!match) throw new Error(`${name} not found as a string literal in ${rel}`);
  return match[1];
};

const readUiHref = async () => {
  const html = await readFile(join(WEB, "index.html"), "utf8");
  const match = html.match(/href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)"/);
  if (!match) throw new Error("UI font link not found in web index.html");
  return match[1].replace(/&amp;/g, "&");
};

const familiesOf = (href) =>
  new URL(href).searchParams.getAll("family").map((f) => f.split(":")[0].replace(/\+/g, " "));

const fetchText = async (url, headers = {}) => {
  const res = await fetch(url, { headers: { "User-Agent": UA, ...headers } });
  return { ok: res.ok, status: res.status, text: res.ok ? await res.text() : "" };
};

const collectFontFamilies = (node, out) => {
  if (Array.isArray(node)) return node.forEach((n) => collectFontFamilies(n, out));
  if (!node || typeof node !== "object") return;
  for (const [key, value] of Object.entries(node)) {
    if (key === "fontFamily" && typeof value === "string") {
      const first = value.split(",")[0].trim().replace(/^['"]|['"]$/g, "").trim();
      if (first) out.add(first);
    } else collectFontFamilies(value, out);
  }
};

const templateFamilies = async () => {
  const out = new Set();
  for (let page = 1; page < 100; page++) {
    const { ok, text } = await fetchText(`${TEMPLATES_API}?page=${page}`, { Origin: "https://bitgrain.app" });
    if (!ok) break;
    const body = JSON.parse(text);
    collectFontFamilies(body.data, out);
    if (!body.hasMore) break;
  }
  return out;
};

const GENERIC = new Set(["serif", "sans-serif", "monospace", "cursive", "fantasy", "system-ui", "inherit"]);

const buildExtraHref = async (covered) => {
  const candidates = [...(await templateFamilies())].filter(
    (f) => !GENERIC.has(f.toLowerCase()) && !covered.has(f.toLowerCase()),
  );
  const accepted = [];
  for (const family of candidates.sort()) {
    const probe = `https://fonts.googleapis.com/css2?family=${family.replace(/ /g, "+")}&display=swap`;
    const { ok } = await fetchText(probe);
    if (ok) accepted.push(family);
    else console.log(`  extra: skipped "${family}" (not a Google family)`);
  }
  if (!accepted.length) return { href: null, accepted };
  const query = accepted.map((f) => `family=${f.replace(/ /g, "+")}`).join("&");
  return { href: `https://fonts.googleapis.com/css2?${query}&display=swap`, accepted };
};

const stageSheet = async (name, href) => {
  const { ok, status, text } = await fetchText(href);
  if (!ok) throw new Error(`sheet ${name}: HTTP ${status}`);
  const dir = join(STAGE, name);
  await rm(dir, { recursive: true, force: true });
  await mkdir(join(dir, "files"), { recursive: true });
  const urls = [...new Set([...text.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
  let bytes = 0;
  const queue = [...urls];
  const worker = async () => {
    while (queue.length) {
      const url = queue.shift();
      const file = `${createHash("sha1").update(url).digest("hex")}.woff2`;
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`sheet ${name}: font HTTP ${res.status} ${url}`);
      const buf = Buffer.from(await res.arrayBuffer());
      bytes += buf.length;
      await writeFile(join(dir, "files", file), buf);
    }
  };
  await Promise.all(Array.from({ length: 12 }, worker));
  const css = text.replace(/url\((https:[^)]+)\)/g, (_, url) =>
    `url(${PUBLIC_PREFIX}/${createHash("sha1").update(url).digest("hex")}.woff2)`,
  );
  await writeFile(join(dir, `${name}.css`), `/* Generated by scripts/fetch-google-fonts.mjs from ${href} */\n${css}`);
  return { name, files: urls.length, bytes };
};

const main = async () => {
  const sheets = {
    ui: await readUiHref(),
    studio: await readHref("src/lib/load-studio-fonts.ts", "STUDIO_FONTS_HREF"),
    curated: await readHref("src/data/curated-fonts.ts", "CURATED_FONTS_HREF"),
    indic: await readHref("src/data/indic-fonts.ts", "INDIC_FONTS_HREF"),
    world: await readHref("src/data/world-fonts.ts", "WORLD_FONTS_HREF"),
  };
  const covered = new Set(Object.values(sheets).flatMap(familiesOf).map((f) => f.toLowerCase()));
  const extra = await buildExtraHref(covered);
  console.log(`extra families from templates: ${extra.accepted.join(", ") || "(none)"}`);
  if (extra.href) sheets.extra = extra.href;

  const staged = [];
  for (const name of PRIORITY.filter((n) => sheets[n])) {
    const result = await stageSheet(name, sheets[name]);
    console.log(`staged ${name}: ${result.files} files, ${(result.bytes / 1048576).toFixed(1)} MB`);
    staged.push(result);
  }

  await rm(OUT, { recursive: true, force: true });
  await mkdir(join(OUT, "files"), { recursive: true });
  let total = 0;
  const installed = [];
  for (const sheet of staged) {
    if (total + sheet.bytes > BUDGET) {
      console.log(`left out ${sheet.name} and everything after it (budget ${BUDGET / 1048576} MB)`);
      break;
    }
    total += sheet.bytes;
    installed.push(sheet.name);
    await cp(join(STAGE, sheet.name, "files"), join(OUT, "files"), { recursive: true });
    await cp(join(STAGE, sheet.name, `${sheet.name}.css`), join(OUT, `${sheet.name}.css`));
  }
  let onDisk = 0;
  for (const f of await readdir(join(OUT, "files"))) onDisk += (await stat(join(OUT, "files", f))).size;
  console.log(`installed: ${installed.join(", ")} — ${(onDisk / 1048576).toFixed(1)} MB on disk`);
  if (!existsSync(join(OUT, "ui.css"))) throw new Error("ui sheet missing");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
