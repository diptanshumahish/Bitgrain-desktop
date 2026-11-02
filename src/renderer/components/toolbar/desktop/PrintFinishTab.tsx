import React from "react";
import { Newspaper } from "lucide-react";
import type { ToolbarState } from "../use-toolbar-state";
import { TabButton } from "../TabButton";

interface PrintFinishTabProps {
  state: ToolbarState;
}

const PAPER_TEXTURE_ON_TIP = "Paper texture is on. Click to print on a clean sheet.";
const PAPER_TEXTURE_OFF_TIP = "Add paper grain and soft ink edges to your image.";
const NO_IMAGE_TIP = "Upload an image first";

export const PrintFinishTab: React.FC<PrintFinishTabProps> = ({ state: s }) => {
  const toggle = (): void => {
    s.setPrintFinish(!s.printFinish);
    s.onDone();
  };

  return (
    <div data-tutorial="home-print" title={s.printFinish ? PAPER_TEXTURE_ON_TIP : PAPER_TEXTURE_OFF_TIP}>
      <TabButton
        icon={<Newspaper size={14} strokeWidth={2} />}
        label="paper"
        ariaLabel="Paper texture"
        pressed={s.printFinish}
        onClick={toggle}
        disabled={!s.hasImage}
        disabledTooltip={NO_IMAGE_TIP}
      />
    </div>
  );
};
