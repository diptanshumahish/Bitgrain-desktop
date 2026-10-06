import React, { useEffect, useRef, useState } from "react";
import { LayersView } from "../../../components/studio/canvas/layers-view";
import type { Layer } from "../../../data/studioTypes";
import type { HandleDir } from "../../../components/studio/layers/SelectionHandles";

interface MobileStudioCanvasProps {
  layers: Layer[];
  canvasW: number;
  canvasH: number;
  background: string;
  image: string | null;
  selectedIds: string[];
  editingId: string | null;
  userZoom: number;
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onStartEdit: (id: string) => void;
  onEndEdit: (id: string, content: string, rich: string) => void;
  onCommitText: (id: string, content: string, rich: string) => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
}

const FIT_PADDING = 0.92;
const FALLBACK_SCALE = 0.2;

export const MobileStudioCanvas: React.FC<MobileStudioCanvasProps> = (props) => {
  const { layers, canvasW, canvasH, background, image, selectedIds, editingId, userZoom } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState(FALLBACK_SCALE);
  const scale = fitScale * userZoom;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const measure = (): void => {
      const availW = el.clientWidth;
      const availH = el.clientHeight;
      if (availW === 0 || availH === 0 || canvasW === 0 || canvasH === 0) return;
      const next = Math.min(availW / canvasW, availH / canvasH) * FIT_PADDING;
      setFitScale(next > 0 ? next : FALLBACK_SCALE);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [canvasW, canvasH]);

  return (
    <div
      ref={containerRef}
      className="flex-1 min-h-0 overflow-auto flex relative bg-[var(--s-bg-canvas)]"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) props.onSelectLayer(null);
      }}
    >
      <div style={{ width: canvasW * scale, height: canvasH * scale }} className="relative shrink-0 m-auto">
        <div
          style={{
            width: canvasW,
            height: canvasH,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            background,
          }}
          className="absolute top-0 left-0 overflow-hidden"
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) props.onSelectLayer(null);
          }}
        >
          <LayersView
            layers={layers}
            selectedIds={selectedIds}
            editingId={editingId}
            vectorEditingId={null}
            image={image}
            background={background}
            pageWidth={canvasW}
            pageHeight={canvasH}
            zoom={scale}
            isSpacePressed={false}
            isGrabMode={false}
            onSelectLayer={props.onSelectLayer}
            onStartEdit={props.onStartEdit}
            onEndEdit={props.onEndEdit}
            onCommitText={props.onCommitText}
            onMoveDelta={props.onMoveDelta}
            onMoveEnd={props.onMoveEnd}
            onResizeDelta={props.onResizeDelta}
            onResizeEnd={props.onResizeEnd}
            onUpdateLayer={props.onUpdateLayer}
            onStartVectorEdit={() => undefined}
            onEndVectorEdit={() => undefined}
            nodeEditMode="move"
            onLayerContextMenu={() => undefined}
          />
        </div>
      </div>
    </div>
  );
};
