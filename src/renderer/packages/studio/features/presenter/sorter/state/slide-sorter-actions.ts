import { createEventChannel } from "@bitgrain/core/events/event-channel";

const SLIDE_SORTER_ACTION_EVENT = "bg:slide-sorter-action";

export type SlideSorterAction =
  | { kind: "reorder"; pageIds: string[]; insertIndex: number }
  | { kind: "duplicate"; pageIds: string[] }
  | { kind: "delete"; pageIds: string[] }
  | { kind: "open"; pageId: string };

const slideSorterActionChannel = createEventChannel<SlideSorterAction>(SLIDE_SORTER_ACTION_EVENT);

export const emitSlideSorterAction = slideSorterActionChannel.emit;
export const onSlideSorterAction = slideSorterActionChannel.on;

