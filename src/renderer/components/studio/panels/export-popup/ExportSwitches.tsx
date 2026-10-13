import React from "react";
import { Files, Printer, SunMedium } from "lucide-react";
import { BLEED_MM } from "../../hooks/export/print/print-layout";
import { SwitchRow } from "./SwitchRow";

interface ExportSwitchesProps {
  pageCount: number;
  allPages: boolean;
  printMode: boolean;
  hdr: boolean;
  onToggleAllPages: () => void;
  onTogglePrintMode: () => void;
  onToggleHdr: () => void;
}

export const ExportSwitches: React.FC<ExportSwitchesProps> = ({
  pageCount,
  allPages,
  printMode,
  hdr,
  onToggleAllPages,
  onTogglePrintMode,
  onToggleHdr,
}) => (
  <div className="flex flex-col -mx-3">
    {pageCount > 1 && (
      <SwitchRow
        icon={Files}
        label="All pages"
        hint={`Export all ${pageCount} pages in one go`}
        checked={allPages}
        onToggle={onToggleAllPages}
      />
    )}
    <SwitchRow
      icon={Printer}
      label="Print ready"
      hint={`PDF at true paper size with ${BLEED_MM}mm bleed, crop marks and a preflight check`}
      checked={printMode}
      onToggle={onTogglePrintMode}
    />
    {!printMode && (
      <SwitchRow
        icon={SunMedium}
        label="HDR"
        hint="Brighter highlights on HDR screens in Chrome and Safari"
        checked={hdr}
        onToggle={onToggleHdr}
      />
    )}
  </div>
);
