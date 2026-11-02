import React from "react";
import type { Layer, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import type { MobileSheetKind } from "./mobile-sheet-state";
import { closeMobileSheet } from "./mobile-sheet-state";
import { MobileTextSheet } from "./text/mobile-text-sheet";
import { MobileFontSheet } from "./layer-sheets/mobile-font-sheet";
import { MobileAdjustSheet } from "./layer-sheets/mobile-adjust-sheet";
import { MobileColorSheet } from "./color/mobile-color-sheet";

interface MobileLayerSheetHostProps {
  kind: MobileSheetKind;
  layer: Layer;
  palette: string[];
  onUpdate: (id: string, updates: Partial<Layer>) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
}

const layerColor = (layer: Layer): string | null => {
  if (layer.type === "text") return layer.color;
  if (layer.type === "shape") return layer.fill;
  return null;
};

const colorUpdate = (layer: Layer, color: string): Partial<Layer> =>
  layer.type === "text" ? ({ color } as Partial<TextLayer>) as Partial<Layer> : ({ fill: color } as Partial<Layer>);

export const MobileLayerSheetHost: React.FC<MobileLayerSheetHostProps> = ({ kind, layer, palette, onUpdate, onMoveUp, onMoveDown }) => {
  const update = (updates: Partial<Layer>): void => onUpdate(layer.id, updates);
  const currentColor = layerColor(layer);

  if (kind === "text" && layer.type === "text") {
    return <MobileTextSheet layer={layer} onUpdate={(updates) => update(updates as Partial<Layer>)} onClose={closeMobileSheet} />;
  }
  if (kind === "font" && layer.type === "text") {
    return <MobileFontSheet layer={layer} onUpdate={(updates) => update(updates as Partial<Layer>)} onClose={closeMobileSheet} />;
  }
  if (kind === "color" && currentColor !== null) {
    return (
      <MobileColorSheet
        title={layer.type === "text" ? "Text color" : "Fill color"}
        value={currentColor}
        palette={palette}
        onChange={(color) => update(colorUpdate(layer, color))}
        onClose={closeMobileSheet}
      />
    );
  }
  if (kind === "adjust") {
    return (
      <MobileAdjustSheet
        layer={layer}
        onUpdate={update}
        onMoveUp={() => onMoveUp(layer.id)}
        onMoveDown={() => onMoveDown(layer.id)}
        onClose={closeMobileSheet}
      />
    );
  }
  return null;
};
