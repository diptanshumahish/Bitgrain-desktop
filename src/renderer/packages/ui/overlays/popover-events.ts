import type React from "react";
import { createEventChannel } from "@bitgrain/core/events/event-channel";

const POPOVER_KEY = "bg:popover";

export type PopoverEvent =
  | {
      type: "tool-dropdown";
      content: React.ReactNode;
      anchorRect: DOMRect;
      preferBelow?: boolean;
    }
  | {
      type: "side-menu";
      content: React.ReactNode;
      anchorRect: DOMRect;
    };

const popoverChannel = createEventChannel<PopoverEvent | null>(POPOVER_KEY);

export const emitPopover = popoverChannel.emit;
export const onPopover = popoverChannel.on;
