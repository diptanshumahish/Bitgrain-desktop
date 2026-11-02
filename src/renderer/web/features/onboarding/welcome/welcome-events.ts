import { createEventChannel } from "@bitgrain/core/events/event-channel";

const WELCOME_EVENT_KEY = "bg:welcome";

export interface WelcomeEvent {
  firstName: string;
  lastName: string;
}

const welcomeChannel = createEventChannel<WelcomeEvent>(WELCOME_EVENT_KEY);

export const emitWelcome = welcomeChannel.emit;
export const onWelcome = welcomeChannel.on;

