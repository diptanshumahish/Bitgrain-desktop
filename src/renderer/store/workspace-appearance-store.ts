import { signal } from "../lib/signal";

export type WorkspacePattern = "dots" | "grid" | "none";

export interface WorkspaceAppearance {
  background: string | null;
  pattern: WorkspacePattern;
}

const STORAGE_KEY = "bitgrain_workspace_appearance";

const DEFAULT_APPEARANCE: WorkspaceAppearance = {
  background: null,
  pattern: "dots",
};

const readLocal = (): WorkspaceAppearance => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_APPEARANCE;
    const parsed = JSON.parse(raw) as Partial<WorkspaceAppearance>;
    return {
      background: typeof parsed.background === "string" ? parsed.background : null,
      pattern:
        parsed.pattern === "grid" || parsed.pattern === "none" ? parsed.pattern : "dots",
    };
  } catch {
    return DEFAULT_APPEARANCE;
  }
};

export const workspaceAppearanceSignal = signal<WorkspaceAppearance>(readLocal());

export const setWorkspaceAppearance = (patch: Partial<WorkspaceAppearance>): void => {
  const next = { ...workspaceAppearanceSignal.value, ...patch };
  workspaceAppearanceSignal.value = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore quota errors
  }
};
