import { signal, useSignalValue } from "../lib/signal";

export type LeftPanelTab = "layers" | "templates" | "elements";
export type TabSlideDirection = "left" | "right";

const LEFT_PANEL_TAB_ORDER: LeftPanelTab[] = ["layers", "elements", "templates"];

const leftPanelCollapsed = signal(false);
const rightPanelCollapsed = signal(false);
const leftPanelTab = signal<LeftPanelTab>("layers");
const leftPanelTabDirection = signal<TabSlideDirection>("right");

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

export function useLeftPanelTab(): LeftPanelTab {
  return useSignalValue(leftPanelTab);
}

export function useLeftPanelTabDirection(): TabSlideDirection {
  return useSignalValue(leftPanelTabDirection);
}

export function setLeftPanelTab(tab: LeftPanelTab): void {
  const movingRight = LEFT_PANEL_TAB_ORDER.indexOf(tab) > LEFT_PANEL_TAB_ORDER.indexOf(leftPanelTab.value);
  leftPanelTabDirection.value = movingRight ? "right" : "left";
  leftPanelTab.value = tab;
}
