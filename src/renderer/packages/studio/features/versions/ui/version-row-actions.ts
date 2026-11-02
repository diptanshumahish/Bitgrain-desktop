import { emitDialog } from "@bitgrain/ui/dialogs/dialog-events";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import { removeVersion, renameVersion } from "../storage/version-edits";
import { refreshVersions } from "../storage/versions-store";
import { versionDisplayName } from "../version-labels";
import type { ProjectVersion } from "../version-types";

const reloadAfter = async (version: ProjectVersion, succeeded: boolean, failTitle: string): Promise<void> => {
  if (!succeeded) {
    emitStatusToast({ title: failTitle, detail: "Check your connection and try again." });
    return;
  }
  try {
    await refreshVersions(version.projectKey);
  } catch (error) {
    emitStatusToast({ title: "Could not reload versions", detail: String(error) });
  }
};

const runEdit = async (version: ProjectVersion, edit: () => Promise<boolean>, failTitle: string): Promise<void> => {
  const succeeded = await edit().catch(() => false);
  await reloadAfter(version, succeeded, failTitle);
};

const applyRename = async (version: ProjectVersion, name: string): Promise<void> => {
  const trimmed = name.trim();
  if (!trimmed || trimmed === version.name) return;
  await runEdit(version, () => renameVersion(version, trimmed), "Could not rename version");
  trackEvent("studio", "version_renamed");
};

const applyDelete = async (version: ProjectVersion): Promise<void> => {
  await runEdit(version, () => removeVersion(version), "Could not delete version");
  trackEvent("studio", "version_deleted", { details: { auto: version.auto } });
};

export function promptRenameVersion(version: ProjectVersion): void {
  emitDialog({
    type: "prompt",
    title: "Rename version",
    label: "Version name",
    defaultValue: versionDisplayName(version),
    notice: version.auto ? "Renaming an autosave keeps it until you delete it." : undefined,
    confirmLabel: "Rename",
    onSubmit: (value) => void applyRename(version, value),
  });
}

export function confirmDeleteVersion(version: ProjectVersion): void {
  emitDialog({
    type: "confirm",
    title: "Delete version?",
    message: `"${versionDisplayName(version)}" will be removed from this device and your cloud.`,
    confirmLabel: "Delete",
    cancelLabel: "Keep it",
    danger: true,
    safeDefault: true,
    onConfirm: () => void applyDelete(version),
  });
}

export function confirmRestoreVersion(version: ProjectVersion, onRestore: (version: ProjectVersion) => void): void {
  emitDialog({
    type: "confirm",
    title: "Restore this version?",
    message: "Your current design is saved as a version first, and you can undo the restore.",
    confirmLabel: "Restore",
    cancelLabel: "Cancel",
    onConfirm: () => onRestore(version),
  });
}
