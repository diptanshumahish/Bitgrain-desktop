import { useCallback, useEffect, useRef } from "react";
import type { CloudSyncOutcome } from "../../lib/save-to-cloud";
import { canPersistWork } from "../../store/studio-load-state";
import { markRetrying, markSaved, markSaving, saveStatusSignal } from "../../store/studio-save-status";

const AUTOSAVE_DEBOUNCE_MS = 1200;
const RETRY_BASE_DELAY_MS = 2000;
const RETRY_MAX_DELAY_MS = 60000;
const RETRY_BACKOFF_FACTOR = 2;

interface UseStudioAutosaveArgs {
  enabled: boolean;
  save: () => Promise<CloudSyncOutcome>;
}

type ScheduleAutosave = () => (() => void) | undefined;

const retryDelayMs = (attempt: number): number =>
  Math.min(RETRY_BASE_DELAY_MS * RETRY_BACKOFF_FACTOR ** attempt, RETRY_MAX_DELAY_MS);

export const useStudioAutosave = ({ enabled, save }: UseStudioAutosaveArgs): ScheduleAutosave => {
  const saveRef = useRef(save);
  const readyRef = useRef(false);
  const retryAttemptRef = useRef(0);
  const retryTimerRef = useRef<number | null>(null);
  const runSaveRef = useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    saveRef.current = save;
  });

  const clearRetry = (): void => {
    if (retryTimerRef.current !== null) window.clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  };

  const runSave = useCallback(async (): Promise<void> => {
    if (!canPersistWork()) return;
    clearRetry();
    markSaving();
    const outcome = await saveRef.current();
    if (outcome !== "failed") {
      retryAttemptRef.current = 0;
      markSaved();
      return;
    }
    markRetrying();
    retryTimerRef.current = window.setTimeout(() => void runSaveRef.current(), retryDelayMs(retryAttemptRef.current));
    retryAttemptRef.current += 1;
  }, []);

  useEffect(() => {
    runSaveRef.current = runSave;
  }, [runSave]);

  const scheduleAutosave = useCallback((): (() => void) | undefined => {
    if (!enabled) return undefined;
    if (!readyRef.current) {
      readyRef.current = true;
      return undefined;
    }
    const timer = window.setTimeout(() => void runSave(), AUTOSAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [enabled, runSave]);

  useEffect(() => {
    const syncWhenOnline = (): void => {
      if (saveStatusSignal.value === "retrying") void runSave();
    };
    window.addEventListener("online", syncWhenOnline);
    return () => {
      window.removeEventListener("online", syncWhenOnline);
      clearRetry();
    };
  }, [runSave]);

  return scheduleAutosave;
};
