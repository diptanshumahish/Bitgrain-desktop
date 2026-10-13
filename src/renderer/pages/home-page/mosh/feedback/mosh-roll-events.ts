const MOSH_ROLL_KEY = "bg:mosh-roll";

export const emitMoshRoll = (): void => {
  document.dispatchEvent(new CustomEvent(MOSH_ROLL_KEY));
};

export const onMoshRoll = (handler: () => void): (() => void) => {
  document.addEventListener(MOSH_ROLL_KEY, handler);
  return () => document.removeEventListener(MOSH_ROLL_KEY, handler);
};
