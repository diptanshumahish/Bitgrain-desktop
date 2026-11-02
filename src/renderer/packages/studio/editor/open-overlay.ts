const OPEN_OVERLAY_SELECTOR = '[role="listbox"], [role="menu"], [data-popover-root]';

export const hasOpenOverlay = (): boolean => document.querySelector(OPEN_OVERLAY_SELECTOR) !== null;
