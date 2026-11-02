import React from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { SelectionBox } from "../../canvas/selection-box";
import { SelectionHandles } from "../SelectionHandles";
import { type HandleDir } from "@bitgrain/studio-core/layers/handle-dir";

interface MaskedSelectionChromeProps {
  layer: Layer;
  scale: number;
  zIndex: number;
  onResizeDelta: (dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: () => void;
}

const chromeTransform = (layer: Layer): string | undefined => {
  const rotation = (layer as { rotation?: number }).rotation ?? 0;
  const flipX = layer.flipH ? -1 : 1;
  const flipY = layer.flipV ? -1 : 1;
  if (!rotation && flipX === 1 && flipY === 1) return undefined;
  return `rotate(${rotation}deg) scaleX(${flipX}) scaleY(${flipY})`;
};

export const MaskedSelectionChrome: React.FC<MaskedSelectionChromeProps> = ({ layer, scale, zIndex, onResizeDelta, onResizeEnd }) => (
  <div
    className="absolute origin-center pointer-events-none"
    style={{ left: layer.x, top: layer.y, width: layer.width, height: layer.height, zIndex, transform: chromeTransform(layer) }}
  >
    <SelectionBox width={layer.width} height={layer.height} zoom={scale} />
    <SelectionHandles scale={scale} boxWidth={layer.width} boxHeight={layer.height} onResizeDelta={onResizeDelta} onResizeEnd={onResizeEnd} />
  </div>
);
