import type { WorkPage } from "@bitgrain/studio-core/model/work";

export const DRAFT_PROJECT_KEY = "draft";

export interface VersionSnapshot {
  pages: WorkPage[];
  activePageId: string;
  canvasW: number;
  canvasH: number;
}

export type VersionCloudState = "local" | "pending" | "synced" | "remote";

export interface ProjectVersion {
  id: string;
  projectKey: string;
  name: string;
  auto: boolean;
  createdAt: number;
  thumbnail: string | null;
  snapshot: VersionSnapshot | null;
  cloud: VersionCloudState;
}

export interface NewVersionInput {
  projectKey: string;
  name: string;
  auto: boolean;
  snapshot: VersionSnapshot;
  thumbnail: string | null;
}
