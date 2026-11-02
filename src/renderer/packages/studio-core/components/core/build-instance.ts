import type { Layer } from "../../model/studio-types";
import type { InstanceMeta, InstanceOverrides } from "../../model/component-types";
import { fitChildrenToSize } from "./instance-resize";
import { instanceChildId, instanceSourceKey } from "./instance-ids";
import { childrenOf, withChildren, type ComponentContainer } from "../tree/layer-walk";
import { INSTANCE_OWNED_KEYS, ROOT_OVERRIDE_KEY } from "./override-keys";
import { omitLayerKeys, pickLayerKeys } from "../tree/layer-keys";

const copyForInstance = (layer: Layer, instanceId: string, overrides: InstanceOverrides): Layer => {
  const applied = {
    ...omitLayerKeys(layer, ["component"]),
    ...(overrides[layer.id] ?? {}),
    id: instanceChildId(instanceId, layer.id),
  } as unknown as Layer;
  return withChildren(applied, childrenOf(layer).map((child) => copyForInstance(child, instanceId, overrides)));
};

const foreignChildren = (instance: Layer, keepForeign: boolean): Layer[] =>
  keepForeign ? childrenOf(instance).filter((child) => instanceSourceKey(instance.id, child.id) === null) : [];

const buildRoot = (instance: Layer, main: ComponentContainer, overrides: InstanceOverrides): Layer =>
  ({
    ...omitLayerKeys(main, ["component", "layers"]),
    ...(overrides[ROOT_OVERRIDE_KEY] ?? {}),
    ...pickLayerKeys(instance, INSTANCE_OWNED_KEYS),
  }) as unknown as Layer;

export const buildInstance = (
  instance: Layer,
  meta: InstanceMeta,
  main: ComponentContainer,
  keepForeign: boolean,
): Layer => {
  const overrides = meta.overrides ?? {};
  const sized = fitChildrenToSize(main, { width: instance.width, height: instance.height }, meta.resize ?? "auto");
  const children = sized.map((child) => copyForInstance(child, instance.id, overrides));
  const root = buildRoot({ ...instance, instance: meta } as Layer, main, overrides);
  return withChildren(root, [...children, ...foreignChildren(instance, keepForeign)]);
};
