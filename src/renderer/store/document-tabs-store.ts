import { signal } from "../lib/signal";
import type { ImageMeta } from "../components/ImageMetaPanel";
import {
  imageSignal,
  isSampleSignal,
  imageMetaSignal,
  previewLoadingSignal,
  objectUrlRef,
} from "./image-store";
import {
  captureSnapshot,
  applySnapshot,
  type TransformSnapshot,
} from "./transform-store";

import { newInstanceId } from "./workspace-store";
import type { TemplateDef } from "../data/studioTypes";

export type TabKind = "home" | "darkroom" | "studio" | "video";

interface DarkroomState {
  image: string | null;
  isSample: boolean;
  meta: ImageMeta | null;
  transform: TransformSnapshot;
}

export interface DocumentTab {
  id: string;
  kind: TabKind;
  title: string;
  pinned?: boolean;
  renamed?: boolean;
  // Stable workspace-file identity. Every non-home tab owns one from creation, so
  // its document is a distinct `.bitgrain` file and a new tab never reopens an
  // existing one. Reopening from the library reuses the same instanceId.
  instanceId?: string;
  darkroom?: DarkroomState;
  // For a studio tab opened from a starter format/template: the canvas the studio
  // seeds itself from on first mount. Only meaningful for a brand-new studio tab
  // with no saved `.bitgrain` file yet; once saved, the file is the source.
  initialTemplate?: TemplateDef;
}

export interface LoadedDarkroom {
  image: string | null;
  meta: ImageMeta | null;
  transform: TransformSnapshot;
}

const KIND_TITLES: Record<TabKind, string> = {
  home: "Home",
  darkroom: "Untitled",
  studio: "Studio",
  video: "Video",
};

const defaultTransform: TransformSnapshot = captureSnapshot();

let idCounter = 0;
const nextId = (): string => `tab-${(idCounter += 1)}`;

const emptyDarkroom = (): DarkroomState => ({
  image: null,
  isSample: false,
  meta: null,
  transform: defaultTransform,
});

const titleFromMeta = (meta: ImageMeta | null): string => meta?.name ?? "Untitled";

const homeTab: DocumentTab = { id: nextId(), kind: "home", title: "Home", pinned: true };

export const documentTabsSignal = signal<DocumentTab[]>([homeTab]);
export const activeTabIdSignal = signal<string>(homeTab.id);

export const activeTab = (): DocumentTab | undefined =>
  documentTabsSignal.value.find((tab) => tab.id === activeTabIdSignal.value);

export const activeInstanceId = (): string | undefined => activeTab()?.instanceId;

const readLiveDarkroom = (): DarkroomState => ({
  image: imageSignal.value,
  isSample: isSampleSignal.value,
  meta: imageMetaSignal.value,
  transform: captureSnapshot(),
});

const writeLiveDarkroom = (state: DarkroomState): void => {
  objectUrlRef.current = state.image?.startsWith("blob:") ? state.image : null;
  imageSignal.value = state.image;
  isSampleSignal.value = state.isSample;
  imageMetaSignal.value = state.meta;
  previewLoadingSignal.value = false;
  applySnapshot(state.transform);
};

const commitActive = (): void => {
  const current = activeTab();
  if (!current || current.kind !== "darkroom") return;
  const darkroom = readLiveDarkroom();
  documentTabsSignal.value = documentTabsSignal.value.map((tab) =>
    tab.id === current.id
      ? { ...tab, darkroom, title: tab.renamed ? tab.title : titleFromMeta(darkroom.meta) }
      : tab,
  );
};

const activate = (tab: DocumentTab): void => {
  activeTabIdSignal.value = tab.id;
  if (tab.kind === "darkroom") writeLiveDarkroom(tab.darkroom ?? emptyDarkroom());
};

export const switchTab = (id: string): void => {
  if (id === activeTabIdSignal.value) return;
  commitActive();
  const target = documentTabsSignal.value.find((tab) => tab.id === id);
  if (target) activate(target);
};

export const openTab = (kind: TabKind): string => {
  commitActive();
  const tab: DocumentTab = {
    id: nextId(),
    kind,
    title: KIND_TITLES[kind],
    // A fresh instance id per document. Studio and video load their (absent)
    // document by this id and start blank; darkroom starts from emptyDarkroom.
    instanceId: kind === "home" ? undefined : newInstanceId(),
    darkroom: kind === "darkroom" ? emptyDarkroom() : undefined,
  };
  documentTabsSignal.value = [...documentTabsSignal.value, tab];
  activate(tab);
  return tab.id;
};

// Opens a new studio tab seeded from a starter format/template. Like a blank
// studio tab, but the studio mounts at the template's size and layers instead of
// an empty canvas. The tab still owns a fresh instance id, so it autosaves to its
// own `.bitgrain` file and never collides with another document.
export const openStudioTemplate = (template: TemplateDef): string => {
  commitActive();
  const tab: DocumentTab = {
    id: nextId(),
    kind: "studio",
    title: template.name || KIND_TITLES.studio,
    renamed: !!template.name,
    instanceId: newInstanceId(),
    initialTemplate: template,
  };
  documentTabsSignal.value = [...documentTabsSignal.value, tab];
  activate(tab);
  return tab.id;
};

// Updates the active tab's saved title (e.g. after a first save names the file).
export const setActiveTabTitle = (title: string): void => {
  const current = activeTab();
  if (!current) return;
  documentTabsSignal.value = documentTabsSignal.value.map((tab) =>
    tab.id === current.id ? { ...tab, title, renamed: true } : tab,
  );
};

// Opens a studio/video document from the library. If a tab already holds that
// instance it is focused; otherwise a fresh tab bound to the instanceId is
// created and the surface loads the document by id.
export const openInstanceTab = (
  instanceId: string,
  kind: Exclude<TabKind, "home" | "darkroom">,
  title: string,
): void => {
  const existing = documentTabsSignal.value.find((tab) => tab.instanceId === instanceId);
  if (existing) {
    switchTab(existing.id);
    return;
  }
  commitActive();
  const tab: DocumentTab = { id: nextId(), kind, title, renamed: true, instanceId };
  documentTabsSignal.value = [...documentTabsSignal.value, tab];
  activate(tab);
};

// Opens a darkroom document from the library into its own tab, reusing the tab
// if the same instance is already open.
export const openDarkroomInstance = (
  instanceId: string,
  title: string,
  state: LoadedDarkroom,
): void => {
  const existing = documentTabsSignal.value.find((tab) => tab.instanceId === instanceId);
  if (existing) {
    switchTab(existing.id);
    return;
  }
  commitActive();
  const tab: DocumentTab = {
    id: nextId(),
    kind: "darkroom",
    title,
    renamed: true,
    instanceId,
    darkroom: {
      image: state.image,
      isSample: false,
      meta: state.meta,
      transform: state.transform,
    },
  };
  documentTabsSignal.value = [...documentTabsSignal.value, tab];
  activate(tab);
};

// Reorders tabs by dropping one onto another. Pinned tabs (Home) never move and
// nothing can be dropped before them.
export const moveTab = (draggedId: string, targetId: string): void => {
  if (draggedId === targetId) return;
  const tabs = [...documentTabsSignal.value];
  const from = tabs.findIndex((tab) => tab.id === draggedId);
  const to = tabs.findIndex((tab) => tab.id === targetId);
  if (from < 0 || to < 0 || tabs[from].pinned || tabs[to].pinned) return;
  const [moved] = tabs.splice(from, 1);
  tabs.splice(to, 0, moved);
  documentTabsSignal.value = tabs;
};

export const renameTab = (id: string, title: string): void => {
  const clean = title.trim();
  if (!clean) return;
  documentTabsSignal.value = documentTabsSignal.value.map((tab) =>
    tab.id === id ? { ...tab, title: clean, renamed: true } : tab,
  );
};

export const closeTab = (id: string): void => {
  const tabs = documentTabsSignal.value;
  const closing = tabs.find((tab) => tab.id === id);
  if (!closing || closing.pinned) return;
  if (closing.darkroom?.image?.startsWith("blob:")) {
    URL.revokeObjectURL(closing.darkroom.image);
  }

  const index = tabs.findIndex((tab) => tab.id === id);
  const remaining = tabs.filter((tab) => tab.id !== id);
  documentTabsSignal.value = remaining;

  if (id === activeTabIdSignal.value) {
    activate(remaining[Math.max(0, index - 1)]);
  }
};

// Keeps the active darkroom tab's title in sync as the user loads images.
imageMetaSignal.subscribe(() => {
  const current = activeTab();
  if (!current || current.kind !== "darkroom" || current.renamed) return;
  const title = titleFromMeta(imageMetaSignal.value);
  documentTabsSignal.value = documentTabsSignal.value.map((tab) =>
    tab.id === current.id ? { ...tab, title } : tab,
  );
});
