import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { EasingEditor, type EasingEditorProps } from "./EasingEditor";

export const openEasingEditor = (anchor: HTMLElement, props: EasingEditorProps): void => {
  emitPopover({
    type: "tool-dropdown",
    anchorRect: anchor.getBoundingClientRect(),
    content: <EasingEditor {...props} />,
  });
};

export const closeEasingEditor = (): void => emitPopover(null);
