import type { NumberToken, TextStyleVariable } from "@bitgrain/studio-core/model/design-kit-types";

export type KitTokenChange =
  | { kind: "textStyle"; style: TextStyleVariable }
  | { kind: "number"; token: NumberToken };

type KitTokenListener = (change: KitTokenChange) => void;

const listeners = new Set<KitTokenListener>();

export const emitKitTokenChange = (change: KitTokenChange): void => {
  listeners.forEach((listener) => listener(change));
};

export const onKitTokenChange = (listener: KitTokenListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
