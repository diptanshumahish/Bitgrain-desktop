const TUTORIAL_KEY = "bg:tutorial";

export type TutorialEvent =
  | { type: "start"; tutorialId: "home" | "studio" }
  | { type: "stop" };

export function emitTutorial(event: TutorialEvent): void {
  document.dispatchEvent(new CustomEvent(TUTORIAL_KEY, { detail: event }));
}

export function onTutorial(handler: (event: TutorialEvent) => void): () => void {
  const listener = (e: Event) =>
    handler((e as CustomEvent<TutorialEvent>).detail);
  document.addEventListener(TUTORIAL_KEY, listener);
  return () => document.removeEventListener(TUTORIAL_KEY, listener);
}
