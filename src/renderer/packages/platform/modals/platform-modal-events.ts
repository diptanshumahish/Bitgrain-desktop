import { createEventChannel } from "@bitgrain/core/events/event-channel";
import type { UpgradeFeature } from "./upgrade-prompt/upgrade-copy";

const PLATFORM_MODAL_KEY = "bg:platform-modal";

type LoginReason = "templates" | "export" | "save" | "presets" | "purchase" | "studio" | "generic";
export type TicketType = "bug" | "feature" | "question" | "improvement" | "other";

export type PlatformModalEvent =
  | { type: "studio-payment" }
  | { type: "login"; reason?: LoginReason; next?: string }
  | { type: "free-access"; plan?: "pro" }
  | { type: "upgrade-prompt"; feature: UpgradeFeature }
  | { type: "post-export-upgrade"; requestedLongEdge: number; deliveredLongEdge: number }
  | { type: "changelog" }
  | {
      type: "ticket";
      defaultType?: TicketType;
      defaultTitle?: string;
      defaultBody?: string;
      onSubmitted?: (ticketNumber: number) => void;
    };

const platformModalChannel = createEventChannel<PlatformModalEvent>(PLATFORM_MODAL_KEY);

export const emitPlatformModal = platformModalChannel.emit;
export const onPlatformModal = platformModalChannel.on;
