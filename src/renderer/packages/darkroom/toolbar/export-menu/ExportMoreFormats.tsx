import React from "react";
import { Film, Layers, Repeat } from "lucide-react";
import { emitDarkroomModal } from "../../modals/darkroom-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { PlatformSizeGrid } from "./platform/PlatformSizeGrid";
import { SvgExportRow } from "./SvgExportRow";
import { ExportOptionRow } from "./ExportOptionRow";
import { TextExportRows } from "../../editor/export/TextExportRows";
import { openLoopExport } from "../../loop/export/open-loop-export";

interface ExportMoreFormatsProps {
  isLUT: boolean;
  transparentBg: boolean;
  effectiveTransparent: boolean;
  plan: string;
  showsWatermark: boolean;
  onDownloadSvg: (transparent: boolean) => void;
  onClose: () => void;
}

const openLoop = (onClose: () => void): void => {
  openLoopExport("export_menu");
  onClose();
};

const openModal = (modal: "riso-export" | "animate", onClose: () => void): void => {
  trackEvent("home", "modal_opened", { details: { modal, source: "export_menu" } });
  emitDarkroomModal({ type: modal });
  onClose();
};

export const ExportMoreFormats: React.FC<ExportMoreFormatsProps> = ({
  isLUT, transparentBg, effectiveTransparent, plan, showsWatermark, onDownloadSvg, onClose,
}) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col -mx-2">
      {!isLUT && <SvgExportRow transparentBg={transparentBg} plan={plan} onDownloadSvg={onDownloadSvg} onClose={onClose} />}
      <TextExportRows onClose={onClose} />
      <ExportOptionRow icon={Layers} title="Print layers" hint="One file per ink, for risograph printing" onClick={() => openModal("riso-export", onClose)} />
      <ExportOptionRow icon={Film} title="Animated video" hint="A short moving loop as MP4" onClick={() => openModal("animate", onClose)} />
      <ExportOptionRow icon={Repeat} title="Animated loop" hint="Moving grain or boiling dots, as MP4 or GIF" onClick={() => openLoop(onClose)} />
    </div>
    <PlatformSizeGrid transparent={effectiveTransparent} showsWatermark={showsWatermark} onClose={onClose} />
  </div>
);
