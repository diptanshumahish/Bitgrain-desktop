import React from "react";
import { Shuffle } from "lucide-react";
import { STYLE_DEFINITIONS } from "@bitgrain/engine/styles/engine/style-registry";
import type { StyleLook } from "@bitgrain/engine/styles/engine/style-types";
import { looksFor } from "@bitgrain/engine/styles/looks/style-looks";
import { applyLook } from "../state/style-store";
import { styleCategorySignal } from "./style-categories";

const PLAIN_LOOK: StyleLook = { name: "Plain" };

const pickOne = <Item,>(items: readonly Item[]): Item => items[Math.floor(Math.random() * items.length)];

const surprise = (): void => {
  const definition = pickOne(STYLE_DEFINITIONS);
  const looks = looksFor(definition.id);
  applyLook(definition.id, looks.length ? pickOne(looks) : PLAIN_LOOK);
  styleCategorySignal.value = definition.category;
};

const DEFAULT_CLASS = "inline-flex items-center gap-1 h-6 px-2 rounded-md text-[12px] font-medium text-[var(--s-text-muted)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors";

interface SurpriseButtonProps {
  onCommit: () => void;
  className?: string;
}

export const SurpriseButton: React.FC<SurpriseButtonProps> = ({ onCommit, className = DEFAULT_CLASS }) => (
  <button
    type="button"
    onClick={() => { surprise(); onCommit(); }}
    className={className}
  >
    <Shuffle size={11} />
    Surprise me
  </button>
);
