import { useSyncExternalStore } from "react";

export interface Signal<T> {
  readonly value: T;
  subscribe(onChange: () => void): () => void;
}

export interface WritableSignal<T> extends Signal<T> {
  value: T;
}

function makeSignal<T>(initialValue: T): WritableSignal<T> {
  let current = initialValue;
  const listeners = new Set<() => void>();

  return {
    get value() {
      return current;
    },
    set value(next: T) {
      if (Object.is(current, next)) return;
      current = next;
      for (const listener of listeners) listener();
    },
    subscribe(onChange: () => void): () => void {
      listeners.add(onChange);
      return () => listeners.delete(onChange);
    },
  };
}

export function signal<T>(initialValue: T): WritableSignal<T> {
  return makeSignal(initialValue);
}

export function useSignalValue<T>(sig: Signal<T>): T {
  return useSyncExternalStore(
    (cb) => sig.subscribe(cb),
    () => sig.value,
  );
}

export function setSignal<T>(sig: WritableSignal<T>, next: T): void {
  sig.value = next;
}
