import React, { memo, useEffect } from "react";
import type { TransformMode } from "@bitgrain/engine/core/types";
import { useSignalValue } from "@bitgrain/core/signal";
import { imageSignal } from "../../../state/image-store";
import { findStyle } from "@bitgrain/engine/styles/engine/style-registry";
import { StyleThumb } from "../../../styles/thumbs/StyleThumb";
import { requestStyleThumbs } from "../../../styles/thumbs/style-thumbs";
import { AVAILABLE_CATEGORIES } from "../../../styles/ui/style-categories";
import { EFFECT_THUMBS } from "../../effects/thumbs/effect-thumbs";
import { openStyleBrowser } from "../../style-browser/style-browser-store";
import { CLASSIC_ENTRIES } from "./classic-entries";

interface StyleCardProps {
  mainMode: TransformMode;
  styleId: string;
}

const CLASSIC_THUMB_KEYS: Partial<Record<TransformMode, string>> = { dither: "algorithm" };

interface CardIdentity {
  label: string;
  family: string;
  thumb: React.ReactNode;
}

const classicIdentity = (mode: TransformMode): CardIdentity => {
  const entry = CLASSIC_ENTRIES.find((candidate) => candidate.mode === mode);
  const Thumb = EFFECT_THUMBS[CLASSIC_THUMB_KEYS[mode] ?? mode];
  return {
    label: entry?.label ?? "Original",
    family: "Classic",
    thumb: <span className="flex w-full h-full items-center justify-center p-2 text-[var(--s-text-muted)]">{Thumb ? <Thumb /> : null}</span>,
  };
};

const styleIdentity = (styleId: string): CardIdentity => {
  const definition = findStyle(styleId);
  const family = AVAILABLE_CATEGORIES.find((category) => category.id === definition.category)?.label ?? "";
  return { label: definition.label, family, thumb: <StyleThumb styleId={definition.id} /> };
};

const StyleCardView: React.FC<StyleCardProps> = ({ mainMode, styleId }) => {
  const image = useSignalValue(imageSignal);
  useEffect(() => {
    if (image) void requestStyleThumbs(image, [styleId]);
  }, [image, styleId]);
  const identity = mainMode === "style" ? styleIdentity(styleId) : classicIdentity(mainMode);
  return (
    <button type="button" onClick={() => openStyleBrowser()} data-tutorial="home-algorithm"
      className="group w-full flex items-center gap-3 p-2 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:border-[var(--s-border-hover)] transition-colors text-left">
      <span className="w-16 h-12 shrink-0 overflow-hidden rounded-md border border-[var(--s-border)] bg-[var(--s-bg-panel)]">{identity.thumb}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[13px] font-semibold text-[var(--s-text)] truncate">{identity.label}</span>
        <span className="block text-[12px] text-[var(--s-text-subtle)]">{identity.family}</span>
      </span>
      <span className="shrink-0 h-7 px-2.5 flex items-center rounded-md bg-[var(--s-bg-panel)] border border-[var(--s-border)] text-[12px] font-medium text-[var(--s-text-muted)] group-hover:text-[var(--s-text)]">
        Change
      </span>
    </button>
  );
};

export const StyleCard = memo(StyleCardView);
