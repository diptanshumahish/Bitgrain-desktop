const MAX_FOCUS_FRAMES = 10;

export const focusWhenShown = (field: HTMLTextAreaElement): (() => void) => {
  let frame = 0;
  let attempts = 0;
  const attempt = (): void => {
    field.focus({ preventScroll: true });
    field.setSelectionRange(field.value.length, field.value.length);
    attempts += 1;
    if (document.activeElement !== field && attempts < MAX_FOCUS_FRAMES) frame = requestAnimationFrame(attempt);
  };
  frame = requestAnimationFrame(attempt);
  return () => cancelAnimationFrame(frame);
};
