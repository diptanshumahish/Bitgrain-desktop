import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { featureStyleValues } from "@bitgrain/studio-core/text/layout/text-feature-css";
import { usesParagraphMode } from "@bitgrain/studio-core/text/layout/text-layout-flags";
import { PARAGRAPH_CLASS, paragraphVars } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-vars";

const applyFeatures = (element: HTMLDivElement, layer: TextLayer): void => {
  Object.entries(featureStyleValues(layer)).forEach(([property, value]) => {
    (element.style as unknown as Record<string, string>)[property] = value;
  });
};

const applyParagraphs = (element: HTMLDivElement, layer: TextLayer): void => {
  element.classList.toggle(PARAGRAPH_CLASS, usesParagraphMode(layer));
  Object.entries(paragraphVars(layer, 1)).forEach(([name, value]) => element.style.setProperty(name, String(value)));
};

const applyClamp = (element: HTMLDivElement, maxLines: number | undefined): void => {
  const clamped = Boolean(maxLines && maxLines > 0);
  element.style.display = clamped ? "-webkit-box" : "";
  element.style.setProperty("-webkit-box-orient", clamped ? "vertical" : "");
  element.style.setProperty("-webkit-line-clamp", clamped ? String(maxLines) : "");
  element.style.overflow = clamped ? "hidden" : "";
};

export const applyProbeExtras = (element: HTMLDivElement, layer: TextLayer): void => {
  applyFeatures(element, layer);
  applyParagraphs(element, layer);
  applyClamp(element, layer.maxLines);
};
