import React from "react";
import { PopoverPortal } from "@bitgrain/ui/overlays/PopoverPortal";
import { ExportPopupPortal } from "../../panels/ExportPopupPortal";
import { ContextMenuPortal } from "@bitgrain/ui/overlays/ContextMenuPortal";
import { SvgImportChoicePortal } from "../../features/svg-import/intake/SvgImportChoicePortal";
import { VersionHistoryPortal } from "../../features/versions/ui/VersionHistoryPortal";
import { SharingPortal } from "../../features/sharing/studio/SharingPortal";
import { PluginFloatingWindow } from "../../plugins/host";
import { SlideSorterPortal } from "../../features/presenter/sorter/ui/slide-sorter-portal";
import { FindReplacePortal } from "../../find-replace/ui/FindReplacePortal";
import { CommandPalettePortal } from "../../features/command-palette/ui/CommandPalettePortal";

const StudioPortalsContent: React.FC = () => (
  <>
    <PopoverPortal />
    <ExportPopupPortal />
    <SvgImportChoicePortal />
    <ContextMenuPortal />
    <VersionHistoryPortal />
    <SharingPortal />
    <PluginFloatingWindow />
    <SlideSorterPortal />
    <FindReplacePortal />
    <CommandPalettePortal />
  </>
);

export const StudioPortals = React.memo(StudioPortalsContent);
