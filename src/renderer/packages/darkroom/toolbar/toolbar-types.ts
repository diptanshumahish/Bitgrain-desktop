import type React from "react";
import type { Preset, PresetConfig } from "./popovers/PresetsPopover";
import type { DownloadRasterFn } from "@bitgrain/engine/export/export-types";

export type ActivePopover =
  | "effects" | "colour" | "filters" | "palette" | "algorithm" | "adjust" | "tone"
  | "export" | "presets" | "lut" | "haze-bloom" | "halftone" | "popart" | "ascii" | "braille" | "contour"
  | "inkwash" | "manga" | "styles" | "effect" | "finish" | "recipe" | "recipe-add" | "more"
  | null;

export type PhoneOnlySheet = "more" | "recipe" | "recipe-add";

export type InspectorPanel = Exclude<ActivePopover, null | PhoneOnlySheet>;

export interface ToolbarCallbacks {
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMosh: () => void;
  onDownloadRaster: DownloadRasterFn;
  onDownloadSvg: (transparent: boolean) => void;
  onSharePreset: () => void;
  onToggleTransparentBg: () => void;
  customPresets: Preset[];
  onSaveCustomPreset: (name: string, config: PresetConfig) => void;
  onDeleteCustomPreset: (name: string) => void;
}
