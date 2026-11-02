import { markClean } from "../state/studio-save-status";

const AUTOSAVE_FLUSH_EVENT = "bg:autosave-flush";
const FLUSH_TIMEOUT_MS = 2000;

interface AutosaveFlushDetail {
  claim: () => void;
  done: () => void;
}

export function onAutosaveFlush(handler: (done: () => void) => void): () => void {
  const listener = (event: Event): void => {
    const { claim, done } = (event as CustomEvent<AutosaveFlushDetail>).detail;
    claim();
    handler(done);
  };
  document.addEventListener(AUTOSAVE_FLUSH_EVENT, listener);
  return () => document.removeEventListener(AUTOSAVE_FLUSH_EVENT, listener);
}

const flushAutosave = (): Promise<void> =>
  new Promise((resolve) => {
    let claimed = false;
    const timer = window.setTimeout(resolve, FLUSH_TIMEOUT_MS);
    const done = (): void => {
      window.clearTimeout(timer);
      resolve();
    };
    const detail: AutosaveFlushDetail = { claim: () => { claimed = true; }, done };
    document.dispatchEvent(new CustomEvent(AUTOSAVE_FLUSH_EVENT, { detail }));
    if (!claimed) done();
  });

export async function flushAutosaveAndReload(): Promise<void> {
  await flushAutosave();
  markClean();
  window.location.reload();
}
