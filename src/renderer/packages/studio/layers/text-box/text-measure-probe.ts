import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { applyTransform } from "../text-style-utils";
import { trimTrailingLines } from "./trim-trailing-lines";
import { applyProbeExtras } from "./probe-extras";
import { usesParagraphMode } from "@bitgrain/studio-core/text/layout/text-layout-flags";
import { buildParagraphHtml } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-html";
import { sanitizeRichHtml } from "@bitgrain/core/html-sanitize/sanitize-rich-html";

let probe: HTMLDivElement | null = null;

const getProbe = (): HTMLDivElement => {
  if (probe) return probe;
  probe = document.createElement("div");
  probe.setAttribute("aria-hidden", "true");
  probe.style.position = "absolute";
  probe.style.left = "-100000px";
  probe.style.top = "0";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  document.body.appendChild(probe);
  return probe;
};

const applyLayerFont = (element: HTMLDivElement, layer: TextLayer): void => {
  element.style.fontSize = `${layer.fontSize}px`;
  element.style.fontWeight = layer.fontWeight;
  element.style.fontStyle = layer.fontStyle === "italic" ? "italic" : "normal";
  element.style.fontFamily = layer.fontFamily;
  element.style.letterSpacing = `${layer.letterSpacing}px`;
  element.style.lineHeight = String(layer.lineHeight);
  element.style.textTransform = layer.textTransform;
  element.style.wordBreak = "break-word";
};

const visibleHtml = (layer: TextLayer): string => {
  const trimmed = trimTrailingLines(layer.content, layer.richContent ?? "");
  const html = trimmed.richContent || applyTransform(trimmed.content, layer.textTransform);
  return usesParagraphMode(layer) ? buildParagraphHtml(html, layer) : html;
};

export const prepareProbe = (layer: TextLayer, width: string, whiteSpace: string): HTMLDivElement => {
  const element = getProbe();
  applyLayerFont(element, layer);
  element.style.width = width;
  element.style.whiteSpace = whiteSpace;
  applyProbeExtras(element, layer);
  element.innerHTML = sanitizeRichHtml(visibleHtml(layer));
  return element;
};
