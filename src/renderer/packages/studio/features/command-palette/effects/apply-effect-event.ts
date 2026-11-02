import type { BitgrainEffectKind } from "@bitgrain/studio-core/model/studio-types";
import { createEventChannel } from "@bitgrain/core/events/event-channel";

const APPLY_EFFECT_EVENT = "bg:palette-apply-effect";

const applyEffectChannel = createEventChannel<BitgrainEffectKind>(APPLY_EFFECT_EVENT);

export const emitApplyEffect = applyEffectChannel.emit;
export const onApplyEffect = applyEffectChannel.on;

