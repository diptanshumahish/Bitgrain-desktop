import type { Layer } from "@bitgrain/studio-core/model/studio-types";

export interface PageSectionHandlers extends Record<string, (...args: never[]) => unknown> {
  onSelectPage: (id: string) => void;
  onSelectFramePage: (id: string) => void;
  onToggleCollapse: (pageId: string) => void;
  onDuplicatePage: (pageId: string) => void;
  onDeletePage: (id: string) => void;
  onSelect: (id: string, multi?: boolean) => void;
  onSelectIds: (ids: string[]) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
  onReorderLayersForPage: (pageId: string, layers: Layer[]) => void;
  onGroup: () => void;
  onUngroup: () => void;
  onDuplicate: (ids: string[]) => void;
  readSelectedIds: () => string[];
}
