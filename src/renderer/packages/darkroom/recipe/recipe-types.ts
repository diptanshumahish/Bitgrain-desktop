import type { DitherMethod, Palette, TransformMode } from "@bitgrain/engine/core/types";
import type { StyleSettings } from "@bitgrain/engine/styles/engine/style-types";
import type { InspectorPanel } from "../toolbar/toolbar-types";

export type RecipeStepKind = "adjust" | "look" | "effect" | "colour" | "grade" | "finish";

export type RecipeRemoval =
  | { type: "look" }
  | { type: "effect"; key: string }
  | { type: "mode"; mode: TransformMode }
  | { type: "palette" }
  | { type: "mono" }
  | { type: "lut" }
  | { type: "adjust" }
  | { type: "finish" };

export interface RecipeStep {
  id: string;
  kind: RecipeStepKind;
  title: string;
  detail: string;
  panel: InspectorPanel | null;
  effectKey?: string;
  removal: RecipeRemoval;
}

export interface ToneValues {
  contrast: number;
  brightness: number;
  saturation: number;
  hue: number;
}

export interface RecipeInputs {
  modes: TransformMode[];
  styleSettings: StyleSettings;
  ditherMethod: DitherMethod;
  palette: Palette | null;
  lutId: string | null;
  isColor: boolean;
  tone: ToneValues;
  gradeIsNeutral: boolean;
  printFinish: boolean;
}
