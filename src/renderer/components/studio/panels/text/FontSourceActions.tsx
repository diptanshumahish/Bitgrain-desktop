import React from "react";
import { Monitor, Upload } from "lucide-react";
import type { CustomFontEntry } from "../../../../data/studioTypes";
import { FontUploadButton } from "../../fonts/FontUploadButton";

const ICON_BUTTON_CLASS =
  "w-6 h-6 rounded-md flex items-center justify-center border-none bg-transparent text-[var(--s-text-subtle)] hover:text-[var(--s-text)] hover:bg-[var(--s-bg-input)] transition-colors cursor-pointer";

interface FontSourceActionsProps {
  showSystemFonts: boolean;
  loadingSystemFonts: boolean;
  onLoadSystemFonts: () => void;
  onFontUploaded?: (font: CustomFontEntry) => void;
}

export const FontSourceActions: React.FC<FontSourceActionsProps> = ({
  showSystemFonts, loadingSystemFonts, onLoadSystemFonts, onFontUploaded,
}) => (
  <>
    {showSystemFonts && (
      <button type="button" title="Use fonts installed on this computer" onClick={onLoadSystemFonts} className={ICON_BUTTON_CLASS}>
        <Monitor size={13} strokeWidth={1.75} className={loadingSystemFonts ? "animate-pulse" : ""} />
      </button>
    )}
    {onFontUploaded && (
      <FontUploadButton className={ICON_BUTTON_CLASS} title="Upload a font" onUploaded={onFontUploaded}>
        <Upload size={13} strokeWidth={1.75} />
      </FontUploadButton>
    )}
  </>
);
