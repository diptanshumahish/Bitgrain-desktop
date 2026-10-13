import { backoffDelayMs, waitFor } from "../../lib/api/retry-delay";
import { fetchPlugins } from "./api";
import { pluginsLoadedSignal, pluginsSignal } from "./plugin-bus";

const MAX_LOAD_ATTEMPTS = 4;

let inflightLoad: Promise<void> | null = null;

const loadWithRetry = async (): Promise<void> => {
  for (let attempt = 0; attempt < MAX_LOAD_ATTEMPTS; attempt++) {
    const list = await fetchPlugins();
    if (list) {
      pluginsSignal.value = list;
      pluginsLoadedSignal.value = true;
      return;
    }
    await waitFor(backoffDelayMs(attempt));
  }
};

export function ensurePluginsLoaded(): Promise<void> {
  if (pluginsLoadedSignal.value) return Promise.resolve();
  if (!inflightLoad) {
    inflightLoad = loadWithRetry().finally(() => {
      inflightLoad = null;
    });
  }
  return inflightLoad;
}
