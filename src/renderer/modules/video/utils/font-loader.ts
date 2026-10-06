import type { VideoProject } from "../types";
import { bumpAssetEpoch } from "../engine/preview/asset-epoch";

const PROBE_SIZES = [16, 24, 48, 80, 120];

const loadStarted = new Set<string>();
const loadedFonts = new Set<string>();

function buildFontShorthand(weight: number, size: number, family: string): string {
  return `${weight} ${size}px ${family}`;
}

export function ensureFontLoaded(weight: number, family: string): boolean {
  if (typeof document === "undefined" || !document.fonts) return true;
  const key = `${weight}|${family}`;
  if (loadedFonts.has(key)) return true;
  if (loadStarted.has(key)) return false;
  loadStarted.add(key);

  Promise.all(
    PROBE_SIZES.map((size) =>
      document.fonts.load(buildFontShorthand(weight, size, family)),
    ),
  )
    .then(() => {
      loadedFonts.add(key);
      // Any frame composed while this face was still loading drew its text in
      // the fallback, so the preview has to drop and recompose those.
      bumpAssetEpoch();
    })
    .catch(() => {
      loadStarted.delete(key);
    });
  return false;
}

export async function preloadProjectFonts(project: VideoProject): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;

  const combos = new Map<string, { weight: number; family: string }>();
  for (const track of project.tracks) {
    if (track.kind !== "text") continue;
    for (const clip of track.clips) {
      const key = `${clip.weight}|${clip.font}`;
      if (!combos.has(key)) combos.set(key, { weight: clip.weight, family: clip.font });
    }
  }
  if (combos.size === 0) return;

  const tasks: Promise<unknown>[] = [];
  for (const { weight, family } of combos.values()) {
    for (const size of PROBE_SIZES) {
      tasks.push(document.fonts.load(buildFontShorthand(weight, size, family)));
    }
    loadedFonts.add(`${weight}|${family}`);
  }
  await Promise.all(tasks);
}
