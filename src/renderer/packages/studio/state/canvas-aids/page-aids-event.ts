import type { LayoutGrid, PageGuide } from "@bitgrain/studio-core/model/layout-grid-types";
import type { PageSafeZone } from "@bitgrain/studio-core/design-sizes/safe-zone-types";
import { createEventChannel } from "@bitgrain/core/events/event-channel";

const PAGE_AIDS_EVENT = "bg:page-aids-update";

export interface PageAidsPatch {
  guides?: PageGuide[];
  layoutGrids?: LayoutGrid[];
  safeZones?: PageSafeZone[];
  scaleContents?: boolean;
}

interface PageAidsUpdate {
  pageId: string;
  patch: PageAidsPatch;
  recordHistory: boolean;
}

const pageAidsUpdateChannel = createEventChannel<PageAidsUpdate>(PAGE_AIDS_EVENT);

export const emitPageAidsUpdate = pageAidsUpdateChannel.emit;
export const onPageAidsUpdate = pageAidsUpdateChannel.on;

