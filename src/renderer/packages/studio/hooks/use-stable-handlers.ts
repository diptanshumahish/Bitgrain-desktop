import { useInsertionEffect, useState } from "react";

type AnyHandler = (...args: never[]) => unknown;
type HandlerMap = Record<string, AnyHandler>;

class StableHandlerRegistry<T extends HandlerMap> {
  private latest: T;
  readonly stable: T;

  constructor(initial: T) {
    this.latest = initial;
    const stable: HandlerMap = {};
    for (const key of Object.keys(initial)) {
      stable[key] = (...args: never[]) => this.latest[key](...args);
    }
    this.stable = stable as T;
  }

  update(next: T): void {
    this.latest = next;
  }
}

export const useStableHandlers = <T extends HandlerMap>(handlers: T): T => {
  const [registry] = useState(() => new StableHandlerRegistry(handlers));
  useInsertionEffect(() => {
    registry.update(handlers);
  });
  return registry.stable;
};
