import { createEventChannel } from "@bitgrain/core/events/event-channel";
import type { GroupLayer, Layer, TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { DesignFormat, DesignSize } from "@bitgrain/studio-core/design-sizes/new-design-formats";
import type { ImageDimensions } from "@bitgrain/darkroom/editor/upload/image-utils";

const STUDIO_MODAL_KEY = "bg:studio-modal";

export type StudioModalEvent =
  | { type: "resize"; sourceWidth: number; sourceHeight: number; onApply: (formatIds: string[]) => void }
  | {
      type: "mockup";
      template: TemplateDef;
      background: string;
      layers: Layer[];
      image: string | null;
      width: number;
      height: number;
      selectedLayer: Layer | null;
      onAddPage: (dataUrl: string, width: number, height: number) => void;
    }
  | { type: "new-design"; onCreate: (size: DesignSize) => void }
  | { type: "all-sizes"; onPick: (format: DesignFormat) => void }
  | { type: "keyboard-shortcuts" }
  | { type: "pattern"; canvasWidth: number; canvasHeight: number; onApply: (group: GroupLayer) => void }
  | { type: "add-image"; title?: string; onPick: (src: string, dims?: ImageDimensions, name?: string) => void }
  | { type: "present"; pages: TemplatePage[]; template: TemplateDef; startIndex: number };

const studioModalChannel = createEventChannel<StudioModalEvent>(STUDIO_MODAL_KEY);

export const emitStudioModal = studioModalChannel.emit;
export const onStudioModal = studioModalChannel.on;
