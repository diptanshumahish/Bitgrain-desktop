const PRESENTER_CHANNEL_PREFIX = "bitgrain-presenter:";

export interface PresenterSlideInfo {
  name: string;
  notes: string;
}

export type PresenterMessage =
  | { type: "hello" }
  | { type: "deck"; slides: PresenterSlideInfo[]; index: number; startedAt: number }
  | { type: "slide-image"; index: number; src: string }
  | { type: "index"; index: number }
  | { type: "step"; delta: number }
  | { type: "end" };

export const presenterChannelName = (sessionId: string): string => `${PRESENTER_CHANNEL_PREFIX}${sessionId}`;

export const postPresenterMessage = (channel: BroadcastChannel | null, message: PresenterMessage): void => {
  channel?.postMessage(message);
};
