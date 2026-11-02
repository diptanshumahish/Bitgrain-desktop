import React, { memo } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import { buildCommonLayerProps } from "./build-common-layer-props";
import { ContainerLayerItem } from "./container-layer-item";
import { LeafLayerItem, type AdjustmentContext } from "./leaf-layer-item";
import type { LayerGate, LayerItemHandlers } from "./layer-item-types";

export interface ContainerSelection {
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
}

interface LayerViewItemProps {
  layer: Layer;
  index: number;
  inMaskScope: boolean;
  hidden: boolean;
  selected: boolean;
  editing: boolean;
  nodeEditing: boolean;
  containerSelection: ContainerSelection | null;
  nodeEditMode: "move" | "bend";
  image: string | null;
  zoom: number;
  hideSelectionUi: boolean;
  gate: LayerGate;
  handlers: LayerItemHandlers;
  adjustment: AdjustmentContext | null;
}

const renderLayerBody = (props: LayerViewItemProps): React.ReactNode => {
  const { layer, index, inMaskScope, zoom, gate, handlers, image, nodeEditMode, containerSelection } = props;
  if (!layer.visible) return null;
  const hideSelectionUi = props.hideSelectionUi || inMaskScope;
  if ((layer.type === "group" || layer.type === "frame") && containerSelection) {
    return (
      <ContainerLayerItem
        layer={layer}
        index={index}
        {...containerSelection}
        nodeEditMode={nodeEditMode}
        image={image}
        zoom={zoom}
        hideSelectionUi={hideSelectionUi}
        gate={gate}
        handlers={handlers}
      />
    );
  }
  return (
    <LeafLayerItem
      layer={layer}
      common={buildCommonLayerProps({ layer, index, zoom, hideSelectionUi, gate, handlers })}
      selected={props.selected}
      editing={props.editing}
      nodeEditing={props.nodeEditing}
      nodeEditMode={nodeEditMode}
      image={image}
      gate={gate}
      handlers={handlers}
      adjustment={props.adjustment}
    />
  );
};

const wrapperClassName = (layer: Layer, hidden: boolean): string =>
  `${hidden ? "contents invisible" : "contents"}${layer.locked ? " [&_*]:!pointer-events-none" : ""}`;

const LayerViewItemComponent = (props: LayerViewItemProps): React.ReactElement => {
  const body = renderLayerBody(props);
  if (props.inMaskScope) return <>{body}</>;
  return <div className={wrapperClassName(props.layer, props.hidden)}>{body}</div>;
};

export const LayerViewItem = memo(LayerViewItemComponent);
