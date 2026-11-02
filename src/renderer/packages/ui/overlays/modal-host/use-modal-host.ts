import { useEffect, useState } from "react";
import { signal } from "@bitgrain/core/signal";

const activeModalHostSignal = signal<string | null>(null);

type Subscribe<T> = (handler: (event: T) => void) => () => void;

export const useModalHost = <T>(hostId: string, subscribe: Subscribe<T>): [T | null, () => void] => {
  const [active, setActive] = useState<T | null>(null);

  useEffect(
    () =>
      subscribe((event) => {
        activeModalHostSignal.value = hostId;
        setActive(event);
      }),
    [hostId, subscribe],
  );

  useEffect(
    () =>
      activeModalHostSignal.subscribe(() => {
        if (activeModalHostSignal.value !== hostId) setActive(null);
      }),
    [hostId],
  );

  return [active, () => setActive(null)];
};
