import React from "react";
import { CircleDot } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { resolvePrintSize } from "@bitgrain/studio-core/render/print/print-geometry";
import { papersMatchingAspect } from "@bitgrain/studio-core/render/print/paper-target";
import { OptionGroup } from "../export-popup/OptionGroup";
import { SegmentedControl } from "../export-popup/SegmentedControl";
import type { SegmentOption } from "../export-popup/SegmentedControl";
import { SwitchRow } from "../export-popup/SwitchRow";
import { lockDotSizeSignal, printPaperSignal } from "./print-export-state";

interface PrintPaperOptionsProps {
  page: TemplatePage;
}

const PAGE_SIZE_VALUE = "page";

const paperOptionsFor = (page: TemplatePage): SegmentOption<string>[] => {
  const native = resolvePrintSize(page.width, page.height);
  const papers = papersMatchingAspect(native).map((paper) => ({ label: paper.name, value: paper.name }));
  if (native.paperName) return papers;
  return [{ label: "Page size", value: PAGE_SIZE_VALUE }, ...papers];
};

const selectPaper = (value: string, nativeName: string | null): void => {
  printPaperSignal.value = value === PAGE_SIZE_VALUE || value === nativeName ? null : value;
};

const toggleLockDotSize = (): void => {
  lockDotSizeSignal.value = !lockDotSizeSignal.value;
};

export const PrintPaperOptions: React.FC<PrintPaperOptionsProps> = ({ page }) => {
  const paperName = useSignalValue(printPaperSignal);
  const lockDotSize = useSignalValue(lockDotSizeSignal);
  const options = paperOptionsFor(page);
  if (options.length < 2) return null;
  const nativeName = resolvePrintSize(page.width, page.height).paperName;
  const fallback = nativeName ?? PAGE_SIZE_VALUE;
  const selected = options.some((option) => option.value === paperName) ? (paperName ?? fallback) : fallback;

  return (
    <OptionGroup label="Paper">
      <SegmentedControl
        options={options}
        value={selected}
        onSelect={(value) => selectPaper(value, nativeName)}
        tone="solid"
        sizing="content"
      />
      <div className="-mx-3">
        <SwitchRow
          icon={CircleDot}
          label="Keep dot size"
          hint="Halftone and screen textures print at the same size on every paper, bigger sheets just get more dots"
          checked={lockDotSize}
          onToggle={toggleLockDotSize}
        />
      </div>
    </OptionGroup>
  );
};
