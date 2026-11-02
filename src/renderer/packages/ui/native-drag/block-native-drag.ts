const OPT_IN_SELECTOR = '[draggable="true"]';

const elementOf = (target: EventTarget | null): Element | null => {
  if (target instanceof Element) return target;
  if (target instanceof Node) return target.parentElement;
  return null;
};

const blockUnlessOptedIn = (event: DragEvent): void => {
  if (elementOf(event.target)?.closest(OPT_IN_SELECTOR)) return;
  event.preventDefault();
};

const blockUnhandledDrop = (event: DragEvent): void => {
  if (!event.defaultPrevented) event.preventDefault();
};

export const installNativeDragBlock = (): void => {
  window.addEventListener("dragstart", blockUnlessOptedIn);
  window.addEventListener("dragover", blockUnhandledDrop);
  window.addEventListener("drop", blockUnhandledDrop);
};
