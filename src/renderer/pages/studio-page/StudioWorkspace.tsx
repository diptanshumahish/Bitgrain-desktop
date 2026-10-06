import React from "react";
import { TopBar } from "../../components/studio/TopBar";
import { LeftPanel } from "../../components/studio/LeftPanel";
import { LeftRailPortal } from "../../shell/panel/LeftRailPortal";
import { useAnimationMode } from "../../store/animation-editor-store";
import { CanvasArea } from "../../components/studio/canvas-area";
import { RightPanel } from "../../components/studio/RightPanel";
import { PanelRail, RailButton } from "../../components/studio/PanelRail";
import { AnimationBar } from "../../components/studio/animation/AnimationBar";
import type { AnimationController } from "./use-studio-animation";
import {
  Image as ImageIcon,
  Type,
  Square,
  FilePlus,
  Copy,
  ChevronUp,
  ChevronDown,
  FlipHorizontal,
  FlipVertical,
  Trash2,
} from "lucide-react";
import {
  useLeftPanelCollapsed,
  useRightPanelCollapsed,
  toggleLeftPanel,
  toggleRightPanel,
} from "../../store/studio-panels-store";
import { TextSelectionHighlight } from "../../components/studio/rich-text/TextSelectionHighlight";
import { PLUGIN_DRAG_MIME, emitInsertImage } from "../../studio-plugins/host";
import { dataTransferMayHaveImage, ingestDataTransferImages } from "./studio-image-intake";
import { RestoreToast } from "./RestoreToast";
import { handleCanvasResizeDelta } from "./canvas-resize-handler";
import { trackEvent } from "../../lib/tracker";
import { emitModal } from "../../lib/event-bus";
import { toggleTheme } from "../../store/global-theme-store";
import { shapeToVectorLayer } from "../../utils/shape-to-vector";
import { fitTextBox, findLayerById, replaceLayerById } from "../../utils/studio-layers";
import type {
  TemplateDef,
  TemplatePage,
  Layer,
  CustomFontEntry,
  ShapeType,
  BezierAnchor,
  VectorSettings,
  InkPoint,
} from "../../data/studioTypes";
import type { FrameRect } from "./use-studio-pages";
import type { TextStyleVariable, NumberToken } from "../../data/design-kit-types";
import type { BTGStudioProject } from "../../utils/btg-export";

const DOCUMENT_ID = "__document__";

export interface StudioWorkspaceProps {
  // True when this studio tab is the visible one; gates the left-rail portal so a
  // hidden tab never fills the shared shell rail.
  railActive: boolean;
  template: TemplateDef;
  effectiveTemplate: TemplateDef;
  background: string;
  layers: Layer[];
  selectedIds: string[];
  selectedLayer: Layer | null;
  image: string | null;
  zoom: number;
  dark: boolean;
  past: unknown[];
  future: unknown[];
  editingId: string | null;
  vectorEditingId: string | null;
  scaleContents: boolean;
  canvasW: number;
  canvasH: number;
  customFonts: CustomFontEntry[];
  showRestoreToast: boolean;
  workName?: string;
  onRenameWork: (name: string) => void;
  canvasWRef: React.MutableRefObject<number>;
  canvasHRef: React.MutableRefObject<number>;
  dragCanvasWRef: React.MutableRefObject<number | null>;
  dragCanvasHRef: React.MutableRefObject<number | null>;
  setSelectedIds: React.Dispatch<React.SetStateAction<string[]>>;
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  setBackground: (bg: string) => void;
  setCanvasW: (w: number) => void;
  setCanvasH: (h: number) => void;
  setEditingId: (id: string | null) => void;
  setVectorEditingId: (id: string | null) => void;
  setZoom: (z: number) => void;
  setImage: (img: string | null) => void;
  setCustomFonts: React.Dispatch<React.SetStateAction<CustomFontEntry[]>>;
  setShowRestoreToast: (v: boolean) => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  commitUpdate: (id: string, updates: Partial<Layer>) => void;
  handleApplyKitColor: (varId: string, hex: string) => void;
  handleApplyKitTextStyle: (style: TextStyleVariable) => void;
  handleApplyKitNumber: (token: NumberToken) => void;
  handleVariableColorChange: (varId: string, hex: string) => void;
  handlePageBackgroundBind: (pageId: string, varId: string, value: string) => void;
  handleExit: () => void;
  handleNewProject: () => void;
  handleLoadBTG: (project: BTGStudioProject, fonts: Array<{ label: string; dataUrl: string }>) => void;
  handleSelectTemplate: (t: TemplateDef) => void;
  handleAddText: () => void;
  handleAddShape: (s: ShapeType) => void;
  handleAddImage: () => void;
  handleAddImageFromUrl: (src: string, opts?: { name?: string; width?: number; height?: number }) => void;
  handleAddAdjustment: () => void;
  handleAddPattern: () => void;
  handleAddVector: (a: BezierAnchor[], c: boolean, s: VectorSettings) => void;
  handleAddInk: (strokes: InkPoint[][], s: VectorSettings) => void;
  handleDeleteLayer: (id: string) => void;
  handleDuplicate: (ids: string[]) => void;
  handleGroup: () => void;
  handleUngroup: () => void;
  handleMoveLayerUp: (id: string) => void;
  handleMoveLayerDown: (id: string) => void;
  handleFlipLayerH: (id: string) => void;
  handleFlipLayerV: (id: string) => void;
  handleAlign: (a: string) => void;
  handleScatterCollage: () => void;
  handleMatchPageToLayer: (id: string) => void;
  handleResizeToFormats: (formatIds: string[]) => void;
  handleAddMockupPage: (dataUrl: string, width: number, height: number) => void;
  handleLayerContextMenu: (id: string, x: number, y: number) => void;
  handleRestore: () => void;
  animation: AnimationController;
  pages: TemplatePage[];
  activePageId: string;
  selectedFramePageId: string | null;
  setSelectedFramePageId: (id: string | null) => void;
  handleSelectPage: (id: string) => void;
  handleSelectFramePage: (id: string) => void;
  handleAddPage: () => void;
  handleAddSizedPage: (width: number, height: number, name?: string) => void;
  handleDuplicatePage: () => void;
  handleReorderLayersForPage: (pageId: string, layers: Layer[]) => void;
  handlePageMoveStart: () => void;
  handlePageMoveTo: (pageId: string, x: number, y: number) => void;
  handleRenamePage: (id: string, name: string) => void;
  handlePageBackgroundChange: (id: string, color: string) => void;
  handlePageResize: (id: string, width: number, height: number) => void;
  handlePageFrameTransform: (id: string, x: number, y: number, width: number, height: number) => void;
  handleAddFrame: (parentId: string | null, rect: FrameRect) => string;
  handleDeleteFrame: (frameId: string) => void;
  handleReparentFrame: (frameId: string, newParentId: string | null, dropLocal?: { x: number; y: number }) => void;
}

export const StudioWorkspace: React.FC<StudioWorkspaceProps> = (props) => {
  const {
    railActive,
    template, effectiveTemplate, background, layers, selectedIds, selectedLayer,
    image, zoom, dark, past, future, editingId, vectorEditingId, scaleContents,
    canvasW, canvasH, customFonts, showRestoreToast, workName, onRenameWork,
    canvasWRef, canvasHRef, dragCanvasWRef, dragCanvasHRef,
    setSelectedIds, setLayers, setCanvasW, setCanvasH,
    setEditingId, setVectorEditingId, setZoom, setImage, setCustomFonts,
    setShowRestoreToast,
    pushHistory, undo, redo, updateLayer, commitUpdate,
    handleApplyKitColor, handleApplyKitTextStyle, handleApplyKitNumber,
    handleVariableColorChange, handlePageBackgroundBind,
    handleSelectTemplate,
    handleAddText, handleAddShape, handleAddImage, handleAddAdjustment, handleAddPattern, handleAddVector, handleAddInk,
    handleDeleteLayer, handleDuplicate, handleGroup, handleUngroup,
    handleMoveLayerUp, handleMoveLayerDown, handleFlipLayerH, handleFlipLayerV,
    handleAlign, handleScatterCollage, handleMatchPageToLayer, handleResizeToFormats, handleAddMockupPage,
    handleLayerContextMenu, handleRestore,
    animation,
    pages, activePageId,
    selectedFramePageId, setSelectedFramePageId,
    handleSelectPage, handleSelectFramePage,
    handleAddPage, handleAddSizedPage, handleDuplicatePage,
    handleReorderLayersForPage,
    handlePageMoveStart, handlePageMoveTo,
    handleRenamePage, handlePageBackgroundChange, handlePageResize,
    handlePageFrameTransform,
    handleAddFrame, handleDeleteFrame, handleReparentFrame,
  } = props;

  const isLeftPanelCollapsed = useLeftPanelCollapsed();
  const isRightPanelCollapsed = useRightPanelCollapsed();
  const animateMode = useAnimationMode();

  const editDirtyRef = React.useRef(false);
  const ensureEditHistory = () => {
    if (editDirtyRef.current) return;
    pushHistory();
    editDirtyRef.current = true;
  };

  const railLayer = selectedIds.length === 1 && selectedLayer ? selectedLayer : null;

  const handleOpenMockup = () =>
    emitModal({ type: "mockup", template: effectiveTemplate, background, layers, image, width: canvasW, height: canvasH, selectedLayer, onAddPage: handleAddMockupPage });

  const canvasPages = React.useMemo(
    () => pages.map((page) => (page.id === activePageId ? { ...page, layers } : page)),
    [pages, activePageId, layers],
  );

  const selectedFramePage = selectedFramePageId
    ? pages.find((page) => page.id === selectedFramePageId) ?? null
    : null;
  const selectedFramePageIndex = selectedFramePage
    ? pages.findIndex((page) => page.id === selectedFramePage.id)
    : 0;

  return (
    <>
      <TopBar
        template={effectiveTemplate}
        dark={dark}
        canUndo={past.length > 0}
        canRedo={future.length > 0}
        workName={workName}
        onRenameWork={onRenameWork}
        onToggleAnimate={animation.toggleMode}
        onUndo={undo}
        onRedo={redo}
        onToggleDark={() => {
          trackEvent("studio", "theme_toggled", { details: { to: dark ? "light" : "dark" } });
          toggleTheme();
        }}
        onResize={() => emitModal({ type: "resize", sourceWidth: canvasW, sourceHeight: canvasH, onApply: handleResizeToFormats })}
        onMockup={handleOpenMockup}
        selectedLayer={selectedLayer}
        selectedIds={selectedIds}
        onApplyKitColor={handleApplyKitColor}
        onApplyKitTextStyle={handleApplyKitTextStyle}
        onApplyKitNumber={handleApplyKitNumber}
        onVariableColorChange={handleVariableColorChange}
      />

      <div
        className="flex flex-1 min-h-0 relative overflow-hidden bg-[var(--s-bg-panel)]"
        onDragOver={(e) => {
          if (e.dataTransfer.types.includes(PLUGIN_DRAG_MIME) || dataTransferMayHaveImage(e.dataTransfer)) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }
        }}
        onDrop={(e) => {
          const raw = e.dataTransfer.getData(PLUGIN_DRAG_MIME);
          if (raw) {
            e.preventDefault();
            try {
              const data = JSON.parse(raw) as {
                src: string;
                name?: string;
                width?: number | null;
                height?: number | null;
              };
              emitInsertImage({
                src: data.src,
                name: data.name ?? "Image",
                width: data.width ?? undefined,
                height: data.height ?? undefined,
              });
            } catch {
              // ignore malformed payload
            }
            return;
          }
          if (dataTransferMayHaveImage(e.dataTransfer)) {
            e.preventDefault();
            ingestDataTransferImages(e.dataTransfer);
          }
        }}
      >
        {/* The left panel is portaled into the shell's full-height rail so it
            runs from the very top of the window, with the title bar and this
            studio strip in the content column to its right. */}
        <LeftRailPortal active={railActive}>
          {/* Carries the studio's theme + animate-mode onto the portaled panel so
              its `--s-*` colours (incl. the animate-mode override, a compound
              [data-theme][data-animate-mode] selector) match the canvas even
              though the panel lives outside the studio <main>. */}
          <div
            data-theme={dark ? "dark" : "light"}
            data-animate-mode={animateMode ? "true" : undefined}
            className="flex h-full flex-col border-r border-[var(--s-border)] bg-[var(--s-bg-panel)]"
          >
            <div
              className={`relative min-h-0 flex-1 overflow-hidden transition-[width] duration-200 ease-[cubic-bezier(.2,.8,.2,1)] ${
                isLeftPanelCollapsed ? "w-11" : "w-[280px]"
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 w-[280px] transition-opacity duration-150 ${
                  isLeftPanelCollapsed ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <LeftPanel
                  selectedTemplateId={template.id}
                  pages={pages}
                  activePageId={activePageId}
                  selectedLayerIds={selectedIds}
                  onSelectTemplate={handleSelectTemplate}
                  onSelectPage={handleSelectPage}
                  onAddFrame={handleAddSizedPage}
                  frameWidth={canvasW}
                  frameHeight={canvasH}
                  onDuplicatePage={handleDuplicatePage}
                  onDeletePage={handleDeleteFrame}
                  onSelectLayer={(id, multi) => {
                    if (multi) {
                      setSelectedIds((prev) =>
                        prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
                      );
                    } else {
                      setSelectedIds(id ? [id] : []);
                    }
                  }}
                  onSelectLayerIds={setSelectedIds}
                  onUpdateLayer={(id, updates) => commitUpdate(id, updates)}
                  onDeleteLayer={handleDeleteLayer}
                  onReorderLayersForPage={handleReorderLayersForPage}
                  onGroup={handleGroup}
                  onUngroup={handleUngroup}
                  onDuplicate={handleDuplicate}
                />
              </div>

              <div
                className={`absolute inset-y-0 left-0 w-11 transition-opacity duration-150 ${
                  isLeftPanelCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                <PanelRail
                  side="left"
                  onExpand={toggleLeftPanel}
                  footer={
                    <img
                      src="/bitgrainlogo.png"
                      alt="bitgrain"
                      className="h-5 w-auto rounded opacity-70"
                    />
                  }
                >
                  <RailButton label="Add text" onClick={handleAddText}>
                    <Type size={16} strokeWidth={1.75} />
                  </RailButton>
                  <RailButton label="Add image" onClick={handleAddImage}>
                    <ImageIcon size={16} strokeWidth={1.75} />
                  </RailButton>
                  <RailButton label="Add rectangle" onClick={() => handleAddShape("rect")}>
                    <Square size={16} strokeWidth={1.75} />
                  </RailButton>
                  <RailButton label="Add page" onClick={handleAddPage}>
                    <FilePlus size={16} strokeWidth={1.75} />
                  </RailButton>
                </PanelRail>
              </div>
            </div>
          </div>
        </LeftRailPortal>

        <div className="flex flex-col flex-1 min-w-0">
        <CanvasArea
          template={effectiveTemplate}
          pages={canvasPages}
          activePageId={activePageId}
          selectedFramePageId={selectedFramePageId}
          selectedIds={selectedIds}
          editingId={editingId}
          zoom={zoom}
          onZoomChange={setZoom}
          onSelectPage={handleSelectPage}
          onSelectFramePage={handleSelectFramePage}
          onRenamePage={handleRenamePage}
          onSelectLayer={(id, multi) => {
            setSelectedFramePageId(null);
            if (multi) {
              setSelectedIds((prev) =>
                prev.includes(id!) ? prev.filter((p) => p !== id) : [...prev, id!],
              );
            } else {
              setSelectedIds(id ? [id] : []);
            }
          }}
          onSelectIds={(ids) => {
            setSelectedFramePageId(null);
            setSelectedIds(ids);
          }}
          vectorEditingId={vectorEditingId}
          onStartVectorEdit={(id) => {
            const target = findLayerById(layers, id);
            if (target?.type === "shape") {
              pushHistory();
              const vectorLayer = shapeToVectorLayer(target);
              setLayers((prev) => replaceLayerById(prev, id, vectorLayer));
            }
            setSelectedIds([id]);
            setVectorEditingId(id);
          }}
          onEndVectorEdit={() => setVectorEditingId(null)}
          onStartEdit={(id) => {
            editDirtyRef.current = false;
            setSelectedIds([id]);
            setEditingId(id);
          }}
          onEndEdit={(id, content, richContent) => {
            ensureEditHistory();
            setEditingId(null);
            if (content.trim() === "") {
              handleDeleteLayer(id);
              return;
            }
            const layer = findLayerById(layers, id);
            const fit = layer?.type === "text" && layer.autoResize ? fitTextBox({ ...layer, content }) : null;
            updateLayer(id, { content, richContent, ...(fit ?? {}) });
          }}
          onCommitText={(id, content, richContent) => {
            ensureEditHistory();
            const layer = findLayerById(layers, id);
            const fit = layer?.type === "text" && layer.autoResize ? fitTextBox({ ...layer, content }) : null;
            updateLayer(id, { content, richContent, ...(fit ?? {}) });
          }}
          onMoveDelta={(id, dx, dy) =>
            setLayers((prev) =>
              prev.map((l) => (l.id === id ? { ...l, x: l.x + dx, y: l.y + dy } : l)),
            )
          }
          onMoveEnd={() => pushHistory()}
          onResizeDelta={(id, dir, dx, dy) =>
            handleCanvasResizeDelta({
              id, dir, dx, dy,
              documentId: DOCUMENT_ID,
              scaleContents,
              canvasWRef, canvasHRef,
              dragCanvasWRef, dragCanvasHRef,
              setCanvasW, setCanvasH, setLayers,
            })
          }
          onResizeEnd={() => {
            dragCanvasWRef.current = null;
            dragCanvasHRef.current = null;
            pushHistory();
          }}
          onRotate={(id, rotation) =>
            setLayers((prev) =>
              prev.map((l) => (l.id === id ? { ...l, rotation } : l)),
            )
          }
          onRotateEnd={() => pushHistory()}
          onAddText={handleAddText}
          onAddShape={handleAddShape}
          onAddImage={handleAddImage}
          onAddAdjustment={handleAddAdjustment}
          onAddPattern={handleAddPattern}
          onMockup={handleOpenMockup}
          onAddVector={handleAddVector}
          onAddInk={handleAddInk}
          onUpdateLayer={updateLayer}
          onLayerContextMenu={handleLayerContextMenu}
          onPageMoveStart={handlePageMoveStart}
          onPageMoveTo={handlePageMoveTo}
          onPageFrameTransform={handlePageFrameTransform}
          onAddFrame={handleAddFrame}
          onReparentFrame={handleReparentFrame}
          onAnimate={animation.toggleMode}
          animationActive={animation.mode}
        />
        <AnimationBar controller={animation} />
        </div>

        {isRightPanelCollapsed && (
          <PanelRail side="right" onExpand={toggleRightPanel}>
            {railLayer && (
              <>
                <RailButton label="Duplicate" onClick={() => handleDuplicate([railLayer.id])}>
                  <Copy size={16} strokeWidth={1.75} />
                </RailButton>
                <RailButton label="Move up" onClick={() => handleMoveLayerUp(railLayer.id)}>
                  <ChevronUp size={16} strokeWidth={1.75} />
                </RailButton>
                <RailButton label="Move down" onClick={() => handleMoveLayerDown(railLayer.id)}>
                  <ChevronDown size={16} strokeWidth={1.75} />
                </RailButton>
                <RailButton label="Flip horizontal" onClick={() => handleFlipLayerH(railLayer.id)}>
                  <FlipHorizontal size={16} strokeWidth={1.75} />
                </RailButton>
                <RailButton label="Flip vertical" onClick={() => handleFlipLayerV(railLayer.id)}>
                  <FlipVertical size={16} strokeWidth={1.75} />
                </RailButton>
                <RailButton label="Delete" danger onClick={() => handleDeleteLayer(railLayer.id)}>
                  <Trash2 size={16} strokeWidth={1.75} />
                </RailButton>
              </>
            )}
          </PanelRail>
        )}

        {!isRightPanelCollapsed && (
        <RightPanel
          selectedIds={selectedIds}
          selectedLayer={selectedLayer}
          editingId={editingId}
          onPageBackgroundBind={handlePageBackgroundBind}
          onUpdateLayer={updateLayer}
          onMatchPageToLayer={handleMatchPageToLayer}
          onAlign={handleAlign}
          onScatterCollage={handleScatterCollage}
          onGroup={handleGroup}
          onUngroup={handleUngroup}
          customFonts={customFonts}
          onFontUpload={(font) => {
            trackEvent("studio", "font_uploaded", { details: { font_name: font.label } });
            setCustomFonts((prev) => (prev.some((entry) => entry.label === font.label) ? prev : [...prev, font]));
          }}
          onImageUpload={(dataUrl) => {
            pushHistory();
            setImage(dataUrl);
          }}
          onDeleteLayer={handleDeleteLayer}
          onMoveLayerUp={handleMoveLayerUp}
          onMoveLayerDown={handleMoveLayerDown}
          onFlipLayerH={handleFlipLayerH}
          onFlipLayerV={handleFlipLayerV}
          selectedFramePage={selectedFramePage}
          selectedFramePageIndex={selectedFramePageIndex}
          totalPages={pages.length}
          onRenamePage={handleRenamePage}
          onPageBackgroundChange={handlePageBackgroundChange}
          onPageResize={handlePageResize}
          onPageMove={handlePageMoveTo}
          onDeletePage={(id) => {
            setSelectedFramePageId(null);
            handleDeleteFrame(id);
          }}
          pageImage={image}
        />
        )}

        {showRestoreToast && (
          <RestoreToast
            onRestore={handleRestore}
            onDismiss={() => setShowRestoreToast(false)}
          />
        )}
      </div>

      <TextSelectionHighlight />
    </>
  );
};
