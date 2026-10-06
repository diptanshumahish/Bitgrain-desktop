import { emitModal } from "../../lib/event-bus";

interface SaveOrLeaveArgs {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onSaveAndGo: () => Promise<void>;
  onJustGo: () => void;
}

export const promptSaveOrLeave = ({
  title, message, confirmLabel, cancelLabel, onSaveAndGo, onJustGo,
}: SaveOrLeaveArgs): void => {
  emitModal({
    type: "confirm",
    title,
    message,
    confirmLabel,
    cancelLabel,
    onConfirm: onSaveAndGo,
    onCancel: onJustGo,
  });
};
