import { createEventChannel } from "@bitgrain/core/events/event-channel";

const DIALOG_KEY = "bg:dialog";

export type DialogEvent =
  | {
      type: "confirm";
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel?: () => void;
      confirmLabel?: string;
      cancelLabel?: string;
      danger?: boolean;
      safeDefault?: boolean;
    }
  | {
      type: "prompt";
      title: string;
      label?: string;
      notice?: string;
      defaultValue?: string;
      placeholder?: string;
      confirmLabel?: string;
      onSubmit: (value: string) => void;
    };

const dialogChannel = createEventChannel<DialogEvent>(DIALOG_KEY);

export const emitDialog = dialogChannel.emit;
export const onDialog = dialogChannel.on;
