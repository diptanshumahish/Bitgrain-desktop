import React, { memo } from "react";
import { Crop, Scissors, Trash2 } from "lucide-react";
import { emitDarkroomModal } from "../../modals/darkroom-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { useSignalValue } from "@bitgrain/core/signal";
import { isSampleSignal } from "../../state/image-store";
import { LoopPreviewToggle } from "../../loop/preview/LoopPreviewToggle";
import { removalStatusSignal } from "../../background-removal/removal-status-store";
import { removeDarkroomBackground } from "../../background-removal/actions/remove-darkroom-background";
import { clearImageWithUndo } from "../clear-image-with-undo";
import { TopBarButton } from "@bitgrain/ui/components/TopBarButton";

const ICON_SIZE = 14;
const ICON_STROKE = 1.75;

const openCrop = (): void => {
  trackEvent("home", "modal_opened", { details: { modal: "crop", source: "canvas_tools" } });
  emitDarkroomModal({ type: "crop" });
};

const clearImage = (): void => {
  trackEvent("home", "image_cleared", { details: { is_sample: isSampleSignal.value } });
  clearImageWithUndo();
};

const CanvasToolsView: React.FC = () => {
  const removing = useSignalValue(removalStatusSignal) !== null;
  return (
    <div className="flex items-center gap-0.5">
      <TopBarButton label="Crop" text="Crop" onClick={openCrop}>
        <Crop size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </TopBarButton>
      <TopBarButton label="Remove background" text="Cut out" disabled={removing} onClick={() => { void removeDarkroomBackground(); }}>
        <Scissors size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </TopBarButton>
      <LoopPreviewToggle />
      <div aria-hidden className="w-px h-4 bg-[var(--s-border)] mx-1" />
      <TopBarButton label="Clear image" onClick={clearImage}>
        <Trash2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </TopBarButton>
    </div>
  );
};

export const CanvasTools = memo(CanvasToolsView);
