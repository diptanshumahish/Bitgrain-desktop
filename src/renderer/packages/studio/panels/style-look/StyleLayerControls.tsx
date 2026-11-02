import React from "react";
import type { BitgrainEffect } from "@bitgrain/studio-core/model/studio-types";
import type { StyleSettings } from "@bitgrain/engine/styles/engine/style-types";
import { defaultStyleSettings } from "@bitgrain/darkroom/styles/state/style-store";
import { withStyleId } from "@bitgrain/darkroom/styles/state/style-edits";
import { StyleTargetControls } from "@bitgrain/darkroom/styles/ui/target/StyleTargetControls";
import { openStyleBrowser } from "@bitgrain/darkroom/toolbar/style-browser/style-browser-store";

const FALLBACK_THUMB_SOURCE = "/sample.jpg";
const STYLE_KIND = "style";

interface StyleLayerControlsProps {
  effect: BitgrainEffect | undefined;
  thumbSource?: string | null;
  onChange: (effect: BitgrainEffect | undefined) => void;
}

const asEffect = (style: StyleSettings): BitgrainEffect => ({ kind: STYLE_KIND, params: {}, style });

export const StyleLayerControls: React.FC<StyleLayerControlsProps> = ({ effect, thumbSource, onChange }) => {
  const source = thumbSource || FALLBACK_THUMB_SOURCE;
  const current = effect?.kind === STYLE_KIND ? effect.style ?? defaultStyleSettings() : null;
  const browse = (): void => openStyleBrowser({
    styleId: current?.styleId ?? null,
    thumbSource: source,
    onPick: (styleId) => onChange(asEffect(withStyleId(current ?? defaultStyleSettings(), styleId))),
  });
  return <StyleTargetControls settings={current} thumbSource={source} onBrowse={browse} onChange={(style) => onChange(asEffect(style))} />;
};
