import type { TransformMode } from "@bitgrain/engine/core/types";
import { SOUND_DRIVE_OPTIONS, type SoundDrive } from "../sound-settings";

const DOT_MODES: ReadonlySet<TransformMode> = new Set<TransformMode>(["halftone", "popart", "dither"]);

const hasDots = (modes: readonly TransformMode[], lutId: string | null): boolean =>
  !lutId && modes.some((mode) => DOT_MODES.has(mode));

export const availableSoundDrives = (modes: readonly TransformMode[], lutId: string | null): SoundDrive[] =>
  hasDots(modes, lutId) ? [...SOUND_DRIVE_OPTIONS] : SOUND_DRIVE_OPTIONS.filter((drive) => drive !== "dots");

export const resolveSoundDrive = (preferred: SoundDrive, available: readonly SoundDrive[]): SoundDrive =>
  available.includes(preferred) ? preferred : available[0];
