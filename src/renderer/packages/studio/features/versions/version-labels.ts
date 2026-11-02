import type { ProjectVersion, VersionCloudState } from "./version-types";

const TIME_FORMAT: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" };

export const formatVersionTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleString(undefined, TIME_FORMAT);

export const versionDisplayName = (version: ProjectVersion): string =>
  version.name || (version.auto ? "Autosave" : "Untitled version");

export const defaultVersionName = (): string => `Version, ${formatVersionTime(Date.now())}`;

const CLOUD_LABELS: Record<VersionCloudState, string> = {
  local: "On this device",
  pending: "Waiting to sync",
  synced: "Synced",
  remote: "In your cloud",
};

export const cloudStateLabel = (state: VersionCloudState): string => CLOUD_LABELS[state];

const SAVED_DETAILS: Record<VersionCloudState, string> = {
  local: "Kept on this device. Open Version history to see it.",
  pending: "Kept on this device, cloud sync will try again later.",
  synced: "Kept on this device and in your cloud.",
  remote: "Kept in your cloud.",
};

export const savedVersionDetail = (state: VersionCloudState): string => SAVED_DETAILS[state];
