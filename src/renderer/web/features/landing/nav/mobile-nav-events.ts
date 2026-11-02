import { createEventChannel } from "@bitgrain/core/events/event-channel";

const MOBILE_NAV_EVENT = "bitgrain:landing-mobile-nav";

const mobileNavChannel = createEventChannel<boolean>(MOBILE_NAV_EVENT);

export const emitMobileNav = mobileNavChannel.emit;
export const onMobileNav = mobileNavChannel.on;
