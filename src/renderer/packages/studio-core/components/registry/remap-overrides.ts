import type { Layer } from "../../model/studio-types";
import type { InstanceOverrides, OverrideValues } from "../../model/component-types";
import { overrideKeysFor, ROOT_OVERRIDE_KEY } from "../core/override-keys";
import { childrenOf, type ComponentContainer } from "../tree/layer-walk";

interface PathedLayer {
  path: string;
  layer: Layer;
}

const PATH_SEPARATOR = "/";

const pathsOf = (layers: Layer[], parentPath: string): PathedLayer[] => {
  const seenNames = new Map<string, number>();
  return layers.flatMap((layer) => {
    const occurrence = seenNames.get(layer.name) ?? 0;
    seenNames.set(layer.name, occurrence + 1);
    const path = `${parentPath}${PATH_SEPARATOR}${layer.name}#${occurrence}`;
    return [{ path, layer }, ...pathsOf(childrenOf(layer), path)];
  });
};

const compatibleValues = (values: OverrideValues, target: Layer): OverrideValues => {
  const allowed = new Set(overrideKeysFor(target));
  return Object.fromEntries(Object.entries(values).filter(([prop]) => allowed.has(prop)));
};

const remapChild = (key: string, values: OverrideValues, fromById: Map<string, string>, toByPath: Map<string, Layer>): [string, OverrideValues] | null => {
  const path = fromById.get(key);
  const target = path ? toByPath.get(path) : undefined;
  if (!target) return null;
  const kept = compatibleValues(values, target);
  return Object.keys(kept).length > 0 ? [target.id, kept] : null;
};

export const remapOverrides = (
  overrides: InstanceOverrides,
  from: ComponentContainer,
  to: ComponentContainer,
): InstanceOverrides => {
  const fromById = new Map(pathsOf(from.layers, "").map((entry) => [entry.layer.id, entry.path]));
  const toByPath = new Map(pathsOf(to.layers, "").map((entry) => [entry.path, entry.layer]));
  const remapped: InstanceOverrides = {};
  for (const [key, values] of Object.entries(overrides)) {
    if (key === ROOT_OVERRIDE_KEY) {
      const kept = compatibleValues(values, to);
      if (Object.keys(kept).length > 0) remapped[key] = kept;
      continue;
    }
    const entry = remapChild(key, values, fromById, toByPath);
    if (entry) remapped[entry[0]] = entry[1];
  }
  return remapped;
};
