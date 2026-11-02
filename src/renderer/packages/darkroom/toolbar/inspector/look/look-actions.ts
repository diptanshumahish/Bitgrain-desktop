import type { TransformMode } from "@bitgrain/engine/core/types";
import { modesSignal } from "../../../state/transform-store";
import { pushHistory } from "../../../state/history-store";
import { selectStyle } from "../../../styles/state/style-store";
import { mainEffectOf } from "../../effects/main-effect-modes";
import { selectMainEffect } from "../../effects/select-main-effect";

const STYLE_MODE: TransformMode = "style";

const currentMainMode = (): TransformMode => mainEffectOf(modesSignal.value);

export const ensureStyleMode = (): void => {
  if (currentMainMode() !== STYLE_MODE) selectMainEffect(STYLE_MODE);
};

export const pickStyle = (styleId: string): void => {
  selectStyle(styleId);
  ensureStyleMode();
  pushHistory();
};

export const pickClassic = (mode: TransformMode): void => {
  selectMainEffect(mode);
  pushHistory();
};
