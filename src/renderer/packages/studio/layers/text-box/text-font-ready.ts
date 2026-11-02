import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";

const fontQuery = (layer: TextLayer): string => {
  const style = layer.fontStyle === "italic" ? "italic" : "normal";
  return `${style} ${layer.fontWeight} ${layer.fontSize}px ${layer.fontFamily}`;
};

const SAMPLE_TEXT_LIMIT = 200;

const sampleText = (layer: TextLayer): string => layer.content.slice(0, SAMPLE_TEXT_LIMIT) || " ";

export const whenTextFontReady = (layer: TextLayer, onReady: () => void): void => {
  const query = fontQuery(layer);
  const sample = sampleText(layer);
  if (document.fonts.check(query, sample)) return;
  document.fonts.load(query, sample).then(onReady, (error: unknown) => {
    console.error("text font failed to load:", error);
  });
};
