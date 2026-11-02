import React from "react";
import { ShieldCheck } from "lucide-react";
import { openMetadataCleaner } from "../../../metadata-cleaner/open-metadata-cleaner";

const ICON_SIZE = 13;
const ICON_STROKE = 1.75;

interface MetadataNoteProps {
  onClose: () => void;
}

const openCleaner = (onClose: () => void): void => {
  onClose();
  openMetadataCleaner("editor");
};

export const MetadataNote: React.FC<MetadataNoteProps> = ({ onClose }) => (
  <p className="m-0 flex items-start gap-1.5 text-[12px] leading-snug text-[var(--s-text-subtle)]">
    <ShieldCheck size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mt-px shrink-0" />
    <span>
      Camera details and AI labels are stripped from the file.{" "}
      <button
        type="button"
        onClick={() => openCleaner(onClose)}
        className="font-medium text-[var(--s-text-muted)] underline underline-offset-2 decoration-[var(--s-border)] hover:text-[var(--s-text)] hover:decoration-[var(--s-text)] transition-colors"
      >
        Clean another file
      </button>
    </span>
  </p>
);
