import type { ProjectVersion } from "./version-types";
import { createEventChannel } from "@bitgrain/core/events/event-channel";

const VERSION_COMMAND_EVENT = "bg:version-command";
const VERSION_HISTORY_EVENT = "bg:version-history";

export type VersionCommand = "save" | "history" | "checkpoint-import";

export interface VersionHistoryRequest {
  projectKey: string;
  onSaveVersion: () => void;
  onPreview: (version: ProjectVersion) => void;
  onRestore: (version: ProjectVersion) => void;
}

const versionCommandChannel = createEventChannel<VersionCommand>(VERSION_COMMAND_EVENT);

export const emitVersionCommand = versionCommandChannel.emit;
export const onVersionCommand = versionCommandChannel.on;

const versionHistoryChannel = createEventChannel<VersionHistoryRequest | null>(VERSION_HISTORY_EVENT);

export const emitVersionHistory = versionHistoryChannel.emit;
export const onVersionHistory = versionHistoryChannel.on;

