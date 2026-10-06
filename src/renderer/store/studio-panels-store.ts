import { signal, useSignalValue } from "../lib/signal";

const leftPanelCollapsed = signal(false);
const rightPanelCollapsed = signal(false);
const leftLayersCollapsed = signal(false);
const leftTemplatesCollapsed = signal(false);

export function useLeftPanelCollapsed(): boolean {
  return useSignalValue(leftPanelCollapsed);
}

export function useRightPanelCollapsed(): boolean {
  return useSignalValue(rightPanelCollapsed);
}

export function toggleLeftPanel(): void {
  leftPanelCollapsed.value = !leftPanelCollapsed.value;
}

export function toggleRightPanel(): void {
  rightPanelCollapsed.value = !rightPanelCollapsed.value;
}

export function useLeftLayersCollapsed(): boolean {
  return useSignalValue(leftLayersCollapsed);
}

export function useLeftTemplatesCollapsed(): boolean {
  return useSignalValue(leftTemplatesCollapsed);
}

export function toggleLeftLayers(): void {
  leftLayersCollapsed.value = !leftLayersCollapsed.value;
}

export function toggleLeftTemplates(): void {
  leftTemplatesCollapsed.value = !leftTemplatesCollapsed.value;
}
