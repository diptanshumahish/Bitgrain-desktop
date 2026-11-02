interface EventChannel<T> {
  emit: (event: T) => void;
  on: (handler: (event: T) => void) => () => void;
}

export const createEventChannel = <T>(key: string): EventChannel<T> => ({
  emit: (event: T): void => {
    document.dispatchEvent(new CustomEvent<T>(key, { detail: event }));
  },
  on: (handler: (event: T) => void): (() => void) => {
    const listener = (event: Event): void => handler((event as CustomEvent<T>).detail);
    document.addEventListener(key, listener);
    return (): void => document.removeEventListener(key, listener);
  },
});
