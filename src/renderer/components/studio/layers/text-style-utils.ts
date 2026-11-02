import type { TextLayer, TextEffect } from "../../../data/studioTypes";
import type { CSSProperties } from "react";
import { buildTextShadowSpecs, formatTextShadowCss } from "../text-effects/text-shadow-specs";

export const normalizeText = (el: HTMLDivElement): string =>
  el.innerText.replace(/\n\n/g, "\n").replace(/\r/g, "").replace(/\u200b/g, "");

export const applyTransform = (
  content: string,
  transform: TextLayer["textTransform"],
): string => {
  let out = content.replaceAll("\\n", "\n");
  if (transform === "uppercase") out = out.toUpperCase();
  else if (transform === "lowercase") out = out.toLowerCase();
  else if (transform === "capitalize") out = out.replace(/\b\w/g, (c) => c.toUpperCase());
  return out.replace(/\n/g, "<br>");
};

export const buildShadowCss = (effects: TextEffect[], mult = 1): string =>
  formatTextShadowCss(buildTextShadowSpecs(effects, mult));

export const getColorStyle = (layer: TextLayer): CSSProperties => {
  const gradient = layer.gradientText;
  if (gradient?.enabled) {
    return {
      background: `linear-gradient(${gradient.angle}deg, ${gradient.color1}, ${gradient.color2})`,
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    };
  }
  return { color: layer.color };
};

export const buildBaseTextStyle = (layer: TextLayer): CSSProperties => {
  const shadowCss = buildShadowCss(layer.effects ?? []);
  return {
    fontSize: layer.fontSize,
    fontWeight: layer.fontWeight,
    fontStyle: layer.fontStyle === "regular" ? "normal" : (layer.fontStyle ?? "normal"),
    fontFamily: layer.fontFamily,
    textAlign: layer.align,
    letterSpacing: layer.letterSpacing,
    lineHeight: layer.lineHeight,
    textTransform: layer.textTransform,
    textDecorationLine: layer.textDecoration ?? "none",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    outline: "none",
    minHeight: "1em",
    textRendering: "optimizeLegibility",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
    ...(shadowCss ? { textShadow: shadowCss } : {}),
    ...getColorStyle(layer),
  };
};
