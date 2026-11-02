import { createEventChannel } from "@bitgrain/core/events/event-channel";
import type { AreaValue } from "../grading/mask-ui/area-modal/use-area-editor";
import type { StyleBrowserTarget } from "../toolbar/style-browser/style-browser-target";

const DARKROOM_MODAL_KEY = "bg:darkroom-modal";

export type SpecialImageFormat = "heic" | "raw" | "tiff";

export type DarkroomModalEvent =
  | { type: "crop" }
  | { type: "riso-export" }
  | { type: "animate" }
  | { type: "loop-export" }
  | { type: "batch" }
  | { type: "color-studio" }
  | { type: "metadata-cleaner" }
  | { type: "style-browser"; target?: StyleBrowserTarget }
  | {
      type: "mask-area";
      source: string;
      area: AreaValue;
      onApply: (area: AreaValue) => void;
    };

interface HeicStatusEvent {
  status: "converting" | "done" | "failed";
  format?: SpecialImageFormat;
}

const darkroomModalChannel = createEventChannel<DarkroomModalEvent>(DARKROOM_MODAL_KEY);
const heicStatusChannel = createEventChannel<HeicStatusEvent>("bg:heic-status");

export const emitDarkroomModal = darkroomModalChannel.emit;
export const onDarkroomModal = darkroomModalChannel.on;
export const emitHeicStatus = heicStatusChannel.emit;
export const onHeicStatus = heicStatusChannel.on;
