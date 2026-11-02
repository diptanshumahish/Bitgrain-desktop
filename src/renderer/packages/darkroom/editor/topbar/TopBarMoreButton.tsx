import React from "react";
import { MoreHorizontal } from "lucide-react";
import { emitPopover } from "@bitgrain/ui/overlays/popover-events";
import { MORE_ROW_CLASS, MorePopover } from "../../toolbar/MorePopover";
import { OpenProjectMenuItem } from "./OpenProjectMenuItem";
import { TopBarButton } from "@bitgrain/ui/components/TopBarButton";

interface TopBarMoreButtonProps {
  hasImage: boolean;
}

const closeMenu = (): void => emitPopover(null);

export const TopBarMoreButton: React.FC<TopBarMoreButtonProps> = ({ hasImage }) => {
  const openMenu = (event: React.MouseEvent<HTMLButtonElement>): void => {
    emitPopover({
      type: "tool-dropdown",
      preferBelow: true,
      anchorRect: event.currentTarget.getBoundingClientRect(),
      content: (
        <div className="bg-[var(--s-bg-panel)] border border-[var(--s-border)] rounded-xl overflow-hidden">
          <MorePopover hasImage={hasImage} onClose={closeMenu} leadingItems={<OpenProjectMenuItem className={MORE_ROW_CLASS} onDone={closeMenu} />} />
        </div>
      ),
    });
  };
  return (
    <TopBarButton label="More" onClick={openMenu}>
      <MoreHorizontal size={15} strokeWidth={1.75} />
    </TopBarButton>
  );
};
