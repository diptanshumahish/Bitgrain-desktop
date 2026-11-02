import { useCallback, useEffect, useRef } from "react";
import { canvasGestureSignal } from "../workspace/gesture-freeze";

type SettledCleanup = (() => void) | undefined | void;
type SettledEffect<Value> = (value: Value) => SettledCleanup;

export const useGestureSettledEffect = <Value>(value: Value, effect: SettledEffect<Value>): void => {
  const effectRef = useRef(effect);
  const latestValueRef = useRef(value);
  const pendingRef = useRef(false);
  const cleanupRef = useRef<SettledCleanup>(undefined);

  useEffect(() => {
    effectRef.current = effect;
  });

  const releaseCleanup = useCallback((): void => {
    const cleanup = cleanupRef.current;
    cleanupRef.current = undefined;
    if (cleanup) cleanup();
  }, []);

  const runEffect = useCallback((): void => {
    releaseCleanup();
    pendingRef.current = false;
    cleanupRef.current = effectRef.current(latestValueRef.current);
  }, [releaseCleanup]);

  useEffect(() => {
    latestValueRef.current = value;
    if (!canvasGestureSignal.value) {
      runEffect();
      return;
    }
    releaseCleanup();
    pendingRef.current = true;
  }, [value, runEffect, releaseCleanup]);

  useEffect(() => {
    const stopListening = canvasGestureSignal.subscribe(() => {
      if (!canvasGestureSignal.value && pendingRef.current) runEffect();
    });
    return () => {
      stopListening();
      releaseCleanup();
    };
  }, [runEffect, releaseCleanup]);
};
