import React, { useMemo } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { studioPagesSignal } from "../../../../state/studio-document-store";
import { collectComponents } from "@bitgrain/studio-core/components/registry/collect-components";
import { countInstances } from "@bitgrain/studio-core/components/registry/count-instances";
import { findInstanceAncestor } from "@bitgrain/studio-core/components/tree/layer-walk";
import { MainComponentPanel } from "./main-component-panel";
import { InstancePanel } from "./instance-panel";
import { InstanceChildNote } from "./instance-child-note";

const NO_ENTRIES: ReturnType<typeof collectComponents> = [];

interface ComponentPanelSectionProps {
  layer: Layer;
}

export const ComponentPanelSection: React.FC<ComponentPanelSectionProps> = ({ layer }) => {
  const pages = useSignalValue(studioPagesSignal);
  const instance = useMemo(
    () => pages.map((page) => findInstanceAncestor(page.layers, layer.id)).find((found) => found !== null) ?? null,
    [pages, layer.id],
  );
  const needsEntries = Boolean(layer.component) || instance?.id === layer.id;
  const entries = useMemo(() => (needsEntries ? collectComponents(pages) : NO_ENTRIES), [needsEntries, pages]);
  if (layer.component) {
    return <MainComponentPanel layer={layer} entries={entries} instanceCount={countInstances(pages, layer.component.id)} />;
  }
  if (!instance) return null;
  if (instance.id === layer.id) return <InstancePanel instance={instance} entries={entries} />;
  return <InstanceChildNote instance={instance} childId={layer.id} />;
};
