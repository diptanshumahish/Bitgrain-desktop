import React from "react";
import { Film, Layers } from "lucide-react";
import { emitModal } from "../../../lib/event-bus";
import { trackEvent } from "../../../lib/tracker";
import { PlatformSizeGrid } from "./PlatformSizeGrid";
import { SvgExportRow } from "./SvgExportRow";

interface ExportMoreFormatsProps {
  isLUT: boolean;
  transparentBg: boolean;
  effectiveTransparent: boolean;
  plan: string;
  onDownloadSvg: (transparent: boolean) => void;
  onClose: () => void;
}

const ICON_SIZE = 12;
const ICON_STROKE = 1.6;
const ROW_CLASS = "flex items-center justify-between gap-2 px-2 py-1.5 rounded-md text-left text-[12px] text-[var(--s-text)] hover:bg-[var(--s-bg-input-hover)] transition-colors";
const HINT_CLASS = "block text-[12px] text-[var(--s-text-subtle)]";

const openModal = (modal: "riso-export" | "animate", onClose: () => void): void => {
  trackEvent("home", "modal_opened", { details: { modal, source: "export_menu" } });
  emitModal({ type: modal });
  onClose();
};

export const ExportMoreFormats: React.FC<ExportMoreFormatsProps> = ({
  isLUT, transparentBg, effectiveTransparent, plan, onDownloadSvg, onClose,
}) => (
  <>
    {!isLUT && <SvgExportRow transparentBg={transparentBg} plan={plan} onDownloadSvg={onDownloadSvg} onClose={onClose} />}
    <button type="button" onClick={() => openModal("riso-export", onClose)} className={ROW_CLASS}>
      <span className="flex items-start gap-2">
        <Layers size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mt-0.5" />
        <span>Print layers<span className={HINT_CLASS}>One file per ink, for risograph printing</span></span>
      </span>
    </button>
    <button type="button" onClick={() => openModal("animate", onClose)} className={ROW_CLASS}>
      <span className="flex items-start gap-2">
        <Film size={ICON_SIZE} strokeWidth={ICON_STROKE} className="mt-0.5" />
        <span>Animated video<span className={HINT_CLASS}>A short moving loop as MP4</span></span>
      </span>
    </button>
    <PlatformSizeGrid transparent={effectiveTransparent} onClose={onClose} />
  </>
);
