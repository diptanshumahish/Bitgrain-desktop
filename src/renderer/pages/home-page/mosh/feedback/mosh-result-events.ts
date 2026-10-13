const MOSH_RESULT_KEY = "bg:mosh-result";

export interface MoshResult {
  title: string;
  detail: string;
  reason: string;
}

export const emitMoshResult = (result: MoshResult): void => {
  document.dispatchEvent(new CustomEvent<MoshResult>(MOSH_RESULT_KEY, { detail: result }));
};

export const onMoshResult = (handler: (result: MoshResult) => void): (() => void) => {
  const listener = (event: Event): void => handler((event as CustomEvent<MoshResult>).detail);
  document.addEventListener(MOSH_RESULT_KEY, listener);
  return () => document.removeEventListener(MOSH_RESULT_KEY, listener);
};
