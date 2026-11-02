const WELCOME_EVENT_KEY = "bg:welcome";

export interface WelcomeEvent {
  firstName: string;
  lastName: string;
}

export function emitWelcome(event: WelcomeEvent): void {
  document.dispatchEvent(new CustomEvent(WELCOME_EVENT_KEY, { detail: event }));
}

export function onWelcome(handler: (event: WelcomeEvent) => void): () => void {
  const listener = (event: Event): void => handler((event as CustomEvent<WelcomeEvent>).detail);
  document.addEventListener(WELCOME_EVENT_KEY, listener);
  return () => document.removeEventListener(WELCOME_EVENT_KEY, listener);
}
