import React from "react";
import { FreeSizeCapNote } from "./FreeSizeCapNote";
import { MetadataNote } from "./MetadataNote";
import { DownloadButton } from "./DownloadButton";
import { WatermarkExportChoice } from "./WatermarkExportChoice";

const PACK_TRIGGER = "export_dialog";

interface ExportDownloadFooterProps {
  label: string;
  sizeLabel: string;
  scale: number;
  showsWatermark: boolean;
  packNote: string | null;
  onDownload: () => void;
  onClose: () => void;
}

export const ExportDownloadFooter: React.FC<ExportDownloadFooterProps> = ({
  label, sizeLabel, scale, showsWatermark, packNote, onDownload, onClose,
}) => (
  <div className="flex flex-col gap-2.5 px-4 pt-3 pb-4 border-t border-[var(--s-border)]">
    {showsWatermark && <FreeSizeCapNote scale={scale} />}
    {showsWatermark ? (
      <WatermarkExportChoice label={label} sizeLabel={sizeLabel} trigger={PACK_TRIGGER} onDownload={onDownload} onClose={onClose} />
    ) : (
      <DownloadButton label={label} sizeLabel={sizeLabel} tone="primary" onClick={onDownload} />
    )}
    {packNote && <p className="m-0 text-[12px] text-[var(--s-text-subtle)]">{packNote}</p>}
    <MetadataNote onClose={onClose} />
  </div>
);
