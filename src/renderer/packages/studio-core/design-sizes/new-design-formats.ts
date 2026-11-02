import type { SafeZoneSpec } from "./safe-zone-types";
import { pickSizes } from "./size-groups";

export interface DesignFormat {
  id: string;
  label: string;
  detail: string;
  width: number;
  height: number;
  safeZones?: SafeZoneSpec[];
}

export interface DesignSize {
  width: number;
  height: number;
  safeZones?: SafeZoneSpec[];
}

export const MIN_CUSTOM_SIDE_PX = 50;
export const MAX_CUSTOM_SIDE_PX = 8000;
export const DEFAULT_CUSTOM_SIZE: DesignSize = { width: 1200, height: 800 };

export const DESIGN_FORMATS: DesignFormat[] = pickSizes(["instagram-post", "instagram-portrait", "story", "presentation", "a4", "us-letter"]);

export function clampCustomSide(value: number): number {
  if (!Number.isFinite(value)) return MIN_CUSTOM_SIDE_PX;
  return Math.round(Math.min(MAX_CUSTOM_SIDE_PX, Math.max(MIN_CUSTOM_SIDE_PX, value)));
}
