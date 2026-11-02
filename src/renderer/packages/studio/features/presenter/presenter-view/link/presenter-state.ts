import type { PresenterMessage, PresenterSlideInfo } from "./presenter-messages";

type PresenterStatus = "connecting" | "live" | "ended";

export interface PresenterState {
  slides: PresenterSlideInfo[];
  images: Record<number, string>;
  index: number;
  startedAt: number;
  status: PresenterStatus;
}

export const INITIAL_PRESENTER_STATE: PresenterState = {
  slides: [],
  images: {},
  index: 0,
  startedAt: 0,
  status: "connecting",
};

export const reducePresenterMessage = (state: PresenterState, message: PresenterMessage): PresenterState => {
  if (message.type === "deck") {
    return { ...state, slides: message.slides, index: message.index, startedAt: message.startedAt, status: "live" };
  }
  if (message.type === "slide-image") return { ...state, images: { ...state.images, [message.index]: message.src } };
  if (message.type === "index") return { ...state, index: message.index };
  if (message.type === "end") return { ...state, status: "ended" };
  return state;
};
