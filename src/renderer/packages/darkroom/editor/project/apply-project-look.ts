import {
  lutIdSignal,
  hazeIntensitySignal,
  bloomIntensitySignal,
  bloomThresholdSignal,
  hazeWarmthSignal,
  applySnapshot,
  captureSnapshot,
} from "../../state/transform-store";
import { PALETTES } from "@bitgrain/engine/color/palettes";
import type { EditorProjectFile } from "./editor-project-file";

const applyLegacyLook = (project: EditorProjectFile): void => {
  const palette = PALETTES.find((pal) => pal.id === project.effects.palette?.id) ?? null;
  const snap = captureSnapshot();
  applySnapshot({
    ...snap,
    modes: project.effects.modes as unknown as typeof snap.modes,
    ditherMethod: project.effects.ditherMethod as unknown as typeof snap.ditherMethod,
    ditherFactor: project.effects.ditherFactor,
    resolution: project.effects.resolution,
    contrast: project.effects.contrast,
    brightness: project.effects.brightness,
    saturation: project.effects.saturation,
    grain: project.effects.grain,
    hue: project.effects.hue,
    isColor: project.effects.isColor,
    palette,
  });
  lutIdSignal.value = project.effects.lutId;
  hazeIntensitySignal.value = project.effects.hazeIntensity;
  bloomIntensitySignal.value = project.effects.bloomIntensity;
  bloomThresholdSignal.value = project.effects.bloomThreshold;
  hazeWarmthSignal.value = project.effects.hazeWarmth as unknown as typeof snap.hazeWarmth;
};

export const applyProjectLook = (project: EditorProjectFile): void => {
  if (project.snapshot) {
    applySnapshot({ ...captureSnapshot(), ...project.snapshot });
    return;
  }
  applyLegacyLook(project);
};
