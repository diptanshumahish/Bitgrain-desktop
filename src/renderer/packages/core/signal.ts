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

interface SignalBinding<T> {
  subscribe: (onChange: () => void) => () => void;
  getSnapshot: () => T;
}

const bindings = new WeakMap<Signal<unknown>, SignalBinding<unknown>>();

function bindingFor<T>(sig: Signal<T>): SignalBinding<T> {
  const existing = bindings.get(sig);
  if (existing) return existing as SignalBinding<T>;
  const binding: SignalBinding<T> = {
    subscribe: (onChange) => sig.subscribe(onChange),
    getSnapshot: () => sig.value,
  };
  bindings.set(sig, binding);
  return binding;
}

export function useSignalValue<T>(sig: Signal<T>): T {
  const binding = bindingFor(sig);
  return useSyncExternalStore(binding.subscribe, binding.getSnapshot, binding.getSnapshot);
}

export function setSignal<T>(sig: WritableSignal<T>, next: T): void {
  sig.value = next;
}
