import React from "react";
import { FilePlus2 } from "lucide-react";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { SheetListItem } from "../sheet-chrome/sheet-list-item";

interface MobilePagesSheetProps {
  pages: TemplatePage[];
  activePageId: string;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onClose: () => void;
}

const ICON_SIZE = 18;

const pageLabel = (page: TemplatePage, index: number): string => page.name || `Page ${index + 1}`;

export const MobilePagesSheet: React.FC<MobilePagesSheetProps> = ({ pages, activePageId, onSelectPage, onAddPage, onClose }) => (
  <MobileSheet
    title={`Pages, ${pages.length}`}
    onClose={onClose}
    footer={
      <button
        type="button"
        onClick={onAddPage}
        className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[var(--s-bg-input)] text-[14px] font-medium text-[var(--s-text)] active:bg-[var(--s-bg-input-hover)]"
      >
        <FilePlus2 size={ICON_SIZE} strokeWidth={2} />
        Add a page
      </button>
    }
  >
    <div className="flex flex-col pb-2">
      {pages.map((page, index) => (
        <SheetListItem
          key={page.id}
          icon={<span className="text-[13px] font-semibold tabular-nums">{index + 1}</span>}
          label={pageLabel(page, index)}
          detail={`${Math.round(page.width)} × ${Math.round(page.height)}`}
          active={page.id === activePageId}
          onClick={() => onSelectPage(page.id)}
        />
      ))}
    </div>
  </MobileSheet>
);
