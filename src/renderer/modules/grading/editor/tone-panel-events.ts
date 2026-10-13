const TONE_PANEL_KEY = "bg:tone-panel";

export type TonePanelCommand = "toggle" | "close";

const dispatchTonePanel = (command: TonePanelCommand): void => {
  document.dispatchEvent(new CustomEvent<TonePanelCommand>(TONE_PANEL_KEY, { detail: command }));
};

export const toggleTonePanel = (): void => dispatchTonePanel("toggle");

export const closeTonePanel = (): void => dispatchTonePanel("close");

export const onTonePanel = (handler: (command: TonePanelCommand) => void): (() => void) => {
  const listener = (event: Event): void => handler((event as CustomEvent<TonePanelCommand>).detail);
  document.addEventListener(TONE_PANEL_KEY, listener);
  return () => document.removeEventListener(TONE_PANEL_KEY, listener);
};
