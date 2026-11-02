import { signal, useSignalValue } from "@bitgrain/core/signal";

const panelOpen = signal(false);
const expandedLayerIds = signal<readonly string[]>([]);

export const useTrackPanelOpen = (): boolean => useSignalValue(panelOpen);

export const useExpandedLayerIds = (): readonly string[] => useSignalValue(expandedLayerIds);

export const toggleTrackPanel = (): void => {
  panelOpen.value = !panelOpen.value;
};

export const toggleLayerExpanded = (layerId: string): void => {
  const current = expandedLayerIds.value;
  expandedLayerIds.value = current.includes(layerId)
    ? current.filter((id) => id !== layerId)
    : [...current, layerId];
};
