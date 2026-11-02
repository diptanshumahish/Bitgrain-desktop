import { useEffect, useRef } from "react";
import { emitStatusToast } from "@bitgrain/ui/overlays/status-toast/status-toast-events";
import { useAutoVersions } from "./capture/use-auto-versions";
import { isSaveVersionShortcut } from "./capture/version-shortcut";
import { emitVersionHistory, onVersionCommand, type VersionCommand } from "./version-events";
import {
  previewVersion, promptSaveVersion, restoreVersion, saveAutoVersion, type VersionBindings,
} from "./version-operations";
import { refreshVersions } from "./storage/versions-store";

const IMPORT_CHECKPOINT_NAME = "Before opening a .btg file";

interface UseProjectVersionsArgs extends VersionBindings {
  enabled: boolean;
  isBusy?: () => boolean;
}

const notifyUnsupported = (): void =>
  emitStatusToast({ title: "Version history is off here", detail: "Templates keep their own history in the admin." });

const openHistory = (bindingsRef: React.MutableRefObject<VersionBindings>): void => {
  const projectKey = bindingsRef.current.projectKey;
  emitVersionHistory({
    projectKey,
    onSaveVersion: () => promptSaveVersion(bindingsRef.current),
    onPreview: (version) => void previewVersion(bindingsRef.current, version),
    onRestore: (version) => void restoreVersion(bindingsRef.current, version),
  });
  refreshVersions(projectKey).catch((error: unknown) =>
    emitStatusToast({ title: "Could not load versions", detail: String(error) }),
  );
};

const dispatchVersionCommand = (
  command: VersionCommand, bindingsRef: React.MutableRefObject<VersionBindings>, enabled: boolean,
): void => {
  if (command === "checkpoint-import" && enabled) {
    void saveAutoVersion(bindingsRef.current, IMPORT_CHECKPOINT_NAME);
    return;
  }
  if (command === "checkpoint-import") return;
  if (!enabled) return notifyUnsupported();
  if (command === "save") return promptSaveVersion(bindingsRef.current);
  openHistory(bindingsRef);
};

export const useProjectVersions = ({ enabled, isBusy, ...bindings }: UseProjectVersionsArgs): void => {
  const bindingsRef = useRef<VersionBindings>(bindings);
  const enabledRef = useRef(enabled);

  useEffect(() => {
    bindingsRef.current = bindings;
    enabledRef.current = enabled;
  });

  useAutoVersions({
    enabled,
    changeToken: bindings.source.pages,
    isBusy,
    onDue: () => void saveAutoVersion(bindingsRef.current, ""),
  });

  useEffect(() => {
    const runCommand = (command: VersionCommand): void =>
      dispatchVersionCommand(command, bindingsRef, enabledRef.current);
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (!isSaveVersionShortcut(event)) return;
      event.preventDefault();
      runCommand("save");
    };
    const stopCommands = onVersionCommand(runCommand);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      stopCommands();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
};
