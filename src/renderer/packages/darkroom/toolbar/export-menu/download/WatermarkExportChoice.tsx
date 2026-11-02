import React, { useEffect } from "react";
import { trackEvent } from "@bitgrain/platform/tracker";
import { ExportPackButton } from "@bitgrain/platform/billing/export-pack/ExportPackButton";
import { OrDivider } from "@bitgrain/platform/billing/export-pack/OrDivider";
import { useExportPackOffer } from "@bitgrain/platform/billing/export-pack/use-export-pack-offer";
import { DownloadButton } from "./DownloadButton";
import { WatermarkNote } from "./WatermarkNote";

interface WatermarkExportChoiceProps {
  label: string;
  sizeLabel: string;
  trigger: string;
  onDownload: () => void;
  onClose: () => void;
}

export const WatermarkExportChoice: React.FC<WatermarkExportChoiceProps> = ({ label, sizeLabel, trigger, onDownload, onClose }) => {
  const offer = useExportPackOffer();

  useEffect(() => {
    trackEvent("payment", "export_choice_shown", { details: { pack_available: offer.available, trigger } });
  }, [offer.available, trigger]);

  const downloadWatermarked = (): void => {
    trackEvent("payment", "watermarked_download_chosen", { details: { pack_available: offer.available, trigger } });
    onDownload();
  };

  if (!offer.available) {
    return (
      <>
        <DownloadButton label={label} sizeLabel={sizeLabel} tone="primary" onClick={downloadWatermarked} />
        <WatermarkNote onClose={onClose} />
      </>
    );
  }

  return (
    <>
      <ExportPackButton trigger={trigger} leadingDivider={false} emphasis />
      <OrDivider compact={false} />
      <DownloadButton label={`${label} with watermark`} sizeLabel={sizeLabel} tone="quiet" onClick={downloadWatermarked} />
      <WatermarkNote onClose={onClose} />
    </>
  );
};
