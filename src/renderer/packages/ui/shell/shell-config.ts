import type React from "react";
import { signal, useSignalValue } from "@bitgrain/core/signal";

export interface WorkspaceSwitcherProps {
  label: string;
}

type RenderWorkspaceSwitcher = (props: WorkspaceSwitcherProps) => React.ReactNode;

interface ShellConfig {
  renderWorkspaceSwitcher?: RenderWorkspaceSwitcher;
  hubPath?: string;
}

const DEFAULT_HUB_PATH = "/";

export const workspaceSwitcherSignal = signal<RenderWorkspaceSwitcher | null>(null);
const hubPathSignal = signal<string>(DEFAULT_HUB_PATH);

export const configureShell = (config: ShellConfig): void => {
  if (config.renderWorkspaceSwitcher) workspaceSwitcherSignal.value = config.renderWorkspaceSwitcher;
  if (config.hubPath) hubPathSignal.value = config.hubPath;
};

export const useHubPath = (): string => useSignalValue(hubPathSignal);
