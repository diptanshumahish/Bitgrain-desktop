import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { themeSignal } from "@bitgrain/ui/theme/global-theme-store";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { peekRouteTemplate, readRouteTemplateId, useApplyRouteTemplate } from "@bitgrain/platform/templates/cards/use-route-template";
import type { TemplateDef, Layer, CustomFontEntry } from "@bitgrain/studio-core/model/studio-types";
import { MobileStudioWorkspace } from "./mobile/MobileStudioWorkspace";
import { StudioWorkspace, type StudioWorkspaceProps } from "./StudioWorkspace";
import { useStudioShortcuts } from "./useStudioShortcuts";
import { loadStoredCustomFonts } from "./load-custom-fonts";
import { buildLayerContextMenu } from "./build-layer-context-menu";
import { useStudioHistory } from "./use-studio-history";
import { useActiveTemplateId } from "./template-badge/use-active-template-id";
import { useStudioLayers } from "./use-studio-layers";
import { useElementInsert } from "../features/elements/insert/use-element-insert";
import { useSvgImportInsert } from "../features/svg-import/intake/use-svg-import-insert";
import { useFigmaHandoff } from "../features/figma-handoff/use-figma-handoff";
import { useSelectionPublisher } from "../features/svg-export/selection/selection-store";
import { useCopyAsShortcut } from "../features/svg-export/clipboard/use-copy-as-shortcut";
import { useComponentTools } from "../features/design-components/hooks/use-component-tools";
import { usePageAidsSync } from "./page-aids/use-page-aids-sync";
import { findLayerById, updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import { markDirty } from "../state/studio-save-status";
import { WorkLoadOverlay } from "./WorkLoadOverlay";
import { usePrunedSelection } from "./use-pruned-selection";
import { usePageGenerators } from "./use-page-generators";
import { useStudioCommands } from "./use-studio-commands";
import { resolveInitialTemplate, type StudioLocationState } from "./resolve-initial-template";
import { useTemplateApply } from "./template-fit/use-template-apply";
import { useApplyEffectCommand } from "../features/command-palette/effects/use-apply-effect-command";
import { useStudioAnimation } from "./use-studio-animation";
import { initModifierKeys } from "../state/modifier-keys-store";
import { onInsertImage } from "../plugins/host";
import { useStudioPageHandlers } from "./use-studio-page-handlers";
import { buildHandleExit, buildHandleNewProject, buildHandleOpenAccount } from "./studio-navigation";
import { usePresenterTools } from "../features/presenter/use-presenter-tools";
import { useFindReplace } from "../find-replace/use-find-replace";
import { legacyPaintOverride } from "@bitgrain/studio-core/shape-render/paint-list/legacy-override";
import { useStudioDocument } from "./studio-root/use-studio-document";
import { useWorkName } from "./studio-root/use-work-name";
import { useStudioSaving, type StudioTemplateMode } from "./studio-root/use-studio-saving";
import { useSettledDocumentPublish } from "./studio-root/use-settled-document-publish";
import { useTargetFrame } from "./studio-root/use-target-frame";
import { useFrameHandlers } from "./studio-root/use-frame-handlers";
import { useDesignKitHandlers } from "./studio-root/use-design-kit-handlers";
import { useBtgLoader } from "./studio-root/use-btg-loader";
import { StudioPortals } from "./studio-root/studio-portals";
import { DesktopStudioCommands } from "../../../shell/studio/DesktopStudioCommands";

const DEFAULT_ZOOM = 0.7;
const MOBILE_BREAKPOINT_PX = 768;
const SCALE_CONTENTS_ON_RESIZE = true;

interface StudioProps {
  templateMode?: StudioTemplateMode;
  instanceId?: string;
  tabId?: string;
  initialTemplate?: TemplateDef;
}

export const Studio: React.FC<StudioProps> = ({ templateMode, instanceId, tabId, initialTemplate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { workId } = useParams<{ workId?: string }>();
  const routerState = location.state as StudioLocationState | null;

  const routeTemplateId = templateMode ? null : readRouteTemplateId(location.state, location.search);
  const [initial] = useState<TemplateDef>(
    () => (!templateMode ? initialTemplate : undefined)
      ?? peekRouteTemplate(routeTemplateId)
      ?? resolveInitialTemplate(!!templateMode, routerState),
  );
  const studioDocument = useStudioDocument({ initial, routerImage: routerState?.image ?? null });
  const {
    template, setTemplate, effectiveTemplate, pagesApi, activePage, image, setImage,
    canvasW, canvasH, setCanvasW, setCanvasH, canvasWRef, canvasHRef, dragCanvasWRef, dragCanvasHRef,
  } = studioDocument;
  const {
    pages, activePageId, layers, background,
    setLayers, setBackground, setLayersForPage, updatePage,
    setPagePosition, setPageSize, setPageTransform, setPageBackgroundForPage,
    bindPageBackground, setActivePageId, setPages, resetPagesFromTemplate, renamePage,
  } = pagesApi;
  const { activeTemplateId, recordAppliedTemplate } = useActiveTemplateId(template.id, pages);
  const scaleContents = SCALE_CONTENTS_ON_RESIZE;

  const [rawSelectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedIds = usePrunedSelection(rawSelectedIds, pages);
  const [selectedFramePageId, setSelectedFramePageId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vectorEditingId, setVectorEditingId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const dark = useSignalValue(themeSignal) === "dark";

  const { past, future, pushHistory: pushHistoryBase, undo, redo, resetHistory } = useStudioHistory({
    pages, activePageId, canvasW, canvasH,
    setPages, setActivePageId, setCanvasW, setCanvasH,
  });

  const pushHistory = useCallback(() => {
    markDirty();
    pushHistoryBase();
  }, [pushHistoryBase]);

  const [customFonts, setCustomFonts] = useState<CustomFontEntry[]>(loadStoredCustomFonts);
  const work = useWorkName({ initial, workId, layerCount: layers.length });
  const { workName, handleRenameWork } = work;
  const saving = useStudioSaving({ templateMode, workId, instanceId, studioDocument, work, pushHistory });
  const { handleManualSave } = saving;

  const { handleResizeToFormats, handleAddMockupPage } = usePageGenerators({
    pages, activePageId, pushHistory, setPages, setActivePageId,
  });

  const onExit = templateMode?.onExit;
  const navigationHandlers = useMemo(() => ({
    handleExit: buildHandleExit({ handleManualSave, navigate, onExit }),
    handleOpenAccount: buildHandleOpenAccount({ handleManualSave, navigate }),
    handleNewProject: buildHandleNewProject({ handleManualSave, navigate, onExit }),
  }), [handleManualSave, navigate, onExit]);

  const handleLoadBTG = useBtgLoader({
    routerProject: routerState?.fromBTG,
    setPages, setActivePageId, setCanvasW, setCanvasH, setImage, resetHistory, setCustomFonts,
  });

  const targetFrame = useTargetFrame(selectedIds, layers, pages);
  const layersApi = useStudioLayers({
    layers, selectedIds,
    pageWidth: activePage?.width ?? canvasW,
    pageHeight: activePage?.height ?? canvasH,
    background, setLayers, setSelectedIds, pushHistory, setEditingId,
    targetFrameId: targetFrame.targetFrameId,
    targetFrameSize: targetFrame.targetFrameSize,
    setLayersForFrame: pagesApi.setLayersForFrame,
  });

  useElementInsert({ pages, activePageId, setLayersForPage, setActivePageId, setSelectedIds, pushHistory });
  useSvgImportInsert({ pages, activePageId, setLayersForPage, setSelectedIds, pushHistory });
  useFigmaHandoff({ pages, setPages, setActivePageId, setSelectedIds, pushHistory });
  useSelectionPublisher(selectedIds, activePageId);
  useCopyAsShortcut();
  useComponentTools({ pages, activePageId, selectedIds, setPages, setActivePageId, setSelectedIds, pushHistory });
  useFindReplace({ pages, editingId, setPages, setActivePageId, setSelectedIds, pushHistory });
  usePageAidsSync({ updatePage, pushHistory });

  const updateLayer = useCallback((id: string, updates: Partial<Layer>) => {
    setLayers((prev) => updateLayersRecursively(prev, [id], () => legacyPaintOverride(updates)));
  }, [setLayers]);

  const animationApi = useStudioAnimation({
    activePage, activePageId, layers, template: effectiveTemplate, updatePage, setLayers, updateLayer, pushHistory,
  });

  const kitHandlers = useDesignKitHandlers({
    pages, layers, selectedIds, setPages, bindPageBackground, updateLayer, pushHistory,
    autoApplyEnabled: !templateMode,
    applyKitOnOpen: !routerState?.fromBTG && (!routeTemplateId || initial.id === routeTemplateId),
  });
  useSettledDocumentPublish(pages, layers);

  useEffect(() => initModifierKeys(), []);

  const handleAddImageFromUrl = layersApi.handleAddImageFromUrl;
  useEffect(() => {
    return onInsertImage((payload) => {
      handleAddImageFromUrl(payload.src, payload);
    });
  }, [handleAddImageFromUrl]);

  const frameHandlers = useFrameHandlers({
    pagesApi, pushHistory, undo, selectedFramePageId, setSelectedFramePageId, setSelectedIds, setCanvasW, setCanvasH,
  });

  useStudioShortcuts({
    undo, redo, selectedIds, layers, editingId, vectorEditingId,
    setVectorEditingId, setSelectedIds, pushHistory, setLayers,
    handleGroup: layersApi.handleGroup, handleUngroup: layersApi.handleUngroup,
    handleDuplicate: layersApi.handleDuplicate,
    handleDuplicatePage: frameHandlers.duplicateActivePageShortcut,
    selectedFramePageId,
    handleDeleteSelectedFrame: frameHandlers.deleteSelectedFrameShortcut,
  });

  const { applyTemplate, handleSelectTemplate } = useTemplateApply({
    initial, canvasChosen: !!routerState?.canvasSize, template, pages, activePage,
    setTemplate, resetPagesFromTemplate, setCanvasW, setCanvasH, setSelectedIds, setEditingId,
    pushHistory, recordAppliedTemplate,
  });

  useApplyRouteTemplate(routeTemplateId, initial.id, applyTemplate);

  useStudioCommands({ ...layersApi, layers, selectedIds, setSelectedIds, setLayers, pushHistory, undo, redo });
  useApplyEffectCommand({ layers, selectedIds, setLayers, pushHistory });

  const contextMenuSourceRef = useRef({ layersApi, selectedIds, layers, updateLayer, pushHistory, setLayers });
  useEffect(() => {
    contextMenuSourceRef.current = { layersApi, selectedIds, layers, updateLayer, pushHistory, setLayers };
  });
  const handleLayerContextMenu = useCallback((id: string, x: number, y: number) => {
    const { layersApi: layerHandlers, ...source } = contextMenuSourceRef.current;
    buildLayerContextMenu({ ...layerHandlers, ...source, id, x, y, setSelectedIds });
  }, []);

  const pageHandlers = useStudioPageHandlers({
    pushHistory,
    undo,
    pagesApi: {
      addPage: pagesApi.addPage,
      duplicatePageById: pagesApi.duplicatePageById,
      deletePage: pagesApi.deletePage,
    },
    setActivePageId, setSelectedIds, setSelectedFramePageId, setEditingId, setVectorEditingId,
    setLayersForPage, setPagePosition, setPageBackgroundForPage, setPageSize, setPageTransform,
    renamePage, scaleContents,
  });

  usePresenterTools({
    pages, activePageId, template, updatePage, setPages, pushHistory, undo,
    selectPage: pageHandlers.handleSelectPage,
  });

  const displayLayers = animationApi.displayLayers;
  const selectedId = selectedIds[0];
  const selectedLayer = useMemo(
    () => (selectedId ? findLayerById(displayLayers, selectedId) : null),
    [selectedId, displayLayers],
  );

  const workspaceProps: StudioWorkspaceProps = {
    template, activeTemplateId, effectiveTemplate, background, layers: displayLayers, selectedIds, selectedLayer,
    image, zoom, dark, past, future, editingId, vectorEditingId, scaleContents,
    canvasW, canvasH, customFonts,
    workName, onRenameWork: handleRenameWork,
    canvasWRef, canvasHRef, dragCanvasWRef, dragCanvasHRef,
    setSelectedIds, setLayers: animationApi.setLayers, setBackground, setCanvasW, setCanvasH,
    setEditingId, setVectorEditingId, setZoom, setImage, setCustomFonts,
    pushHistory, undo, redo, updateLayer: animationApi.updateLayer, commitUpdate: animationApi.commitUpdate,
    ...kitHandlers,
    ...navigationHandlers,
    handleLoadBTG, handleSelectTemplate,
    handleMatchPageToLayer: frameHandlers.handleMatchPageToLayer,
    handleLayerContextMenu, handleResizeToFormats, handleAddMockupPage,
    pages, activePageId,
    selectedFramePageId, setSelectedFramePageId,
    handleAddFrame: frameHandlers.handleAddFrame,
    handleDeleteFrame: frameHandlers.handleDeleteFrame,
    handleReparentFrame: frameHandlers.handleReparentFrame,
    handleMoveLayersToFrame: frameHandlers.handleMoveLayersToFrame,
    animation: animationApi.controller,
    ...pageHandlers,
    ...layersApi,
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT_PX;
  if (isMobile) return <MobileStudioWorkspace {...workspaceProps} />;

  return (
    <main
      data-theme={dark ? "dark" : "light"}
      data-animate-mode={animationApi.controller.mode ? "true" : undefined}
      className="flex flex-col h-full overflow-hidden font-editorial"
    >
      <h1 className="sr-only">Bitgrain Studio, Dithered Design Workspace</h1>

      <StudioWorkspace {...workspaceProps} />
      <WorkLoadOverlay onRetry={() => void saving.retryLoad()} onBack={() => navigate("/studio")} />
      <StudioPortals />
      {!templateMode && (
        <DesktopStudioCommands
          tabId={tabId}
          template={effectiveTemplate}
          background={background}
          layers={displayLayers}
          image={image}
          pages={pages}
          activePageId={activePageId}
          canvasW={canvasW}
          canvasH={canvasH}
          selectedLayer={selectedLayer}
          handleManualSave={handleManualSave}
          handleNewProject={navigationHandlers.handleNewProject}
          handleLoadBTG={handleLoadBTG}
          handleResizeToFormats={handleResizeToFormats}
          handleAddMockupPage={handleAddMockupPage}
        />
      )}
    </main>
  );
};

export default Studio;
