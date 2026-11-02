import React, { useMemo } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { studioPagesSignal } from "../../state/studio-document-store";
import { collectDocumentColors } from "./collect-document-colors";
import { SwatchButton } from "./swatch-button";
import { get6 } from "./color-alpha";

interface DocumentColorsRowProps {
  current: string;
  onPick: (color: string) => void;
}

export const DocumentColorsRow: React.FC<DocumentColorsRowProps> = ({ current, onPick }) => {
  const pages = useSignalValue(studioPagesSignal);
  const colors = useMemo(() => collectDocumentColors(pages), [pages]);
  if (colors.length === 0) return null;
  const currentLower = current.toLowerCase();

  return (
    <div className="flex flex-col gap-2 pt-3 border-t border-[var(--s-border)]">
      <span className="text-[12px] font-medium text-[var(--s-text-muted)]">Document colors</span>
      <div className="grid grid-cols-8 gap-1.5">
        {colors.map((color) => (
          <SwatchButton
            key={color}
            color={color}
            title={color}
            active={currentLower === color || get6(currentLower) === color}
            onClick={() => onPick(color)}
          />
        ))}
      </div>
    </div>
  );
};
