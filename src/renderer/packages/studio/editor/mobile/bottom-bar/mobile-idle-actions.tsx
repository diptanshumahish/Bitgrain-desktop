import React from "react";
import { Plus, Palette, Layers, Files, Ellipsis } from "lucide-react";
import { MobileBarAction } from "./mobile-bar-action";
import type { MobileSheetKind } from "../mobile-sheet-state";

interface MobileIdleActionsProps {
  activeSheet: MobileSheetKind | null;
  pageCount: number;
  onOpen: (kind: MobileSheetKind) => void;
}

const ICON_SIZE = 20;

export const MobileIdleActions: React.FC<MobileIdleActionsProps> = ({ activeSheet, pageCount, onOpen }) => (
  <div className="flex items-center gap-1 px-2">
    <MobileBarAction icon={<Plus size={ICON_SIZE} strokeWidth={2} />} label="Add" active={activeSheet === "add"} onClick={() => onOpen("add")} />
    <MobileBarAction icon={<Palette size={ICON_SIZE} strokeWidth={2} />} label="Background" active={activeSheet === "background"} onClick={() => onOpen("background")} />
    <MobileBarAction icon={<Layers size={ICON_SIZE} strokeWidth={2} />} label="Layers" active={activeSheet === "layers"} onClick={() => onOpen("layers")} />
    {pageCount > 1 && (
      <MobileBarAction icon={<Files size={ICON_SIZE} strokeWidth={2} />} label={`Pages ${pageCount}`} active={activeSheet === "pages"} onClick={() => onOpen("pages")} />
    )}
    <MobileBarAction icon={<Ellipsis size={ICON_SIZE} strokeWidth={2} />} label="More" active={activeSheet === "more"} onClick={() => onOpen("more")} />
  </div>
);
