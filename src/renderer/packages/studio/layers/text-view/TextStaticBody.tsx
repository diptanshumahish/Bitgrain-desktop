import React, { useMemo } from "react";
import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { buildBaseTextStyle, buildShadowCss } from "../text-style-utils";
import { halfLeading } from "@bitgrain/core/layout/text-block-height";
import { usesParagraphMode } from "@bitgrain/studio-core/text/layout/text-layout-flags";
import { PARAGRAPH_CLASS, paragraphVars } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-vars";
import { resolveTextSizing } from "@bitgrain/studio-core/text/layout/text-sizing";
import { verticalJustify } from "@bitgrain/studio-core/text/layout/text-vertical-align";
import { displayHtml } from "./text-display-html";
import { clampStyle } from "./text-clamp-style";

interface TextStaticBodyProps {
  layer: TextLayer;
  scale: number;
}

const HUG_SCALE = 1;

export const TextStaticBody: React.FC<TextStaticBodyProps> = ({ layer, scale }) => {
  const paragraphMode = usesParagraphMode(layer);
  const { content, richContent, textTransform, listStyles } = layer;
  const html = useMemo(
    () => displayHtml({ content, richContent, textTransform, listStyles }, paragraphMode),
    [content, richContent, textTransform, listStyles, paragraphMode],
  );
  const baseStyle = buildBaseTextStyle(layer);
  const leading = halfLeading(layer.fontSize, layer.lineHeight);
  const paragraphClass = paragraphMode ? PARAGRAPH_CLASS : undefined;
  const effects = layer.effects ?? [];

  if (resolveTextSizing(layer) === "auto-width") {
    return (
      <div
        className={`select-none pointer-events-none ${paragraphClass ?? ""}`}
        style={{ ...baseStyle, ...paragraphVars(layer, HUG_SCALE), ...clampStyle(layer.maxLines), marginTop: -leading, marginBottom: -leading }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div
      className="absolute top-0 left-0 flex flex-col origin-top-left will-change-transform select-none pointer-events-none"
      style={{
        width: layer.width * scale,
        height: layer.height * scale,
        transform: `scale(${1 / scale})`,
        justifyContent: verticalJustify(layer.verticalAlign),
      }}
    >
      <div
        className={paragraphClass}
        style={{
          ...baseStyle,
          ...paragraphVars(layer, scale),
          ...clampStyle(layer.maxLines),
          fontSize: layer.fontSize * scale,
          letterSpacing: layer.letterSpacing * scale,
          marginTop: -leading * scale,
          marginBottom: -leading * scale,
          ...(effects.length ? { textShadow: buildShadowCss(effects, scale) } : {}),
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};
