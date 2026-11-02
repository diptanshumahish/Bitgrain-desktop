import React from "react";
import { Download } from "lucide-react";
import { TabButton } from "../TabButton";
import { Popover } from "../Popover";
import { ExportPopover } from "../ExportPopover";
import { trackEvent } from "../../../lib/tracker";
import type { ToolbarState } from "../use-toolbar-state";
import type { ActivePopover, ToolbarCallbacks } from "../DesktopToolbar";

interface ExportTabProps {
  state: ToolbarState;
  active: ActivePopover;
  toggle: (key: ActivePopover) => void;
  close: () => void;
  callbacks: ToolbarCallbacks;
}

export const ExportTab: React.FC<ExportTabProps> = ({ state: s, active, toggle, close, callbacks }) => {
  const isOpen = active === "export";
  const handleClick = (): void => {
    if (!isOpen) trackEvent("home", "export_dialog_opened", { details: { source: "desktop_toolbar" } });
    toggle("export");
  };
  return (
    <div className="relative" data-tutorial="home-export">
      <TabButton icon={<Download size={14} strokeWidth={2} />} label="export" primary expanded={isOpen} onClick={handleClick} disabled={!s.hasImage} disabledTooltip="Upload an image first" />
      {isOpen && (
        <Popover onClose={close} className="right-0">
          <ExportPopover transparentBg={callbacks.transparentBg} onToggleTransparentBg={callbacks.onToggleTransparentBg} onDownloadRaster={callbacks.onDownloadRaster} onDownloadSvg={callbacks.onDownloadSvg} onSharePreset={callbacks.onSharePreset} shareState={callbacks.shareState} isLUT={!!s.lutId} imageData={s.image ?? undefined} effectsData={s.effectsData} onClose={close} />
        </Popover>
      )}
    </div>
  );
};
