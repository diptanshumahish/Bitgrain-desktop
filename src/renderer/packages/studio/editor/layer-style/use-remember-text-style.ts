import { useEffect } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { findSelectedLayers } from "@bitgrain/studio-core/layers/studio-layers";
import { rememberTextStyleFrom } from "./text-style-memory";

export const useRememberTextStyle = (layers: Layer[], selectedIds: string[]): void => {
  useEffect(() => {
    rememberTextStyleFrom(findSelectedLayers(layers, selectedIds));
  }, [layers, selectedIds]);
};
