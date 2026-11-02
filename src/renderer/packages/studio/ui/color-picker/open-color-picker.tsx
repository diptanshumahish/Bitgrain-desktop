import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { ColorPickerContent } from "../ColorPicker";

interface ColorPickerRequest {
  color: string;
  onChange: (color: string) => void;
  anchorRect: DOMRect;
  varId?: string;
  onBindVariable?: (varId: string, value: string) => void;
}

export const openColorPicker = (request: ColorPickerRequest): void => {
  emitPopover({
    type: "side-menu",
    anchorRect: request.anchorRect,
    content: (
      <div className="bg-(--s-bg-panel) border border-(--s-border) rounded-xl p-3 w-[256px] backdrop-blur-md overflow-hidden">
        <ColorPickerContent
          color={request.color}
          onChange={request.onChange}
          varId={request.varId}
          onBindVariable={request.onBindVariable}
        />
      </div>
    ),
  });
};
