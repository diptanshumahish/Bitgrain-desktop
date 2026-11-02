import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { emitDialog } from "@bitgrain/ui/dialogs/dialog-events";
import { emitStudioModal } from "../../modals/studio-dialog/host/studio-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { requestCanvasFit } from "../../state/canvas-fit-request";
import { canPersistWork } from "../../state/studio-load-state";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { buildVersionInput, type VersionSource } from "./capture/build-version-input";
import { snapshotToState } from "./capture/restore-snapshot";
import { createVersion } from "./storage/version-actions";
import { loadVersionSnapshot } from "./storage/version-edits";
import { refreshVersions } from "./storage/versions-store";
import { emitVersionHistory } from "./version-events";
import { defaultVersionName, savedVersionDetail, versionDisplayName } from "./version-labels";
import type { ProjectVersion } from "./version-types";

export interface VersionBindings {
  projectKey: string;
  source: VersionSource;
  pushHistory: () => void;
  setPages: (pages: TemplatePage[]) => void;
  setActivePageId: (id: string) => void;
  setCanvasW: (width: number) => void;
  setCanvasH: (height: number) => void;
}

const errorDetail = (error: unknown): string =>
  error instanceof Error ? error.message : "Something went wrong while saving.";

const notifyUnavailable = (): void =>
  emitStatusToast({ title: "Could not open version", detail: "Check your connection and try again." });

const storeVersion = async (bindings: VersionBindings, name: string, auto: boolean): Promise<ProjectVersion> =>
  await createVersion(await buildVersionInput(bindings.projectKey, bindings.source, name, auto));

const saveNamedVersion = async (bindings: VersionBindings, name: string): Promise<void> => {
  try {
    const version = await storeVersion(bindings, name.trim() || defaultVersionName(), false);
    emitStatusToast({ title: "Version saved", detail: savedVersionDetail(version.cloud) });
    trackEvent("studio", "version_saved", { details: { cloud: version.cloud } });
    await refreshVersions(bindings.projectKey);
  } catch (error) {
    emitStatusToast({ title: "Could not save version", detail: errorDetail(error) });
  }
};

export function promptSaveVersion(bindings: VersionBindings): void {
  if (!canPersistWork()) return;
  emitDialog({
    type: "prompt",
    title: "Save version",
    label: "Version name",
    defaultValue: defaultVersionName(),
    confirmLabel: "Save version",
    onSubmit: (value) => void saveNamedVersion(bindings, value),
  });
}

export async function saveAutoVersion(bindings: VersionBindings, name: string): Promise<void> {
  if (!canPersistWork()) return;
  try {
    await storeVersion(bindings, name, true);
  } catch (error) {
    emitStatusToast({ title: "Autosave version failed", detail: errorDetail(error) });
  }
}

const applySnapshot = (bindings: VersionBindings, snapshot: NonNullable<ProjectVersion["snapshot"]>): void => {
  const restored = snapshotToState(snapshot);
  bindings.pushHistory();
  bindings.setPages(restored.pages);
  bindings.setActivePageId(restored.activePageId);
  bindings.setCanvasW(snapshot.canvasW);
  bindings.setCanvasH(snapshot.canvasH);
  requestCanvasFit();
};

const restoreFromSnapshot = async (bindings: VersionBindings, version: ProjectVersion): Promise<boolean> => {
  const snapshot = await loadVersionSnapshot(version);
  if (!snapshot) return false;
  await storeVersion(bindings, `Before restoring ${versionDisplayName(version)}`, true);
  applySnapshot(bindings, snapshot);
  return true;
};

export async function restoreVersion(bindings: VersionBindings, version: ProjectVersion): Promise<void> {
  if (!canPersistWork()) return;
  try {
    if (!(await restoreFromSnapshot(bindings, version))) return notifyUnavailable();
  } catch (error) {
    emitStatusToast({ title: "Could not restore version", detail: errorDetail(error) });
    return;
  }
  emitVersionHistory(null);
  emitStatusToast({ title: "Version restored", detail: "Your previous state was kept as a version. Undo also works." });
  trackEvent("studio", "version_restored", { details: { auto: version.auto } });
}

export async function previewVersion(bindings: VersionBindings, version: ProjectVersion): Promise<void> {
  const snapshot = await loadVersionSnapshot(version);
  if (!snapshot) return notifyUnavailable();
  const template = { ...bindings.source.template, width: snapshot.canvasW, height: snapshot.canvasH };
  emitVersionHistory(null);
  emitStudioModal({ type: "present", pages: snapshotToState(snapshot).pages, template, startIndex: 0 });
}
