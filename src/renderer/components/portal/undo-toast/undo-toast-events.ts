const UNDO_TOAST_KEY = "bg:undo-toast";

export interface UndoToastMessage {
  title: string;
  detail: string;
  onUndo: () => void;
  onExpire: () => void;
}

export const emitUndoToast = (message: UndoToastMessage): void => {
  document.dispatchEvent(new CustomEvent<UndoToastMessage>(UNDO_TOAST_KEY, { detail: message }));
};

export const onUndoToast = (handler: (message: UndoToastMessage) => void): (() => void) => {
  const listener = (event: Event): void => handler((event as CustomEvent<UndoToastMessage>).detail);
  document.addEventListener(UNDO_TOAST_KEY, listener);
  return () => document.removeEventListener(UNDO_TOAST_KEY, listener);
};
