import React from "react";
import { Download, Loader2, Share } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import type { ExportPopupData } from "../../../panels/export-state";
import { mobileExportFileSignal, mobileExportStatusSignal } from "./mobile-export-state";
import { finishDelivery, runMobileExport } from "./run-mobile-export";
import { downloadFile } from "./share-or-download";

interface MobileExportActionsProps {
  data: ExportPopupData;
  shareSupported: boolean;
}

const ICON_SIZE = 17;
const PRIMARY_CLASS =
  "w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[var(--s-accent)] text-[var(--s-accent-text)] text-[15px] font-semibold disabled:opacity-70";

const primaryLabel = (status: string, shareSupported: boolean): string => {
  if (status === "rendering") return "Preparing image";
  if (status === "ready") return "Share image";
  return shareSupported ? "Share image" : "Download image";
};

export const MobileExportActions: React.FC<MobileExportActionsProps> = ({ data, shareSupported }) => {
  const status = useSignalValue(mobileExportStatusSignal);
  const file = useSignalValue(mobileExportFileSignal);

  const handlePrimary = (): void => {
    if (status === "ready" && file) void finishDelivery(file);
    else void runMobileExport(data);
  };

  const icon = status === "rendering"
    ? <Loader2 size={ICON_SIZE} className="animate-spin" />
    : shareSupported ? <Share size={ICON_SIZE} strokeWidth={2.25} /> : <Download size={ICON_SIZE} strokeWidth={2.25} />;

  return (
    <div className="flex flex-col gap-1">
      <button type="button" onClick={handlePrimary} disabled={status === "rendering"} className={PRIMARY_CLASS}>
        {icon}
        {primaryLabel(status, shareSupported)}
      </button>
      {status === "ready" && file && (
        <button type="button" onClick={() => downloadFile(file)} className="h-11 text-[13px] font-medium text-[var(--s-text-muted)]">
          Download instead
        </button>
      )}
    </div>
  );
};
