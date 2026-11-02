import React, { useRef } from "react";
import { Columns2, Crop, MoreHorizontal, Newspaper, Palette, Scissors, SunMedium, Trash2 } from "lucide-react";
import { MobileUtilButton } from "./MobileUtilButton";
import { RollingDiceIcon } from "../rolling-dice/RollingDiceIcon";
import { useEdgeFade, EDGE_FADE_CLASS } from "./use-edge-fade";
import { emitDarkroomModal } from "../../modals/darkroom-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { ToolbarState } from "../use-toolbar-state";
import { useSignalValue } from "@bitgrain/core/signal";
import { compareModeSignal } from "../../state/editor-view-store";
import { removalStatusSignal } from "../../background-removal/removal-status-store";
import { removeDarkroomBackground } from "../../background-removal/actions/remove-darkroom-background";

interface MobileQuickActionsProps {
  state: ToolbarState;
  onToggleCompare: () => void;
  onClear: () => void;
  onMosh: () => void;
  onOpenSheet: (key: "tone" | "more") => void;
}

const ICON_SIZE = 18;

const openCropModal = (): void => {
  trackEvent("home", "modal_opened", { details: { modal: "crop", source: "mobile_toolbar" } });
  emitDarkroomModal({ type: "crop" });
};

const handleRemoveBackground = (): void => {
  void removeDarkroomBackground();
};

export const MobileQuickActions: React.FC<MobileQuickActionsProps> = ({ state: s, onToggleCompare, onClear, onMosh, onOpenSheet }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  useEdgeFade(scrollerRef);
  const removing = useSignalValue(removalStatusSignal) !== null;
  const compareMode = useSignalValue(compareModeSignal);

  return (
    <div ref={scrollerRef} data-fade="none" className={`flex items-center gap-0.5 px-2 pt-1.5 overflow-x-auto no-scrollbar ${EDGE_FADE_CLASS}`}>
      <MobileUtilButton icon={<Columns2 size={ICON_SIZE} strokeWidth={1.75} />} label="Compare" active={compareMode} onClick={onToggleCompare} />
      <MobileUtilButton icon={<Crop size={ICON_SIZE} strokeWidth={1.75} />} label="Crop" onClick={openCropModal} />
      <MobileUtilButton icon={<Scissors size={ICON_SIZE} strokeWidth={1.75} />} label="Cut out" disabled={removing} onClick={handleRemoveBackground} />
      <MobileUtilButton icon={<SunMedium size={ICON_SIZE} strokeWidth={1.75} />} label="Tone" onClick={() => onOpenSheet("tone")} />
      <div data-tutorial="home-print" className="shrink-0">
        <MobileUtilButton icon={<Newspaper size={ICON_SIZE} strokeWidth={1.75} />} label="Paper" active={s.printFinish} onClick={() => { s.setPrintFinish(!s.printFinish); s.onDone(); }} />
      </div>
      <MobileUtilButton icon={<Palette size={ICON_SIZE} strokeWidth={1.75} />} label="Keep colour" active={s.isColor} onClick={s.toggleIsColor} />
      <MobileUtilButton icon={<RollingDiceIcon size={ICON_SIZE} />} label="Shuffle" onClick={onMosh} />
      <MobileUtilButton icon={<Trash2 size={ICON_SIZE} strokeWidth={1.75} />} label="Clear" onClick={onClear} />
      <MobileUtilButton icon={<MoreHorizontal size={ICON_SIZE} strokeWidth={1.75} />} label="More" onClick={() => onOpenSheet("more")} />
    </div>
  );
};
