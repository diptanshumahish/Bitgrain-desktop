const STATUS_TOAST_KEY = "bg:status-toast";

export interface StatusToastMessage {
  title: string;
  detail: string;
}

export const emitStatusToast = (message: StatusToastMessage): void => {
  document.dispatchEvent(new CustomEvent<StatusToastMessage>(STATUS_TOAST_KEY, { detail: message }));
};

export const onStatusToast = (handler: (message: StatusToastMessage) => void): (() => void) => {
  const listener = (event: Event): void => handler((event as CustomEvent<StatusToastMessage>).detail);
  document.addEventListener(STATUS_TOAST_KEY, listener);
  return () => document.removeEventListener(STATUS_TOAST_KEY, listener);
};
