import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { MobileLayerRow } from "./mobile-layer-row";

interface MobileLayersSheetProps {
  layers: Layer[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleVisible: (layer: Layer) => void;
  onClose: () => void;
}

export const MobileLayersSheet: React.FC<MobileLayersSheetProps> = ({ layers, selectedId, onSelect, onToggleVisible, onClose }) => {
  const topFirst = [...layers].reverse();

  return (
    <MobileSheet title="Layers" onClose={onClose}>
      {topFirst.length === 0 ? (
        <p className="m-0 px-5 py-8 text-center text-[13px] text-[var(--s-text-muted)]">
          No layers yet. Tap add to start.
        </p>
      ) : (
        <div className="flex flex-col pb-3">
          {topFirst.map((layer) => (
            <MobileLayerRow
              key={layer.id}
              layer={layer}
              selected={layer.id === selectedId}
              onSelect={onSelect}
              onToggleVisible={onToggleVisible}
            />
          ))}
        </div>
      )}
    </MobileSheet>
  );
};
