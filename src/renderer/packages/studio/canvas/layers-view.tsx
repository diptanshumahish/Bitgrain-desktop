import React, { useMemo } from "react";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { MaskRunsView } from "../layers/mask/mask-runs-view";
import { MaskedSelectionChrome } from "../layers/mask/masked-selection-chrome";
import { useStableHandlers } from "../hooks/use-stable-handlers";
import { LayerViewItem, type ContainerSelection } from "./layer-items/layer-view-item";
import { layerZIndex } from "./layer-items/build-common-layer-props";
import type { LayerGate, LayerItemHandlers } from "./layer-items/layer-item-types";

interface LayersViewProps {
  layers: Layer[];
  selectedIds: string[];
  editingId: string | null;
  vectorEditingId: string | null;
  image: string | null;
  background: string;
  pageWidth: number;
  pageHeight: number;
  zoom: number;
  isSpacePressed: boolean;
  isGrabMode: boolean;
  hideSelectionUi?: boolean;
  hiddenIds?: string[];
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, richContent: string) => void;
  onCommitText: (id: string, content: string, richContent: string) => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onStartVectorEdit: (id: string) => void;
  onEndVectorEdit: () => void;
  nodeEditMode: "move" | "bend";
  onLayerContextMenu: (id: string, x: number, y: number) => void;
  onReparentCheck?: (id: string) => void;
}

const positionedLayer = (layer: Layer): Layer => layer;

export const LayersView = (props: LayersViewProps): React.ReactElement => {
  const {
    layers, selectedIds, editingId, vectorEditingId, image, background, pageWidth, pageHeight,
    zoom, isSpacePressed, isGrabMode, hideSelectionUi = false, hiddenIds, nodeEditMode,
  } = props;

  const handlers = useStableHandlers<LayerItemHandlers>({
    onSelectLayer: props.onSelectLayer,
    onStartEdit: props.onStartEdit,
    onEndEdit: props.onEndEdit,
    onCommitText: props.onCommitText,
    onMoveDelta: props.onMoveDelta,
    onMoveEnd: props.onMoveEnd,
    onResizeDelta: props.onResizeDelta,
    onResizeEnd: props.onResizeEnd,
    onUpdateLayer: props.onUpdateLayer,
    onStartVectorEdit: props.onStartVectorEdit,
    onEndVectorEdit: props.onEndVectorEdit,
    onLayerContextMenu: props.onLayerContextMenu,
    onReparentCheck: (id: string) => props.onReparentCheck?.(id),
  });

  const gate = useMemo<LayerGate>(() => ({ isSpacePressed, isGrabMode }), [isSpacePressed, isGrabMode]);
  const containerSelection = useMemo<ContainerSelection>(
    () => ({ selectedIds, editingId, vectorEditingId }),
    [selectedIds, editingId, vectorEditingId],
  );

  const renderLayer = (layer: Layer, index: number, inMaskScope: boolean): React.ReactNode => (
    <LayerViewItem
      layer={layer}
      index={index}
      inMaskScope={inMaskScope}
      hidden={hiddenIds?.includes(layer.id) ?? false}
      selected={selectedIds.includes(layer.id)}
      editing={editingId === layer.id}
      nodeEditing={vectorEditingId === layer.id}
      containerSelection={layer.type === "group" || layer.type === "frame" ? containerSelection : null}
      nodeEditMode={nodeEditMode}
      image={image}
      zoom={zoom}
      hideSelectionUi={hideSelectionUi}
      gate={gate}
      handlers={handlers}
      adjustment={layer.type === "adjustment" ? { belowLayers: layers.slice(0, index), background, pageWidth, pageHeight } : null}
    />
  );

  const renderChrome = (layer: Layer): React.ReactNode =>
    hideSelectionUi || isGrabMode ? null : (
      <MaskedSelectionChrome
        layer={layer}
        scale={zoom}
        zIndex={layerZIndex(layers.length)}
        onResizeDelta={(dir, dx, dy) => {
          if (!layer.locked) handlers.onResizeDelta(layer.id, dir, dx, dy);
        }}
        onResizeEnd={() => handlers.onResizeEnd(layer.id)}
      />
    );

  return (
    <MaskRunsView
      layers={layers}
      scale={zoom}
      pageImage={image}
      selectedIds={selectedIds}
      zIndexOf={layerZIndex}
      positioned={positionedLayer}
      renderLayer={renderLayer}
      renderChrome={renderChrome}
    />
  );
};
