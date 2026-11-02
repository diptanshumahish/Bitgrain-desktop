export type VariantProps = Record<string, string>;

export interface ComponentMeta {
  id: string;
  setId?: string;
  setName?: string;
  variant?: VariantProps;
}

export type OverrideValues = Record<string, unknown>;

export type InstanceOverrides = Record<string, OverrideValues>;

export type InstanceResizeMode = "auto" | "scale";

export interface InstanceMeta {
  componentId: string;
  overrides?: InstanceOverrides;
  resize?: InstanceResizeMode;
}

export interface ComponentEntry {
  id: string;
  name: string;
  layerId: string;
  pageId: string;
  type: "group" | "frame";
  width: number;
  height: number;
  setId?: string;
  setName?: string;
  variant?: VariantProps;
}

export interface VariantProperty {
  name: string;
  values: string[];
}

export interface ComponentSet {
  id: string;
  name: string;
  properties: VariantProperty[];
  componentIds: string[];
}
