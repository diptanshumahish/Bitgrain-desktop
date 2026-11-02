import React from "react";
import { Scaling, Frame, FilePlus2 } from "lucide-react";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { SheetListItem } from "../sheet-chrome/sheet-list-item";

interface MobileMoreSheetProps {
  onResize: () => void;
  onMockup: () => void;
  onAddPage: () => void;
  onClose: () => void;
}

const ICON_SIZE = 18;

export const MobileMoreSheet: React.FC<MobileMoreSheetProps> = ({ onResize, onMockup, onAddPage, onClose }) => (
  <MobileSheet title="More" onClose={onClose}>
    <div className="flex flex-col pb-3">
      <SheetListItem icon={<Scaling size={ICON_SIZE} strokeWidth={2} />} label="Resize" detail="Make copies for other sizes" onClick={onResize} />
      <SheetListItem icon={<Frame size={ICON_SIZE} strokeWidth={2} />} label="Mockup" detail="Place your design in a scene" onClick={onMockup} />
      <SheetListItem icon={<FilePlus2 size={ICON_SIZE} strokeWidth={2} />} label="Add a page" detail="Start a blank page at this size" onClick={onAddPage} />
    </div>
  </MobileSheet>
);
