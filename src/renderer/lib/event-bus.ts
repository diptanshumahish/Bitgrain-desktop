const BG_MODAL_KEY = "bg:modal";
const BG_POPOVER_KEY = "bg:popover";
const BG_CONTEXT_MENU_KEY = "bg:context-menu";
const BG_SECTION_MENU_KEY = "bg:section-menu";


export type ModalEvent =
  | { type: "studio-payment" }
  | { type: "resize"; sourceWidth: number; sourceHeight: number; onApply: (formatIds: string[]) => void }
  | {
      type: "mockup";
      template: import("../data/studioTypes").TemplateDef;
      background: string;
      layers: import("../data/studioTypes").Layer[];
      image: string | null;
      width: number;
      height: number;
      selectedLayer: import("../data/studioTypes").Layer | null;
      onAddPage: (dataUrl: string, width: number, height: number) => void;
    }
  | { type: "free-access"; plan?: "pro" }
  | {
      type: "post-export-upgrade";
      requestedLongEdge: number;
      deliveredLongEdge: number;
    }
  | { type: "settings" }
  | { type: "crop" }
  | { type: "riso-export" }
  | { type: "animate" }
  | { type: "selective-effect" }
  | { type: "login"; reason?: "templates" | "export" | "presets" | "purchase" | "studio" | "generic" }
  | { type: "batch" }
  | { type: "changelog" }
  | {
      type: "heic-status";
      status: "converting" | "done";
      format?: "heic" | "raw" | "tiff";
    }
  | {
      type: "confirm";
      title: string;
      message: string;
      onConfirm: () => void;
      onCancel?: () => void;
      confirmLabel?: string;
      cancelLabel?: string;
      danger?: boolean;
    }
  | {
      type: "prompt";
      title: string;
      label?: string;
      notice?: string;
      defaultValue?: string;
      placeholder?: string;
      confirmLabel?: string;
      onSubmit: (value: string) => void;
    }
  | {
      type: "pattern";
      canvasWidth: number;
      canvasHeight: number;
      onApply: (group: GroupLayer) => void;
    }
  | {
      type: "add-image";
      title?: string;
      onPick: (src: string, dims?: ImageDimensions) => void;
    }
  | {
      type: "present";
      pages: import("../data/studioTypes").TemplatePage[];
      template: import("../data/studioTypes").TemplateDef;
      startIndex: number;
    }
  | { type: "color-studio" }
  | {
      type: "ticket";
      defaultType?: "bug" | "feature" | "question" | "improvement" | "other";
      defaultTitle?: string;
      defaultBody?: string;
      onSubmitted?: (ticketNumber: number) => void;
    };

import type { UploadLayer, ImageFilters, BlendMode, GroupLayer } from "../data/studioTypes";
import type { ImageDimensions } from "../utils/image-utils";

type ImageFit = "cover" | "contain" | "fill";

export type ImageFillLayer =
  | UploadLayer
  | { src: string; fit: ImageFit; filters: ImageFilters; blendMode: BlendMode };

export type ImageFillUpdates =
  | Partial<UploadLayer>
  | { src?: string; fit?: ImageFit; filters?: ImageFilters; blendMode?: BlendMode };

export type PopoverEvent =
  | {
      type: "color-picker";
      color: string;
      onChange: (color: string) => void;
      anchorRect: DOMRect;
      varId?: string;
      onBindVariable?: (varId: string, value: string) => void;
    }
  | {
      type: "image-fill";
      layer: ImageFillLayer;
      onChange: (updates: ImageFillUpdates) => void;
      onUpload?: (src: string) => void;
      anchorRect: DOMRect;
    }
  | {
      type: "tool-dropdown";
      content: React.ReactNode;
      anchorRect: DOMRect;
    };

export function emitModal(event: ModalEvent): void {
  document.dispatchEvent(new CustomEvent(BG_MODAL_KEY, { detail: event }));
}

export function onModal(handler: (event: ModalEvent) => void): () => void {
  const listener = (e: Event) =>
    handler((e as CustomEvent<ModalEvent>).detail);
  document.addEventListener(BG_MODAL_KEY, listener);
  return () => document.removeEventListener(BG_MODAL_KEY, listener);
}

export function emitPopover(event: PopoverEvent | null): void {
  document.dispatchEvent(new CustomEvent(BG_POPOVER_KEY, { detail: event }));
}

export function onPopover(handler: (event: PopoverEvent | null) => void): () => void {
  const listener = (e: Event) =>
    handler((e as CustomEvent<PopoverEvent | null>).detail);
  document.addEventListener(BG_POPOVER_KEY, listener);
  return () => document.removeEventListener(BG_POPOVER_KEY, listener);
}

export interface ContextMenuAction {
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface ContextMenuEvent {
  x: number;
  y: number;
  actions: ContextMenuAction[];
}

export function emitContextMenu(event: ContextMenuEvent | null): void {
  document.dispatchEvent(new CustomEvent(BG_CONTEXT_MENU_KEY, { detail: event }));
}

export function onContextMenu(handler: (event: ContextMenuEvent | null) => void): () => void {
  const listener = (e: Event) =>
    handler((e as CustomEvent<ContextMenuEvent | null>).detail);
  document.addEventListener(BG_CONTEXT_MENU_KEY, listener);
  return () => document.removeEventListener(BG_CONTEXT_MENU_KEY, listener);
}

export interface SectionMenuEvent {
  anchorRect: DOMRect;
}

export function emitSectionMenu(event: SectionMenuEvent | null): void {
  document.dispatchEvent(new CustomEvent(BG_SECTION_MENU_KEY, { detail: event }));
}

export function onSectionMenu(handler: (event: SectionMenuEvent | null) => void): () => void {
  const listener = (e: Event) =>
    handler((e as CustomEvent<SectionMenuEvent | null>).detail);
  document.addEventListener(BG_SECTION_MENU_KEY, listener);
  return () => document.removeEventListener(BG_SECTION_MENU_KEY, listener);
}
