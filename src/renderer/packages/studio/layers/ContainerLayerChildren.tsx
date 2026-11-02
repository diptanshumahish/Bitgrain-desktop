import React from "react";
import type { FrameLayer, GroupLayer } from "@bitgrain/studio-core/model/studio-types";
import { resizeLayer } from "./resize/resize-layer";
import { LayerChildren } from "./layer-children";
import { useAutoLayoutChildren } from "../hooks/use-auto-layout-children";
import { useNestedSnap } from "../canvas/snap/nested/use-nested-snap";
import { NestedSnapGuides } from "../canvas/snap/nested/nested-snap-guides";
import type { ContainerLayerViewProps } from "./container-layer-props";
import type { useGroupSelection } from "./use-group-selection";

type ChildSelection = Pick<ReturnType<typeof useGroupSelection>, "selectChild" | "isChildArmed" | "openChildMenu">;

interface ContainerLayerChildrenProps {
  view: ContainerLayerViewProps<GroupLayer | FrameLayer>;
  selection: ChildSelection;
  bodyClassName: string;
  bodyStyle?: React.CSSProperties;
}

export const ContainerLayerChildren: React.FC<ContainerLayerChildrenProps> = ({ view, selection, bodyClassName, bodyStyle }) => {
  const { layer, scale, onLayerUpdate, onMoveEnd, onResizeEnd } = view;
  const { isFlowChild, positioned, dragReorder, handleMoveEnd } = useAutoLayoutChildren(layer, onLayerUpdate, onMoveEnd);
  const snap = useNestedSnap({ siblings: layer.layers, bounds: layer, scale });

  return (
    <>
      <div className={bodyClassName} style={bodyStyle}>
        <LayerChildren
          layers={layer.layers}
          selectedIds={view.selectedIds}
          editingId={view.editingId}
          vectorEditingId={view.vectorEditingId}
          nodeEditMode={view.nodeEditMode}
          image={view.image}
          scale={scale}
          isSpacePressed={view.isSpacePressed}
          isGrabMode={view.isGrabMode}
          positioned={positioned}
          onSelectChild={selection.selectChild}
          isChildArmed={selection.isChildArmed}
          onChildContextMenu={selection.openChildMenu}
          onLayerContextMenu={view.onLayerContextMenu}
          onChildMove={(child, dx, dy) => {
            if (isFlowChild(child)) {
              dragReorder(child.id, dx, dy);
              return;
            }
            const delta = snap.snapMove(child, dx, dy);
            onLayerUpdate(child.id, { x: child.x + delta.dx, y: child.y + delta.dy });
          }}
          onChildMoveEnd={() => {
            snap.endSnap();
            handleMoveEnd();
          }}
          onChildResize={(child, childView, dir, dx, dy) => {
            const inFlow = isFlowChild(child);
            const delta = inFlow ? { dx, dy } : snap.snapResize(childView, dir, dx, dy);
            const next = resizeLayer(childView, dir, delta.dx, delta.dy);
            onLayerUpdate(child.id, inFlow ? { ...next, x: child.x, y: child.y } : next);
          }}
          onChildResizeEnd={() => {
            snap.endSnap();
            onResizeEnd();
          }}
          onStartEdit={view.onStartEdit}
          onEndEdit={view.onEndEdit}
          onCommitText={view.onCommitText}
          onStartVectorEdit={view.onStartVectorEdit}
          onEndVectorEdit={view.onEndVectorEdit}
          onLayerUpdate={onLayerUpdate}
          onSelect={view.onSelect}
          onReparentCheck={view.onReparentCheck}
        />
      </div>
      <NestedSnapGuides overlay={snap.overlay} width={layer.width} height={layer.height} scale={scale} />
    </>
  );
};
