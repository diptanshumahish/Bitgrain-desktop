import React from "react";
import { BringToFront, SendToBack, Minus, Plus } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { SliderTrack } from "@bitgrain/ui/controls/panel/slider-track/slider-track";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { SheetRow } from "../sheet-chrome/sheet-row";
import { ImageFitButtons } from "./image-fit-buttons";
import { BlendModeSelect } from "./blend-mode-select";

interface MobileAdjustSheetProps {
  layer: Layer;
  onUpdate: (updates: Partial<Layer>) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onClose: () => void;
}

const SCALE_DOWN = 0.9;
const SCALE_UP = 1.1;
const MIN_SIZE = 8;
const PERCENT = 100;
const ICON_SIZE = 18;
const ROUND_BUTTON = "w-11 h-11 flex items-center justify-center rounded-xl bg-[var(--s-bg-input)] text-[var(--s-text)] active:bg-[var(--s-bg-input-hover)]";
const WIDE_BUTTON = "flex-1 h-11 flex items-center justify-center gap-2 rounded-xl bg-[var(--s-bg-input)] text-[13px] font-medium text-[var(--s-text)] active:bg-[var(--s-bg-input-hover)]";

const scaledPlacement = (layer: Layer, factor: number): Partial<Layer> => {
  const width = Math.max(MIN_SIZE, layer.width * factor);
  const height = Math.max(MIN_SIZE, layer.height * factor);
  return { width, height, x: layer.x - (width - layer.width) / 2, y: layer.y - (height - layer.height) / 2 };
};

export const MobileAdjustSheet: React.FC<MobileAdjustSheetProps> = ({ layer, onUpdate, onMoveUp, onMoveDown, onClose }) => {
  const isImage = layer.type === "image" || layer.type === "upload";

  return (
    <MobileSheet title="Adjust" onClose={onClose} dimmed={false}>
      <div className="flex flex-col pb-4">
        <SheetRow label={`Opacity ${Math.round(layer.opacity * PERCENT)}%`}>
          <div className="w-48">
            <SliderTrack
              ariaLabel="Opacity"
              min={0}
              max={PERCENT}
              step={1}
              value={Math.round(layer.opacity * PERCENT)}
              onChange={(opacity) => onUpdate({ opacity: opacity / PERCENT })}
            />
          </div>
        </SheetRow>
        <SheetRow label="Blend">
          <BlendModeSelect value={layer.blendMode} onChange={(blendMode) => onUpdate({ blendMode })} />
        </SheetRow>
        {layer.type !== "text" && (
          <SheetRow label="Size">
            <button type="button" onClick={() => onUpdate(scaledPlacement(layer, SCALE_DOWN))} aria-label="Make smaller" className={ROUND_BUTTON}>
              <Minus size={ICON_SIZE} strokeWidth={2} />
            </button>
            <button type="button" onClick={() => onUpdate(scaledPlacement(layer, SCALE_UP))} aria-label="Make bigger" className={ROUND_BUTTON}>
              <Plus size={ICON_SIZE} strokeWidth={2} />
            </button>
          </SheetRow>
        )}
        {isImage && (
          <SheetRow label="Photo fit">
            <ImageFitButtons value={layer.fit} onChange={(fit) => onUpdate({ fit })} />
          </SheetRow>
        )}
        <div className="flex gap-2 px-5 pt-3">
          <button type="button" onClick={onMoveUp} className={WIDE_BUTTON}>
            <BringToFront size={ICON_SIZE} strokeWidth={2} />
            Bring forward
          </button>
          <button type="button" onClick={onMoveDown} className={WIDE_BUTTON}>
            <SendToBack size={ICON_SIZE} strokeWidth={2} />
            Send back
          </button>
        </div>
      </div>
    </MobileSheet>
  );
};
