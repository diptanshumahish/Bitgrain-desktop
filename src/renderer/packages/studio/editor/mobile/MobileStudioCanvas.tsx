import React, { useRef } from "react";
import { LayersView } from "../../canvas/layers-view";
import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";
import { useSignalValue } from "@bitgrain/core/signal";
import { mobileFitScaleSignal, mobileZoomSignal } from "./canvas/mobile-zoom-state";
import { useMobilePinchZoom } from "./canvas/use-mobile-pinch-zoom";
import { useFitScale } from "./canvas/use-fit-scale";
import { MobileFitButton } from "./canvas/mobile-fit-button";
import { useSheetAvoidance } from "./canvas/use-sheet-avoidance";
import { mobileSheetTopSignal } from "./sheet-chrome/mobile-sheet-metrics";

interface MobileStudioCanvasProps {
  layers: Layer[];
  canvasW: number;
  canvasH: number;
  background: string;
  image: string | null;
  selectedIds: string[];
  selectedLayer: Layer | null;
  onSelectLayer: (id: string | null, multi?: boolean) => void;
  onStartEdit: (id: string) => void;
  onMoveDelta: (id: string, dx: number, dy: number) => void;
  onMoveEnd: (id: string) => void;
  onResizeDelta: (id: string, dir: HandleDir, dx: number, dy: number) => void;
  onResizeEnd: (id: string) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
}

const ignore = (): void => undefined;

export const MobileStudioCanvas: React.FC<MobileStudioCanvasProps> = (props) => {
  const { layers, canvasW, canvasH, background, image, selectedIds } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const pinchingRef = useMobilePinchZoom(containerRef);
  useFitScale(containerRef, canvasW, canvasH);
  const scale = useSignalValue(mobileFitScaleSignal) * useSignalValue(mobileZoomSignal);
  const sheetTop = useSignalValue(mobileSheetTopSignal);
  useSheetAvoidance(containerRef, pageRef, { layer: props.selectedLayer, scale, sheetTop });

  const deselectOnBackground = (event: React.PointerEvent<HTMLDivElement>): void => {
    if (event.target === event.currentTarget) props.onSelectLayer(null);
  };

  const moveUnlessPinching = (id: string, dx: number, dy: number): void => {
    if (!pinchingRef.current) props.onMoveDelta(id, dx, dy);
  };

  const resizeUnlessPinching = (id: string, dir: HandleDir, dx: number, dy: number): void => {
    if (!pinchingRef.current) props.onResizeDelta(id, dir, dx, dy);
  };

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={containerRef}
        className="absolute inset-0 overflow-auto no-scrollbar flex touch-pan-x touch-pan-y bg-[var(--s-bg-canvas)]"
        onPointerDown={deselectOnBackground}
      >
        <div
          ref={pageRef}
          style={{ width: canvasW * scale, height: canvasH * scale }}
          className="relative shrink-0 m-auto touch-none translate-y-[var(--mobile-sheet-shift,0px)] transition-transform duration-200"
        >
          <div
            style={{ width: canvasW, height: canvasH, transform: `scale(${scale})`, transformOrigin: "top left", background }}
            className="absolute top-0 left-0 overflow-hidden"
            onPointerDown={deselectOnBackground}
          >
            <LayersView
              layers={layers}
              selectedIds={selectedIds}
              editingId={null}
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
              onEndEdit={ignore}
              onCommitText={ignore}
              onMoveDelta={moveUnlessPinching}
              onMoveEnd={props.onMoveEnd}
              onResizeDelta={resizeUnlessPinching}
              onResizeEnd={props.onResizeEnd}
              onUpdateLayer={props.onUpdateLayer}
              onStartVectorEdit={ignore}
              onEndVectorEdit={ignore}
              nodeEditMode="move"
              onLayerContextMenu={ignore}
            />
          </div>
        </div>
      </div>
      <MobileFitButton />
    </div>
  );
};
