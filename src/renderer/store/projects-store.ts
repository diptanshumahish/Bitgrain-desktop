import { signal } from "../lib/signal";
import type { ImageMeta } from "../components/ImageMetaPanel";
import { imageSignal, imageMetaSignal } from "./image-store";
import { captureSnapshot, type TransformSnapshot } from "./transform-store";
import type { InstanceRecord } from "../../shared/bridge";
import {
  activeTab,
  activeInstanceId,
  openDarkroomInstance,
} from "./document-tabs-store";
import {
  instancesSignal,
  refreshInstances,
  writeInstance,
  readInstance,
  deleteInstance,
} from "./workspace-store";

// The darkroom document. The image is embedded as a data URL so the `.bitgrain`
// file is self-contained: it reopens byte-identically with the network unplugged
// and can be exported and shared as a single file.
interface DarkroomDoc {
  version: 1;
  kind: "darkroom";
  transform: TransformSnapshot;
  meta: ImageMeta | null;
  image: string | null;
}

const THUMB_MAX = 400;

// Re-exported so existing callers (Home library, app bootstrap) keep working
// against the unified workspace instead of the old per-project file store.
export const savedProjectsSignal = instancesSignal;
export const savingSignal = signal(false);
export const refreshProjects = refreshInstances;

const toDataUrl = async (url: string): Promise<string> => {
  const response = await fetch(url);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
};

const makeThumbnail = async (url: string): Promise<string | undefined> => {
  try {
    const response = await fetch(url);
    const bitmap = await createImageBitmap(await response.blob());
    const scale = Math.min(1, THUMB_MAX / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = new OffscreenCanvas(width, height);
    const context = canvas.getContext("2d");
    if (!context) return undefined;
    context.drawImage(bitmap, 0, 0, width, height);
    const blob = await canvas.convertToBlob({ type: "image/png" });
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return undefined;
  }
};

export const canSaveActive = (): boolean => {
  const tab = activeTab();
  return tab?.kind === "darkroom" && !!imageSignal.value;
};

// Writes the active darkroom tab to its workspace instance. `withThumbnail`
// controls the extra render pass: skipped on autosave, done on explicit save.
export const saveActiveDarkroom = async (withThumbnail = true): Promise<void> => {
  const tab = activeTab();
  const image = imageSignal.value;
  if (!tab || tab.kind !== "darkroom" || !tab.instanceId || !image) return;

  savingSignal.value = true;
  try {
    const meta = imageMetaSignal.value;
    const embedded = await toDataUrl(image);
    const doc: DarkroomDoc = {
      version: 1,
      kind: "darkroom",
      transform: captureSnapshot(),
      meta,
      image: embedded,
    };
    const thumbnail = withThumbnail ? await makeThumbnail(image) : undefined;
    await writeInstance({
      id: tab.instanceId,
      kind: "darkroom",
      title: tab.title,
      doc,
      thumbnail,
    });
    seedAutosave(tab.instanceId);
  } catch {
    // surface nothing; a failed save leaves the in-memory document intact
  } finally {
    savingSignal.value = false;
  }
};

export const openProject = async (record: InstanceRecord): Promise<void> => {
  if (record.kind !== "darkroom") return;
  const loaded = await readInstance<DarkroomDoc>(record.id);
  if (!loaded) return;
  openDarkroomInstance(record.id, record.title, {
    image: loaded.doc.image,
    meta: loaded.doc.meta,
    transform: loaded.doc.transform,
  });
  seedAutosave(record.id);
};

export const removeProject = async (id: string): Promise<void> => {
  await deleteInstance(id);
};

// Autosave: keep the active darkroom document current on disk. A cheap interval
// diffs live state against what was last written for that instance and re-saves
// only on a real change. Nothing is auto-restored on startup: a new darkroom tab
// is always blank, and previously saved documents reappear in the Home library.
const AUTOSAVE_INTERVAL_MS = 4000;
const lastAutosaved = new Map<string, string>();

const documentSignature = (): string =>
  JSON.stringify({ image: imageSignal.value, transform: captureSnapshot() });

export const seedAutosave = (instanceId: string): void => {
  lastAutosaved.set(instanceId, documentSignature());
};

export const startAutosave = (): void => {
  setInterval(() => {
    const tab = activeTab();
    const id = activeInstanceId();
    if (!tab || tab.kind !== "darkroom" || !id || !imageSignal.value) return;
    const signature = documentSignature();
    if (lastAutosaved.get(id) === signature) return;
    lastAutosaved.set(id, signature);
    void saveActiveDarkroom(false);
  }, AUTOSAVE_INTERVAL_MS);
};
