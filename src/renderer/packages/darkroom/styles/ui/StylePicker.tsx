import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { findStyle } from "@bitgrain/engine/styles/engine/style-registry";
import type { StyleDefinition } from "@bitgrain/engine/styles/engine/style-definition";
import { AVAILABLE_CATEGORIES, CLASSIC_CATEGORY, styleCategorySignal, stylesIn } from "./style-categories";

interface StylePickerProps {
  selectedId: string;
  onSelect: (styleId: string) => void;
}

interface StyleTileProps {
  definition: StyleDefinition;
  selected: boolean;
  onSelect: (styleId: string) => void;
}

const StyleTile: React.FC<StyleTileProps> = ({ definition, selected, onSelect }) => (
  <button
    type="button"
    title={definition.hint}
    aria-pressed={selected}
    onClick={() => onSelect(definition.id)}
    className={`flex flex-col items-center gap-1 rounded-lg border px-1 py-2 transition-colors ${selected ? "border-[var(--s-border-selected)] bg-[var(--s-bg-input)] text-[var(--s-text)]" : "border-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"}`}
  >
    <span aria-hidden="true" className="font-mono text-[15px] leading-none">{definition.glyph}</span>
    <span className="text-[12px] font-medium leading-tight truncate max-w-full">{definition.label}</span>
  </button>
);

export const StylePicker: React.FC<StylePickerProps> = ({ selectedId, onSelect }) => {
  const chosenCategory = useSignalValue(styleCategorySignal);
  const category = chosenCategory && chosenCategory !== CLASSIC_CATEGORY ? chosenCategory : findStyle(selectedId).category;
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1 px-1">
        {AVAILABLE_CATEGORIES.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === category}
            onClick={() => { styleCategorySignal.value = option.id; }}
            className={`h-6 px-2 rounded-full text-[12px] font-medium transition-colors ${option.id === category ? "bg-[var(--s-accent)] text-[var(--s-accent-text)]" : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)]"}`}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 px-1">
        {stylesIn(category).map((definition) => (
          <StyleTile key={definition.id} definition={definition} selected={definition.id === selectedId} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
};
