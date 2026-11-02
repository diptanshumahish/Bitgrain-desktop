import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { refitTextLayer } from "./text-box-fit";
import { whenTextFontReady } from "./text-font-ready";

type ApplyUpdate = (updates: Partial<TextLayer>) => void;

export const applyTextUpdate = (layer: TextLayer, updates: Partial<TextLayer>, apply: ApplyUpdate): void => {
  const fitted = refitTextLayer(layer, updates);
  apply(fitted);
  if (!updates.fontFamily && updates.content === undefined) return;
  const next: TextLayer = { ...layer, ...fitted };
  whenTextFontReady(next, () => apply(refitTextLayer(next, { fontFamily: next.fontFamily })));
};
