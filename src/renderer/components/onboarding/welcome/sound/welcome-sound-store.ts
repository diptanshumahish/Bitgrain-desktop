import { signal } from "../../../../lib/signal";

const MUTED_KEY = "bitgrain_welcome_muted";

const readMuted = (): boolean => {
  try {
    return localStorage.getItem(MUTED_KEY) === "true";
  } catch {
    return false;
  }
};

export const welcomeMutedSignal = signal<boolean>(readMuted());

export function toggleWelcomeMuted(): void {
  const next = !welcomeMutedSignal.value;
  welcomeMutedSignal.value = next;
  try {
    localStorage.setItem(MUTED_KEY, String(next));
  } catch (error) {
    console.warn("Could not remember the sound setting", error);
  }
}
