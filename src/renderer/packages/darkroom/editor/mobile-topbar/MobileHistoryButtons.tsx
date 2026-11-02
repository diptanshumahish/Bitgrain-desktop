import React from "react";
import { Redo2, Undo2 } from "lucide-react";
import { useSignalValue } from "@bitgrain/core/signal";
import { canRedoSignal, canUndoSignal, redoHistory, undoHistory } from "../../state/history-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { MobileTopBarButton } from "./MobileTopBarButton";

const ICON_SIZE = 18;
const ICON_STROKE = 1.75;

const handleUndo = (): void => {
  undoHistory();
  trackEvent("home", "undo_triggered", { details: { source: "mobile_topbar" } });
};

const handleRedo = (): void => {
  redoHistory();
  trackEvent("home", "redo_triggered", { details: { source: "mobile_topbar" } });
};

export const MobileHistoryButtons: React.FC = () => {
  const canUndo = useSignalValue(canUndoSignal);
  const canRedo = useSignalValue(canRedoSignal);
  return (
    <>
      <MobileTopBarButton label="Undo" onClick={handleUndo} disabled={!canUndo}>
        <Undo2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </MobileTopBarButton>
      <MobileTopBarButton label="Redo" onClick={handleRedo} disabled={!canRedo}>
        <Redo2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      </MobileTopBarButton>
    </>
  );
};
