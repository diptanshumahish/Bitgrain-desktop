import { createEventChannel } from "@bitgrain/core/events/event-channel";

const MOSH_ROLL_KEY = "bg:mosh-roll";

const moshRollChannel = createEventChannel<void>(MOSH_ROLL_KEY);

export const emitMoshRoll = (): void => moshRollChannel.emit();
export const onMoshRoll = moshRollChannel.on;
