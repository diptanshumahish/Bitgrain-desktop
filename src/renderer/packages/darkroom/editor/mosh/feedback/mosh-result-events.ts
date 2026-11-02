import { createEventChannel } from "@bitgrain/core/events/event-channel";

const MOSH_RESULT_KEY = "bg:mosh-result";

export interface MoshResult {
  title: string;
  detail: string;
  reason: string;
}

const moshResultChannel = createEventChannel<MoshResult>(MOSH_RESULT_KEY);

export const emitMoshResult = moshResultChannel.emit;
export const onMoshResult = moshResultChannel.on;

