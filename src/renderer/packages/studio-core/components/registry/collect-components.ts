import type { ComponentEntry, ComponentSet, VariantProperty } from "../../model/component-types";
import { flattenTree, isComponentContainer, type LayerPageLike } from "../tree/layer-walk";

export const collectComponents = (pages: LayerPageLike[]): ComponentEntry[] => {
  const entries: ComponentEntry[] = [];
  const seen = new Set<string>();
  for (const page of pages) {
    for (const layer of flattenTree(page.layers)) {
      const meta = layer.component;
      if (!meta || !isComponentContainer(layer) || seen.has(meta.id)) continue;
      seen.add(meta.id);
      entries.push({
        id: meta.id,
        name: layer.name,
        layerId: layer.id,
        pageId: page.id,
        type: layer.type,
        width: layer.width,
        height: layer.height,
        setId: meta.setId,
        setName: meta.setName,
        variant: meta.variant,
      });
    }
  }
  return entries;
};

const variantProperties = (members: ComponentEntry[]): VariantProperty[] => {
  const valuesByName = new Map<string, string[]>();
  for (const member of members) {
    for (const [name, value] of Object.entries(member.variant ?? {})) {
      const values = valuesByName.get(name) ?? [];
      if (!values.includes(value)) valuesByName.set(name, [...values, value]);
      else valuesByName.set(name, values);
    }
  }
  return [...valuesByName.entries()].map(([name, values]) => ({ name, values }));
};

export const componentSetOf = (entries: ComponentEntry[], setId: string | undefined): ComponentSet | null => {
  if (!setId) return null;
  const members = entries.filter((entry) => entry.setId === setId);
  if (members.length === 0) return null;
  return {
    id: setId,
    name: members[0].setName ?? members[0].name,
    properties: variantProperties(members),
    componentIds: members.map((member) => member.id),
  };
};

export const variantLabel = (entry: ComponentEntry): string =>
  Object.entries(entry.variant ?? {}).map(([name, value]) => `${name}: ${value}`).join(", ");
