import React from "react";
import { Columns2, Redo2, Undo2 } from "lucide-react";
import { trackEvent } from "@bitgrain/platform/tracker";
import { useSignalValue } from "@bitgrain/core/signal";
import { canRedoSignal, canUndoSignal, redoHistory, undoHistory } from "../../state/history-store";
import { compareModeSignal } from "../../state/editor-view-store";
import { TopBarButton } from "@bitgrain/ui/components/TopBarButton";

const ICON_SIZE = 14;
const ICON_STROKE = 1.75;

interface TopBarHistoryProps {
  onToggleCompare: () => void;
}

const handleUndo = (): void => {
  undoHistory();
  trackEvent("home", "undo_triggered", { details: { source: "top_bar" } });
};

const handleRedo = (): void => {
  redoHistory();
  trackEvent("home", "redo_triggered", { details: { source: "top_bar" } });
};

export const TopBarHistory: React.FC<TopBarHistoryProps> = ({ onToggleCompare }) => {
  const canUndo = useSignalValue(canUndoSignal);
  const canRedo = useSignalValue(canRedoSignal);
  const compareMode = useSignalValue(compareModeSignal);
  return (
    <div className="flex items-center gap-0.5">
      <TopBarButton label="Undo" shortcut="⌘Z" disabled={!canUndo} onClick={handleUndo}>
        <Undo2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </TopBarButton>
      <TopBarButton label="Redo" shortcut="⌘⇧Z" disabled={!canRedo} onClick={handleRedo}>
        <Redo2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </TopBarButton>
      <TopBarButton label="Compare with the original" text="Compare" pressed={compareMode} onClick={onToggleCompare}>
        <Columns2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </TopBarButton>
    </div>
  );
};
