import React from "react";
import { Undo2, Redo2 } from "lucide-react";
import { TopBarButton } from "@bitgrain/ui/components/TopBarButton";

interface TopBarUndoRedoProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
}

const ICON_SIZE = 13;

export const TopBarUndoRedo: React.FC<TopBarUndoRedoProps> = ({ canUndo, canRedo, onUndo, onRedo }) => (
  <div className="flex items-center gap-0.5">
    <TopBarButton label="Undo" shortcut="⌘Z" disabled={!canUndo} onClick={onUndo}>
      <Undo2 size={ICON_SIZE} strokeWidth={1.75} />
    </TopBarButton>
    <TopBarButton label="Redo" shortcut="⌘⇧Z" disabled={!canRedo} onClick={onRedo}>
      <Redo2 size={ICON_SIZE} strokeWidth={1.75} />
    </TopBarButton>
  </div>
);
