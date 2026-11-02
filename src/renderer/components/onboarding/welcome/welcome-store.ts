import { signal } from "../../../lib/signal";
import { trackEvent } from "../../../lib/tracker";
import type { WelcomeEvent } from "./welcome-events";
import { CHOOSE_SCENE_INDEX, WELCOME_SCENES } from "./welcome-timing";

export interface WelcomeState {
  firstName: string;
  lastName: string;
  sceneIndex: number;
  leaving: boolean;
}

export const welcomeSignal = signal<WelcomeState | null>(null);

export function openWelcome(event: WelcomeEvent): void {
  if (welcomeSignal.value) return;
  welcomeSignal.value = { firstName: event.firstName, lastName: event.lastName, sceneIndex: 0, leaving: false };
  void trackEvent("onboarding", "welcome_shown");
}

export function advanceWelcome(): void {
  const current = welcomeSignal.value;
  if (!current || current.leaving || current.sceneIndex >= CHOOSE_SCENE_INDEX) return;
  welcomeSignal.value = { ...current, sceneIndex: current.sceneIndex + 1 };
}

export function skipWelcomeIntro(): void {
  const current = welcomeSignal.value;
  if (!current || current.sceneIndex >= CHOOSE_SCENE_INDEX) return;
  void trackEvent("onboarding", "welcome_skipped", {
    details: { scene: WELCOME_SCENES[current.sceneIndex] },
  });
  welcomeSignal.value = { ...current, sceneIndex: CHOOSE_SCENE_INDEX };
}

export function leaveWelcome(destination: string): void {
  const current = welcomeSignal.value;
  if (!current || current.leaving) return;
  void trackEvent("onboarding", "welcome_finished", { details: { destination } });
  welcomeSignal.value = { ...current, leaving: true };
}

export function finishWelcome(): void {
  welcomeSignal.value = null;
}
