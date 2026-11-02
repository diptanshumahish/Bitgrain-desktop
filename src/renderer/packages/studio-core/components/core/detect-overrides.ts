import type { Layer } from "../../model/studio-types";
import type { InstanceOverrides } from "../../model/component-types";
import { deepEqual } from "../tree/deep-equal";
import { instanceSourceKey } from "./instance-ids";
import { childrenOf, flattenTree, indexTree, type ComponentContainer } from "../tree/layer-walk";
import { GEOMETRY_KEYS, overrideKeysFor, readLayerValue, ROOT_OVERRIDE_KEY } from "./override-keys";

interface DetectContext {
  prev: Layer;
  next: Layer;
  main: ComponentContainer;
  sizeChanged: boolean;
}

const setOverride = (
  overrides: InstanceOverrides,
  key: string,
  prop: string,
  value: unknown,
): InstanceOverrides => {
  const entry = { ...(overrides[key] ?? {}) };
  if (value === undefined) delete entry[prop];
  else entry[prop] = value;
  const next = { ...overrides };
  if (Object.keys(entry).length === 0) delete next[key];
  else next[key] = entry;
  return next;
};

const diffNode = (overrides: InstanceOverrides, key: string, node: Layer, before: Layer, source: Layer, context: DetectContext): InstanceOverrides => {
  let result = overrides;
  for (const prop of overrideKeysFor(node)) {
    if (context.sizeChanged && GEOMETRY_KEYS.has(prop)) continue;
    const value = readLayerValue(node, prop);
    if (deepEqual(value, readLayerValue(before, prop))) continue;
    result = setOverride(result, key, prop, deepEqual(value, readLayerValue(source, prop)) ? undefined : value);
  }
  return result;
};

const diffChildren = (overrides: InstanceOverrides, context: DetectContext): InstanceOverrides => {
  const mainIndex = indexTree(context.main.layers);
  const prevIndex = indexTree(childrenOf(context.prev));
  let result = overrides;
  for (const node of flattenTree(childrenOf(context.next))) {
    const key = instanceSourceKey(context.next.id, node.id);
    const source = key ? mainIndex.get(key) : undefined;
    const before = prevIndex.get(node.id);
    if (key && source && before) result = diffNode(result, key, node, before, source, context);
  }
  return result;
};

const markRemovedHidden = (overrides: InstanceOverrides, context: DetectContext): InstanceOverrides => {
  const nextIndex = indexTree(childrenOf(context.next));
  const mainIndex = indexTree(context.main.layers);
  let result = overrides;
  for (const before of flattenTree(childrenOf(context.prev))) {
    const key = instanceSourceKey(context.prev.id, before.id);
    if (key && mainIndex.has(key) && !nextIndex.has(before.id)) result = setOverride(result, key, "visible", false);
  }
  return result;
};

const diffRoot = (overrides: InstanceOverrides, context: DetectContext): InstanceOverrides => {
  let result = overrides;
  for (const prop of overrideKeysFor(context.next)) {
    if (prop === "visible") continue;
    const value = readLayerValue(context.next, prop);
    if (deepEqual(value, readLayerValue(context.prev, prop))) continue;
    const matchesMain = deepEqual(value, readLayerValue(context.main, prop));
    result = setOverride(result, ROOT_OVERRIDE_KEY, prop, matchesMain ? undefined : value);
  }
  return result;
};

export const detectOverrides = (prev: Layer, next: Layer, main: ComponentContainer): InstanceOverrides => {
  const sizeChanged = prev.width !== next.width || prev.height !== next.height;
  const context: DetectContext = { prev, next, main, sizeChanged };
  const base = next.instance?.overrides ?? {};
  return diffRoot(markRemovedHidden(diffChildren(base, context), context), context);
};
