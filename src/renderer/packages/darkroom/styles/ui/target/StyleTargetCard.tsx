import React, { useEffect } from "react";
import { findStyle } from "@bitgrain/engine/styles/engine/style-registry";
import { StyleThumb } from "../../thumbs/StyleThumb";
import { requestStyleThumbs } from "../../thumbs/style-thumbs";
import { AVAILABLE_CATEGORIES } from "../style-categories";

interface StyleTargetCardProps {
  styleId: string;
  thumbSource: string;
  onChange: () => void;
}

export const StyleTargetCard: React.FC<StyleTargetCardProps> = ({ styleId, thumbSource, onChange }) => {
  useEffect(() => {
    void requestStyleThumbs(thumbSource, [styleId]);
  }, [thumbSource, styleId]);
  const definition = findStyle(styleId);
  const family = AVAILABLE_CATEGORIES.find((category) => category.id === definition.category)?.label ?? "";
  return (
    <button type="button" onClick={onChange}
      className="group w-full flex items-center gap-2.5 p-1.5 rounded-lg border border-[var(--s-border)] bg-[var(--s-bg-input)] hover:border-[var(--s-border-hover)] transition-colors text-left">
      <span className="w-14 h-10 shrink-0 overflow-hidden rounded-md border border-[var(--s-border)]">
        <StyleThumb styleId={definition.id} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[12px] font-semibold text-[var(--s-text)] truncate">{definition.label}</span>
        <span className="block text-[12px] text-[var(--s-text-subtle)]">{family}</span>
      </span>
      <span className="shrink-0 h-6 px-2 flex items-center rounded-md border border-[var(--s-border)] text-[12px] font-medium text-[var(--s-text-muted)] group-hover:text-[var(--s-text)]">
        Change
      </span>
    </button>
  );
};
