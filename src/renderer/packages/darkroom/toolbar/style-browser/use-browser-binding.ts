import type { TransformMode } from "@bitgrain/engine/core/types";
import { useSignalValue } from "@bitgrain/core/signal";
import { imageSignal } from "../../state/image-store";
import { modesSignal } from "../../state/transform-store";
import { styleSettingsSignal } from "../../styles/state/style-store";
import { mainEffectOf } from "../effects/main-effect-modes";
import { pickClassic, pickStyle } from "../inspector/look/look-actions";
import { familiesFor, type BrowserEntry, type BrowserFamily } from "./browser-entries";
import type { StyleBrowserTarget } from "./style-browser-target";

const STYLE_MODE: TransformMode = "style";

interface BrowserBinding {
  pool: readonly BrowserFamily[];
  thumbSource: string | null;
  currentStyleId: string | null;
  isSelected: (entry: BrowserEntry) => boolean;
  pick: (entry: BrowserEntry) => void;
}

const targetBinding = (target: StyleBrowserTarget): BrowserBinding => ({
  pool: familiesFor(false),
  thumbSource: target.thumbSource,
  currentStyleId: target.styleId,
  isSelected: (entry) => entry.kind === "style" && entry.id === target.styleId,
  pick: (entry) => { if (entry.kind === "style") target.onPick(entry.id); },
});

export const useBrowserBinding = (target: StyleBrowserTarget | undefined): BrowserBinding => {
  const image = useSignalValue(imageSignal);
  const settings = useSignalValue(styleSettingsSignal);
  const mainMode = mainEffectOf(useSignalValue(modesSignal));
  if (target) return targetBinding(target);
  return {
    pool: familiesFor(true),
    thumbSource: image,
    currentStyleId: settings.styleId,
    isSelected: (entry) => (entry.kind === "style" ? mainMode === STYLE_MODE && entry.id === settings.styleId : mainMode === entry.mode),
    pick: (entry) => (entry.kind === "style" ? pickStyle(entry.id) : pickClassic(entry.mode)),
  };
};
