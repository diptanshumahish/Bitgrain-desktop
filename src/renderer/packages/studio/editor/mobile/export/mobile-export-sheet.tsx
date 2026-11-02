import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { exportPopupSignal } from "../../../panels/export-state";
import { MobileSheet } from "../sheet-chrome/mobile-sheet";
import { MobileChoiceGroup, type MobileChoice } from "./mobile-choice-group";
import { MobileExportActions } from "./mobile-export-actions";
import { MobileExportPlanNote } from "./mobile-export-plan-note";
import { resolvePageSize, type PageSize } from "./run-mobile-export";
import { canShareFile } from "./share-or-download";
import {
  MOBILE_EXPORT_SCALE,
  mobileExportFormatSignal,
  mobileExportSizeSignal,
  resetMobileExport,
  type MobileExportFormat,
  type MobileExportSize,
} from "./mobile-export-state";

const FORMAT_CHOICES: MobileChoice<MobileExportFormat>[] = [
  { value: "image/png", label: "PNG", detail: "Best quality" },
  { value: "image/jpeg", label: "JPG", detail: "Smaller file" },
];

const SIZE_LABELS: Record<MobileExportSize, string> = { standard: "Standard", high: "High", max: "Max" };
const SIZE_ORDER: MobileExportSize[] = ["standard", "high", "max"];
const PROBE_FILE_NAME = "probe.png";

const sizeChoices = (page: PageSize): MobileChoice<MobileExportSize>[] =>
  SIZE_ORDER.map((size) => ({
    value: size,
    label: SIZE_LABELS[size],
    detail: `${Math.round(page.width * MOBILE_EXPORT_SCALE[size])} × ${Math.round(page.height * MOBILE_EXPORT_SCALE[size])}`,
  }));

const closeExport = (): void => {
  resetMobileExport();
  exportPopupSignal.value = null;
};

const shareSupported = (): boolean => canShareFile(new File([], PROBE_FILE_NAME, { type: "image/png" }));

export const MobileExportSheet: React.FC = () => {
  const data = useSignalValue(exportPopupSignal);
  const format = useSignalValue(mobileExportFormatSignal);
  const size = useSignalValue(mobileExportSizeSignal);
  if (!data) return null;
  const page = resolvePageSize(data);
  const pageCount = data.pages?.length ?? 1;
  const longEdge = Math.max(page.width, page.height) * MOBILE_EXPORT_SCALE[size];

  return (
    <MobileSheet
      title="Export"
      onClose={closeExport}
      placement="full"
      footer={<MobileExportActions data={data} shareSupported={shareSupported()} />}
    >
      <div className="flex flex-col gap-5 px-4 pb-4">
        {pageCount > 1 && (
          <p className="m-0 text-[12px] text-[var(--s-text-muted)]">Exports the page you are on. Switch pages to export another.</p>
        )}
        <MobileChoiceGroup title="Format" choices={FORMAT_CHOICES} value={format} onSelect={(next) => { mobileExportFormatSignal.value = next; }} />
        <MobileChoiceGroup title="Size" choices={sizeChoices(page)} value={size} onSelect={(next) => { mobileExportSizeSignal.value = next; }} />
        <MobileExportPlanNote requestedLongEdge={Math.round(longEdge)} />
      </div>
    </MobileSheet>
  );
};
