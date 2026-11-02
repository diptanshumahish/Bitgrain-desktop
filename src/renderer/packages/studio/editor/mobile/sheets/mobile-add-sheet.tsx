import React from "react";
import { Type, Square, Circle, Image as ImageIcon } from "lucide-react";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { SheetTile } from "../sheet-chrome/sheet-tile";
import { ImageFileInput } from "../bottom-bar/image-file-input";
import type { PickedImage } from "../bottom-bar/read-picked-image";

interface MobileAddSheetProps {
  onAddText: () => void;
  onAddRect: () => void;
  onAddCircle: () => void;
  onAddPhoto: (image: PickedImage) => void;
  onClose: () => void;
}

const ICON_SIZE = 22;

export const MobileAddSheet: React.FC<MobileAddSheetProps> = ({ onAddText, onAddRect, onAddCircle, onAddPhoto, onClose }) => (
  <MobileSheet title="Add to design" onClose={onClose}>
    <div className="grid grid-cols-2 gap-2 px-4 pb-4">
      <SheetTile icon={<Type size={ICON_SIZE} strokeWidth={2} />} label="Text" onClick={onAddText} />
      <SheetTile icon={<ImageIcon size={ICON_SIZE} strokeWidth={2} />} label="Photo">
        <ImageFileInput label="Add a photo" onPicked={onAddPhoto} />
      </SheetTile>
      <SheetTile icon={<Square size={ICON_SIZE} strokeWidth={2} />} label="Rectangle" onClick={onAddRect} />
      <SheetTile icon={<Circle size={ICON_SIZE} strokeWidth={2} />} label="Circle" onClick={onAddCircle} />
    </div>
  </MobileSheet>
);
