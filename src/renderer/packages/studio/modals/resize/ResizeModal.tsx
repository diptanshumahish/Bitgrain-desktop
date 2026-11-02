import React, { useEffect } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { StudioDialogShell } from "@bitgrain/ui/dialogs/StudioDialogShell";
import { RESIZE_FORMAT_GROUPS } from "@bitgrain/studio-core/resize-formats/resize-format-groups";
import { RESIZE_KITS, type ResizeKit } from "@bitgrain/studio-core/resize-formats/resize-kits";
import {
  FREE_RESIZE_FORMAT_LIMIT,
  openResizeUpgradePrompt,
  useCanResizeToManyFormats,
} from "@bitgrain/platform/plans/gate/pro-features/resize-formats-gate";
import { clearResizeSelection, resizeSelectionSignal, selectResizeFormats, toggleResizeFormat } from "./resize-selection-signal";
import { ResizeKitCard } from "./resize-kit-card";
import { ResizeFormatSection } from "./resize-format-section";
import { ResizeFooter } from "./resize-footer";

interface ResizeModalProps {
  sourceWidth: number;
  sourceHeight: number;
  onApply: (formatIds: string[]) => void;
  onClose: () => void;
}

export const ResizeModal: React.FC<ResizeModalProps> = ({ sourceWidth, sourceHeight, onApply, onClose }) => {
  const selected = useSignalValue(resizeSelectionSignal);
  const canPickMany = useCanResizeToManyFormats();

  useEffect(() => clearResizeSelection, []);

  const pickKit = (kit: ResizeKit): void => {
    if (canPickMany) selectResizeFormats(kit.formatIds);
    else openResizeUpgradePrompt(`resize_${kit.id}`);
  };

  const apply = (): void => {
    if (selected.size === 0) return;
    if (selected.size > FREE_RESIZE_FORMAT_LIMIT && !canPickMany) {
      openResizeUpgradePrompt("resize_apply_many");
      return;
    }
    onClose();
    onApply([...selected]);
  };

  return (
    <StudioDialogShell
      title="Resize to formats"
      description="Pick sizes and we lay your design out in each one. Predictable, no AI."
      widthClass="max-w-3xl"
      onClose={onClose}
      footer={
        <ResizeFooter
          count={selected.size}
          canPickMany={canPickMany}
          onApply={apply}
          onUnlock={() => openResizeUpgradePrompt("resize_footer")}
        />
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {RESIZE_KITS.map((kit) => (
          <ResizeKitCard key={kit.id} kit={kit} isLocked={!canPickMany} onPick={pickKit} />
        ))}
      </div>
      <div className="flex flex-col gap-6">
        {RESIZE_FORMAT_GROUPS.map((group) => (
          <ResizeFormatSection
            key={group.id}
            group={group}
            selected={selected}
            sourceWidth={sourceWidth}
            sourceHeight={sourceHeight}
            onToggle={(id) => toggleResizeFormat(id, canPickMany)}
          />
        ))}
      </div>
    </StudioDialogShell>
  );
};
