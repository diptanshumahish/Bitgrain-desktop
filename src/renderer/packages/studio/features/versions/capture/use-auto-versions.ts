import { useEffect, useRef } from "react";

const AUTO_VERSION_ACTIVE_MS = 30 * 60 * 1000;
const IDLE_GAP_MS = 2 * 60 * 1000;

interface UseAutoVersionsArgs {
  enabled: boolean;
  changeToken: unknown;
  onDue: () => void;
  isBusy?: () => boolean;
}

const neverBusy = (): boolean => false;

export const useAutoVersions = ({ enabled, changeToken, onDue, isBusy = neverBusy }: UseAutoVersionsArgs): void => {
  const lastEditRef = useRef<number | null>(null);
  const activeMsRef = useRef(0);
  const onDueRef = useRef(onDue);
  const isBusyRef = useRef(isBusy);

  useEffect(() => {
    onDueRef.current = onDue;
    isBusyRef.current = isBusy;
  });

  useEffect(() => {
    if (!enabled) return;
    const now = Date.now();
    if (lastEditRef.current !== null) activeMsRef.current += Math.min(now - lastEditRef.current, IDLE_GAP_MS);
    lastEditRef.current = now;
    if (activeMsRef.current < AUTO_VERSION_ACTIVE_MS || isBusyRef.current()) return;
    activeMsRef.current = 0;
    onDueRef.current();
  }, [enabled, changeToken]);
};
