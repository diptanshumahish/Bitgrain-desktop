import { createEventChannel } from "@bitgrain/core/events/event-channel";

const STATUS_TOAST_KEY = "bg:status-toast";

interface StatusToastAction {
  label: string;
  href: string;
}

export interface StatusToastMessage {
  title: string;
  detail: string;
  action?: StatusToastAction;
}

const statusToastChannel = createEventChannel<StatusToastMessage>(STATUS_TOAST_KEY);

export const emitStatusToast = statusToastChannel.emit;
export const onStatusToast = statusToastChannel.on;

