import React from "react";
import { Check, TextCursorInput, ALargeSmall, Droplet, SlidersHorizontal, Copy, Trash2, ImageUp } from "lucide-react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { MobileBarAction } from "./mobile-bar-action";
import { ImageFileInput } from "./image-file-input";
import type { PickedImage } from "./read-picked-image";
import type { MobileSheetKind } from "../mobile-sheet-state";

interface MobileLayerActionsProps {
  layer: Layer;
  activeSheet: MobileSheetKind | null;
  onOpen: (kind: MobileSheetKind) => void;
  onDone: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onReplacePhoto: (image: PickedImage) => void;
}

const ICON_SIZE = 20;

export const MobileLayerActions: React.FC<MobileLayerActionsProps> = ({
  layer, activeSheet, onOpen, onDone, onDuplicate, onDelete, onReplacePhoto,
}) => {
  const isText = layer.type === "text";
  const isPhoto = layer.type === "image" || layer.type === "upload";
  const hasColor = isText || layer.type === "shape";

  return (
    <div className="flex items-center">
      <div className="shrink-0 pl-2 pr-1 border-r border-[var(--s-border)]">
        <MobileBarAction icon={<Check size={ICON_SIZE} strokeWidth={2.25} />} label="Done" onClick={onDone} />
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-0.5 px-1 overflow-x-auto no-scrollbar">
        {isText && <MobileBarAction icon={<TextCursorInput size={ICON_SIZE} strokeWidth={2} />} label="Edit text" active={activeSheet === "text"} onClick={() => onOpen("text")} />}
        {isPhoto && (
          <MobileBarAction icon={<ImageUp size={ICON_SIZE} strokeWidth={2} />} label="Replace">
            <ImageFileInput label="Replace photo" onPicked={onReplacePhoto} />
          </MobileBarAction>
        )}
        {isText && <MobileBarAction icon={<ALargeSmall size={ICON_SIZE} strokeWidth={2} />} label="Font" active={activeSheet === "font"} onClick={() => onOpen("font")} />}
        {hasColor && <MobileBarAction icon={<Droplet size={ICON_SIZE} strokeWidth={2} />} label="Color" active={activeSheet === "color"} onClick={() => onOpen("color")} />}
        <MobileBarAction icon={<SlidersHorizontal size={ICON_SIZE} strokeWidth={2} />} label="Adjust" active={activeSheet === "adjust"} onClick={() => onOpen("adjust")} />
        <MobileBarAction icon={<Copy size={ICON_SIZE} strokeWidth={2} />} label="Duplicate" onClick={onDuplicate} />
        <MobileBarAction icon={<Trash2 size={ICON_SIZE} strokeWidth={2} />} label="Delete" tone="danger" onClick={onDelete} />
      </div>
    </div>
  );
};
