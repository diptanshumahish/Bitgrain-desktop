import React from "react";
import type { Layer, VectorLayer } from "@bitgrain/studio-core/model/studio-types";
import { ImageLayerView } from "../../layers/ImageLayerView";
import { TextLayerView } from "../../layers/TextLayerView";
import { ShapeLayerView } from "../../layers/ShapeLayerView";
import { UploadLayerView } from "../../layers/UploadLayerView";
import { VectorLayerView } from "../../layers/VectorLayerView";
import { InkLayerView } from "../../layers/InkLayerView";
import { AdjustmentLayerView } from "../../layers/AdjustmentLayerView";
import { isLayerGated, type CommonLayerProps, type LayerGate, type LayerItemHandlers } from "./layer-item-types";

export interface AdjustmentContext {
  belowLayers: Layer[];
  background: string;
  pageWidth: number;
  pageHeight: number;
}

interface LeafLayerItemProps {
  layer: Layer;
  common: CommonLayerProps;
  selected: boolean;
  editing: boolean;
  nodeEditing: boolean;
  nodeEditMode: "move" | "bend";
  image: string | null;
  gate: LayerGate;
  handlers: LayerItemHandlers;
  adjustment: AdjustmentContext | null;
}

export const LeafLayerItem = ({
  layer, common, selected, editing, nodeEditing, nodeEditMode, image, gate, handlers, adjustment,
}: LeafLayerItemProps): React.ReactElement | null => {
  const gated = isLayerGated(layer, gate);
  switch (layer.type) {
    case "image":
      return (
        <ImageLayerView
          layer={layer}
          image={image}
          selected={selected}
          onCropChange={(crop) => handlers.onUpdateLayer(layer.id, { crop })}
          {...common}
        />
      );
    case "text":
      return (
        <TextLayerView
          layer={layer}
          selected={selected}
          editing={editing}
          onStartEdit={() => {
            if (!gated) handlers.onStartEdit(layer.id);
          }}
          onEndEdit={(content, rich) => handlers.onEndEdit(layer.id, content, rich)}
          onCommitText={(content, rich) => handlers.onCommitText(layer.id, content, rich)}
          {...common}
        />
      );
    case "shape":
      return (
        <ShapeLayerView
          layer={layer}
          selected={selected}
          onDoubleClick={() => {
            if (!gated) handlers.onStartVectorEdit(layer.id);
          }}
          {...common}
        />
      );
    case "upload":
      return (
        <UploadLayerView
          layer={layer}
          selected={selected}
          onCropChange={(crop) => handlers.onUpdateLayer(layer.id, { crop })}
          {...common}
        />
      );
    case "vector":
      return (
        <VectorLayerView
          layer={layer}
          selected={selected}
          nodeEditing={nodeEditing}
          nodeEditMode={nodeEditMode}
          onStartNodeEdit={() => {
            if (!gated) handlers.onStartVectorEdit(layer.id);
          }}
          onEndNodeEdit={handlers.onEndVectorEdit}
          onUpdatePath={(path) => handlers.onUpdateLayer(layer.id, { path } as Partial<VectorLayer>)}
          {...common}
        />
      );
    case "ink":
      return <InkLayerView layer={layer} selected={selected} {...common} />;
    case "adjustment":
      return adjustment ? (
        <AdjustmentLayerView
          layer={layer}
          belowLayers={adjustment.belowLayers}
          background={adjustment.background}
          pageWidth={adjustment.pageWidth}
          pageHeight={adjustment.pageHeight}
          image={image}
          selected={selected}
          {...common}
        />
      ) : null;
    default:
      return null;
  }
};
