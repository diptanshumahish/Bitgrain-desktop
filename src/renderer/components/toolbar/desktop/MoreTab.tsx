import React from "react";
import { MoreHorizontal } from "lucide-react";
import { TabButton } from "../TabButton";
import { Popover } from "../Popover";
import { MorePopover } from "../MorePopover";
import type { ActivePopover } from "../DesktopToolbar";

interface MoreTabProps {
  hasImage: boolean;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
}

export const MoreTab: React.FC<MoreTabProps> = ({ hasImage, active, toggle, close }) => (
  <div className="relative">
    <TabButton icon={<MoreHorizontal size={14} strokeWidth={2} />} label="more" active={active === "more"} expanded={active === "more"} onClick={() => toggle("more")} />
    {active === "more" && (
      <Popover onClose={close} className="right-0">
        <MorePopover hasImage={hasImage} onClose={close} />
      </Popover>
    )}
  </div>
);
