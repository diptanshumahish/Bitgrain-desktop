import { createEventChannel } from "@bitgrain/core/events/event-channel";

const UNDO_TOAST_KEY = "bg:undo-toast";

export interface UndoToastMessage {
  title: string;
  detail: string;
  actionLabel?: string;
  onUndo: () => void;
  onExpire: () => void;
}

const undoToastChannel = createEventChannel<UndoToastMessage>(UNDO_TOAST_KEY);

export const emitUndoToast = undoToastChannel.emit;
export const onUndoToast = undoToastChannel.on;

