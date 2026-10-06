import type { TextLayer } from "../../../../data/studioTypes";
import {
  applyEffectShadows,
  buildGradientFill,
  clearShadow,
  drawLines,
  loadLayerFonts,
  parseHtmlRuns,
  wrapLine,
  wrapRichLine,
} from "./text-helpers";
import type { RenderRun } from "./text-helpers";
import { applyFlip, applyRotation } from "./image-helpers";

const GLITCH_OFFSET_PX = 2;

const renderRichText = (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
  baseStyle: string,
  outlineEffect: { type: "outline"; width: number; color: string } | undefined,
): void => {
  const base: Omit<RenderRun, "text"> = {
    color: layer.color,
    fontWeight: layer.fontWeight,
    fontFamily: layer.fontFamily,
    fontSize: layer.fontSize,
    fontStyle: baseStyle || "normal",
  };
  const tokens = parseHtmlRuns(layer.richContent ?? "", base);
  ctx.textAlign = "left";

  const rawLines: RenderRun[][] = [[]];
  for (const tok of tokens) {
    if (tok === "\n") {
      rawLines.push([]);
      continue;
    }
    rawLines[rawLines.length - 1].push(tok);
  }

  let y = layer.y * s;
  // Line height follows each line's own font size (CSS line-height cascades from
  // the run, not the layer base) — otherwise large rich runs stack ~24px apart
  // and overlap. `lastFontSize` carries a sensible height across blank lines.
  const effects = layer.effects ?? [];
  const lineHeightFor = (fontSize: number): number => fontSize * s * layer.lineHeight;
  let lastFontSize = layer.fontSize;

  const maxLineW = layer.width * s;

  for (const lineRuns of rawLines) {
    if (lineRuns.length === 0) {
      y += lineHeightFor(lastFontSize);
      continue;
    }

    const visualLines = wrapRichLine(ctx, lineRuns, maxLineW, s);

    for (const vLine of visualLines) {
      let lineWidth = 0;
      let lineFontSize = 0;
      for (const run of vLine) {
        const fs = run.fontStyle && run.fontStyle !== "normal" ? run.fontStyle : "";
        ctx.font = [fs, run.fontWeight, `${run.fontSize * s}px`, run.fontFamily]
          .filter(Boolean)
          .join(" ");
        lineWidth += ctx.measureText(run.text).width;
        if (run.fontSize > lineFontSize) lineFontSize = run.fontSize;
      }
      if (lineFontSize === 0) lineFontSize = layer.fontSize;
      lastFontSize = lineFontSize;

      let xRun =
        layer.align === "left"
          ? layer.x * s
          : layer.align === "center"
            ? (layer.x + layer.width / 2) * s - lineWidth / 2
            : (layer.x + layer.width) * s - lineWidth;

      applyEffectShadows(ctx, effects, s);

      for (const run of vLine) {
        const fs = run.fontStyle && run.fontStyle !== "normal" ? run.fontStyle : "";
        ctx.font = [fs, run.fontWeight, `${run.fontSize * s}px`, run.fontFamily]
          .filter(Boolean)
          .join(" ");
        ctx.fillStyle = run.color;
        if (outlineEffect) {
          ctx.strokeStyle = outlineEffect.color;
          ctx.lineWidth = outlineEffect.width * 2 * s;
          ctx.lineJoin = "round";
          ctx.strokeText(run.text, xRun, y);
        }
        ctx.fillText(run.text, xRun, y);
        xRun += ctx.measureText(run.text).width;
      }
      clearShadow(ctx);
      y += lineHeightFor(lineFontSize);
    }
  }
};

const renderPlainText = (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
  baseFontStr: string,
  fill: string | CanvasGradient,
  hasGlitch: boolean,
  outlineEffect: { type: "outline"; width: number; color: string } | undefined,
): void => {
  const rawContent = layer.content.replaceAll("\\n", "\n");
  const text =
    layer.textTransform === "uppercase"
      ? rawContent.toUpperCase()
      : layer.textTransform === "lowercase"
        ? rawContent.toLowerCase()
        : layer.textTransform === "capitalize"
          ? rawContent.replace(/\b\w/g, (c) => c.toUpperCase())
          : rawContent;

  ctx.font = baseFontStr;
  ctx.fillStyle = fill;

  const maxW = layer.width * s;
  const allLines: string[] = [];
  for (const rawLine of text.split("\n"))
    for (const sub of wrapLine(ctx, rawLine, maxW)) allLines.push(sub);

  const lineH = layer.fontSize * s * layer.lineHeight;
  const xOrigin =
    layer.align === "left"
      ? layer.x * s
      : layer.align === "center"
        ? (layer.x + layer.width / 2) * s
        : (layer.x + layer.width) * s;
  const effects = layer.effects ?? [];

  if (hasGlitch) {
    ctx.fillStyle = "#00ffff";
    ctx.globalAlpha = layer.opacity * 0.8;
    let cy = layer.y * s;
    for (const line of allLines) {
      ctx.fillText(line, xOrigin + GLITCH_OFFSET_PX * s, cy + s);
      cy += lineH;
    }
    ctx.fillStyle = "#ff0080";
    cy = layer.y * s;
    for (const line of allLines) {
      ctx.fillText(line, xOrigin - GLITCH_OFFSET_PX * s, cy);
      cy += lineH;
    }
    ctx.fillStyle = fill;
    ctx.globalAlpha = layer.opacity;
  }

  applyEffectShadows(ctx, effects, s);

  if (outlineEffect) {
    ctx.strokeStyle = outlineEffect.color;
    ctx.lineWidth = outlineEffect.width * 2 * s;
    ctx.lineJoin = "round";
    let oy = layer.y * s;
    for (const line of allLines) {
      ctx.strokeText(line, xOrigin, oy);
      oy += lineH;
    }
  }

  drawLines(ctx, allLines, xOrigin, layer.y * s, lineH);
  clearShadow(ctx);
};

export const drawText = async (
  ctx: CanvasRenderingContext2D,
  layer: TextLayer,
  s: number,
): Promise<void> => {
  const baseStyle =
    layer.fontStyle && layer.fontStyle !== "regular" ? layer.fontStyle : "";
  const baseFontStr = [
    baseStyle,
    layer.fontWeight,
    `${layer.fontSize * s}px`,
    layer.fontFamily,
  ]
    .filter(Boolean)
    .join(" ");

  await loadLayerFonts(layer, s, baseStyle);

  const effects = layer.effects ?? [];
  const hasGlitch = effects.some((e) => e.type === "glitch");
  const outlineEffect = effects.find((e) => e.type === "outline") as
    | { type: "outline"; width: number; color: string }
    | undefined;

  const fill = buildGradientFill(ctx, layer, s);

  ctx.textBaseline = "top";
  ctx.textAlign = layer.align;
  if ("letterSpacing" in ctx)
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${layer.letterSpacing * s}px`;

  ctx.save();
  ctx.globalAlpha = layer.opacity;
  applyRotation(ctx, layer, s);
  applyFlip(ctx, layer, s);
  if (!layer.autoResize) {
    ctx.beginPath();
    ctx.rect(layer.x * s, layer.y * s, layer.width * s, layer.height * s);
    ctx.clip();
  }

  if (layer.richContent) {
    renderRichText(ctx, layer, s, baseStyle, outlineEffect);
  } else {
    renderPlainText(ctx, layer, s, baseFontStr, fill, hasGlitch, outlineEffect);
  }

  ctx.restore();
  ctx.globalAlpha = 1;
  if ("letterSpacing" in ctx)
    (ctx as unknown as { letterSpacing: string }).letterSpacing = "0px";
};
