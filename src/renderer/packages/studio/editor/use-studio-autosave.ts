import { useCallback, useEffect, useRef } from "react";
import type { CloudSyncOutcome } from "@bitgrain/platform/projects/save-to-cloud";
import { canPersistWork } from "../state/studio-load-state";
import { onAutosaveFlush } from "./autosave-flush-event";
import { markNeedsPro, markRetrying, markSaved, markSaving, saveStatusSignal } from "../state/studio-save-status";

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
  const pendingSaveRef = useRef(false);
  const saveChainRef = useRef<Promise<void> | null>(null);
  const saveQueuedRef = useRef(false);

  useEffect(() => {
    saveRef.current = save;
  });

  const clearRetry = (): void => {
    if (retryTimerRef.current !== null) window.clearTimeout(retryTimerRef.current);
    retryTimerRef.current = null;
  };

  const saveOnce = useCallback(async (): Promise<void> => {
    clearRetry();
    markSaving();
    const outcome = await saveRef.current();
    if (outcome !== "failed") {
      retryAttemptRef.current = 0;
      if (outcome === "needs_pro") markNeedsPro();
      else markSaved();
      return;
    }
    markRetrying();
    retryTimerRef.current = window.setTimeout(() => void runSaveRef.current(), retryDelayMs(retryAttemptRef.current));
    retryAttemptRef.current += 1;
  }, []);

  const runSave = useCallback((): Promise<void> => {
    if (!canPersistWork()) return Promise.resolve();
    if (saveChainRef.current) {
      saveQueuedRef.current = true;
      return saveChainRef.current;
    }
    const chain = (async (): Promise<void> => {
      do {
        saveQueuedRef.current = false;
        await saveOnce();
      } while (saveQueuedRef.current);
    })().finally(() => {
      saveChainRef.current = null;
    });
    saveChainRef.current = chain;
    return chain;
  }, [saveOnce]);

  useEffect(() => {
    runSaveRef.current = runSave;
  }, [runSave]);

  const scheduleAutosave = useCallback((): (() => void) | undefined => {
    if (!enabled) return undefined;
    if (!readyRef.current) {
      readyRef.current = true;
      return undefined;
    }
    pendingSaveRef.current = true;
    const timer = window.setTimeout(() => {
      pendingSaveRef.current = false;
      void runSave();
    }, AUTOSAVE_DEBOUNCE_MS);
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

  useEffect(() => {
    const flushPendingSave = (): void => {
      if (!pendingSaveRef.current) return;
      pendingSaveRef.current = false;
      void runSaveRef.current();
    };
    const flushWhenHidden = (): void => {
      if (document.visibilityState === "hidden") flushPendingSave();
    };
    document.addEventListener("visibilitychange", flushWhenHidden);
    window.addEventListener("pagehide", flushPendingSave);
    const stopFlushListener = onAutosaveFlush((done) => {
      if (!pendingSaveRef.current) {
        done();
        return;
      }
      pendingSaveRef.current = false;
      void runSaveRef.current().finally(done);
    });
    return () => {
      stopFlushListener();
      document.removeEventListener("visibilitychange", flushWhenHidden);
      window.removeEventListener("pagehide", flushPendingSave);
      flushPendingSave();
    };
  }, []);

  return scheduleAutosave;
};
