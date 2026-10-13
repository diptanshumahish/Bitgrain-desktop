import type React from "react";
import { trackEvent, type TrackPage } from "../../lib/tracker";

type LinkClickHandler = (event: React.MouseEvent<HTMLElement>) => void;

function readDestination(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  const anchor = target.closest("a");
  if (!anchor) return null;
  return anchor.getAttribute("href");
}

export function createLinkClickTracker(page: TrackPage, eventName: string, location: string): LinkClickHandler {
  return (event: React.MouseEvent<HTMLElement>): void => {
    const destination = readDestination(event.target);
    if (!destination) return;
    trackEvent(page, eventName, { details: { destination, location } });
  };
}
