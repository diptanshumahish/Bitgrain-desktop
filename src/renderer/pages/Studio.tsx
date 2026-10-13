import React, { useState, useCallback, useEffect, useRef } from "react";
import { Play } from "lucide-react";
import { useSignalValue } from "../lib/signal";
import { themeSignal } from "../store/global-theme-store";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { type ApiTemplate } from "../lib/templates-api";
import { peekRouteTemplate, readRouteTemplateId, useApplyRouteTemplate } from "../lib/template-cards/use-route-template";
import type { TemplateDef, Layer, CustomFontEntry, FrameLayer } from "../data/studioTypes";
import { useStudioPages, type FrameRect } from "./studio-page/use-studio-pages";
import { MobileStudioWorkspace } from "./studio-page/mobile/MobileStudioWorkspace";
import { PopoverPortal } from "../components/portal/PopoverPortal";
import { ExportPopupPortal } from "../components/portal/ExportPopupPortal";
import { ContextMenuPortal } from "../components/portal/ContextMenuPortal";
import { trackEvent as trackPosthog } from "../lib/analytics";
import { trackEvent } from "../lib/tracker";
import { createStudioBTG, downloadBTG, type BTGStudioProject } from "../utils/btg-export";
import { useBTGImport } from "../hooks/useBTGImport";
import { registerSurfaceCommands, clearSurfaceCommands } from "../store/surface-commands-store";
import { clearStudioAutosave } from "../utils/studio-persist";
import { StudioWorkspace, type StudioWorkspaceProps } from "./studio-page/StudioWorkspace";
import { useStudioShortcuts } from "./studio-page/useStudioShortcuts";
import { loadStoredCustomFonts } from "./studio-page/load-custom-fonts";
import { buildLayerContextMenu } from "./studio-page/build-layer-context-menu";
import { useStudioHistory } from "./studio-page/use-studio-history";
import { useStudioLayers } from "./studio-page/use-studio-layers";
import { useElementInsert } from "../modules/elements/insert/use-element-insert";
import { applyBtgProject } from "./studio-page/load-btg";
import { findLayerById, updateLayersRecursively } from "../utils/studio-layers";
import { findParentContainerId } from "../utils/frame-tree";
import { loadDesignKits, updateColor, trackKit } from "../store/design-kits-store";
import {
  colorBindUpdateForLayer,
  textStyleUpdate,
  numberUpdateForLayer,
  resyncVarInPages,
} from "../components/studio/design-kit/apply-design-kit";
import type { TextStyleVariable, NumberToken } from "../data/design-kit-types";
import { useStudioPersist } from "./studio-page/use-studio-persist";
import { useExportHandlers } from "../components/studio/topbar/use-export-handlers";
import { TopBarExport } from "../components/studio/topbar/TopBarExport";
import { setTitlebarActions, clearTitlebarActions } from "../store/titlebar-actions-store";
import { activeTabIdSignal } from "../store/document-tabs-store";
import { emitModal } from "../lib/event-bus";
import { markDirty } from "../store/studio-save-status";
import { useStudioAutosave } from "./studio-page/use-studio-autosave";
import { WorkLoadOverlay } from "./studio-page/WorkLoadOverlay";
import { requestCanvasFit } from "../store/canvas-fit-request";
import { usePrunedSelection } from "./studio-page/use-pruned-selection";
import { studioWorkNameSignal } from "../store/studio-work-name";
import { usePageGenerators } from "./studio-page/use-page-generators";
import { useStudioCommands } from "./studio-page/use-studio-commands";
import { isBlankTemplate, resolveInitialTemplate, type StudioLocationState } from "./studio-page/resolve-initial-template";
import { useTemplatePersist, type TemplateMetadata } from "./studio-page/use-template-persist";
import { useStudioInit } from "./studio-page/use-studio-init";
import { useStudioPaste } from "./studio-page/use-studio-paste";
import { useStudioAnimation } from "./studio-page/use-studio-animation";
import { initModifierKeys } from "../store/modifier-keys-store";
import { onInsertImage, PluginFloatingWindow } from "../studio-plugins/host";
import { pluginsSignal, setActivePluginSlug } from "../studio-plugins/host/plugin-bus";
import { useStudioPageHandlers } from "./studio-page/use-studio-page-handlers";
import { buildHandleExit, buildHandleNewProject, promptTemplateSwitch } from "./studio-page/studio-navigation";
import { updateStudioRatingSource } from "../modules/output-rating/studio-rating-context";

const DEFAULT_ZOOM = 0.7;
const MOBILE_BREAKPOINT_PX = 768;
const MIN_PAGE_SIZE_PX = 50;
const SCALE_CONTENTS_ON_RESIZE = true;

export interface StudioTemplateMode {
  templateId: string;
  metadata: TemplateMetadata;
  onSaveReady?: (save: () => Promise<void>) => void;
  onPersistStateChange?: (state: {
    saving: boolean;
    loading: boolean;
    lastError: string | null;
  }) => void;
  onCanvasSizeChange?: (size: { width: number; height: number }) => void;
  onTemplateLoaded?: (template: ApiTemplate) => void;
  onExit?: () => void;
}

interface StudioProps {
  templateMode?: StudioTemplateMode;
  // Desktop workspace instance id. Present when the studio runs inside a document
  // tab; it binds this editor to one `.bitgrain` file for load and autosave.
  instanceId?: string;
  // The owning document tab's id. Studio publishes its export/present actions to
  // the title bar keyed by this id; the title bar shows only the active tab's.
  tabId?: string;
  // A starter format/template to seed a brand-new studio tab from. Ignored once
  // the tab has a saved `.bitgrain` file (the file wins on reload).
  initialTemplate?: TemplateDef;
}

export const Studio: React.FC<StudioProps> = ({ templateMode, instanceId, tabId, initialTemplate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { workId } = useParams<{ workId?: string }>();
  const routerState = location.state as StudioLocationState | null;
  const routerImage = routerState?.image ?? null;

  const routeTemplateId = templateMode ? null : readRouteTemplateId(location.state, location.search);
  // Desktop: a new studio tab may be seeded with a starter template; otherwise the
  // web resolution (route template, router state, blank) applies.
  const [initial] = useState<TemplateDef>(
    () => (!templateMode ? initialTemplate : undefined)
      ?? peekRouteTemplate(routeTemplateId)
      ?? resolveInitialTemplate(!!templateMode, routerState),
  );
  const [template, setTemplate] = useState<TemplateDef>(initial);
  const pagesApi = useStudioPages({ initialTemplate: initial });
  const {
    pages, activePageId, layers, background,
    setLayers, setBackground, setLayersForPage, updatePage,
    setPagePosition, setPageSize, setPageTransform, setPageBackgroundForPage,
    bindPageBackground,
    setPageImage, setActivePageId, setPages, resetPagesFromTemplate, renamePage,
  } = pagesApi;
  const [canvasW, setCanvasW] = useState(initial.width);
  const [canvasH, setCanvasH] = useState(initial.height);
  const scaleContents = SCALE_CONTENTS_ON_RESIZE;

  const canvasWRef = useRef(canvasW);
  const canvasHRef = useRef(canvasH);

  useEffect(() => {
    canvasWRef.current = canvasW;
    canvasHRef.current = canvasH;
  }, [canvasW, canvasH]);

  const dragCanvasWRef = useRef<number | null>(null);
  const dragCanvasHRef = useRef<number | null>(null);
  const activePage = pages.find((page) => page.id === activePageId);
  const image = activePage?.image ?? null;
  const setImage = useCallback(
    (value: string | null) => {
      setPageImage(activePageId, value);
    },
    [activePageId, setPageImage],
  );
  const [rawSelectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedIds = usePrunedSelection(rawSelectedIds, pages);
  const [selectedFramePageId, setSelectedFramePageId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vectorEditingId, setVectorEditingId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const dark = useSignalValue(themeSignal) === "dark";

  useStudioInit({ initial });
  useStudioPaste();

  const routerImageAppliedRef = useRef(false);
  useEffect(() => {
    if (routerImageAppliedRef.current || !routerImage || pages.length === 0) return;
    routerImageAppliedRef.current = true;
    setPageImage(pages[0].id, routerImage);
    markDirty();
  }, [routerImage, pages, setPageImage]);

  const { past, future, pushHistory: pushHistoryBase, undo, redo, resetHistory } = useStudioHistory({
    pages, activePageId, canvasW, canvasH,
    setPages, setActivePageId, setCanvasW, setCanvasH,
  });

  const pushHistory = useCallback(() => {
    markDirty();
    pushHistoryBase();
  }, [pushHistoryBase]);

  const [customFonts, setCustomFonts] = useState<CustomFontEntry[]>(loadStoredCustomFonts);
  const [workCreatedAt] = useState<number>(() => Date.now());
  const workCreatedAtRef = useRef<number>(workCreatedAt);
  const [workName, setWorkName] = useState<string>(() =>
    isBlankTemplate(initial) ? `Untitled, ${new Date().toLocaleDateString()}` : initial.name,
  );
  const workNameRef = useRef<string>(workName);
  useEffect(() => {
    studioWorkNameSignal.value = workName;
  }, [workName]);

  const handleRenameWork = useCallback((name: string) => {
    setWorkName(name);
    workNameRef.current = name;
    markDirty();
    trackEvent("studio", "project_renamed");
  }, []);

  const studioPersist = useStudioPersist({
    workId: templateMode ? undefined : workId,
    instanceId: templateMode ? undefined : instanceId,
    template, layers, background, pages, activePageId,
    canvasW, canvasH, image,
    workNameRef, workCreatedAtRef,
    setPages, setActivePageId, setCanvasW, setCanvasH, setImage, setWorkName,
  });

  const templatePersist = useTemplatePersist({
    templateId: templateMode?.templateId ?? "",
    metadata: templateMode?.metadata ?? {
      name: "", category: "poster", isFree: false, sortOrder: 0, tags: [],
    },
    template, layers, background, pages, canvasW, canvasH, image,
    setTemplate, setPages, setActivePageId, setCanvasW, setCanvasH,
    onTemplateLoaded: templateMode?.onTemplateLoaded,
  });

  const handleManualSave = templateMode ? templatePersist.handleManualSave : studioPersist.handleManualSave;
  const handleRestore = studioPersist.handleRestore;

  const scheduleAutosave = useStudioAutosave({ enabled: !templateMode, save: studioPersist.handleManualSave });
  useEffect(
    () => scheduleAutosave(),
    [scheduleAutosave, layers, background, pages, activePageId, canvasW, canvasH, image],
  );

  const { handleResizeToFormats, handleAddMockupPage } = usePageGenerators({
    pages, activePageId, pushHistory, setPages, setActivePageId,
  });
  const showRestoreToast = templateMode ? false : studioPersist.showRestoreToast;
  const setShowRestoreToast = studioPersist.setShowRestoreToast;

  const onSaveReady = templateMode?.onSaveReady;
  useEffect(() => {
    if (!onSaveReady) return;
    onSaveReady(templatePersist.handleManualSave);
  }, [onSaveReady, templatePersist.handleManualSave]);

  useEffect(() => {
    if (!templateMode?.onPersistStateChange) return;
    templateMode.onPersistStateChange({
      saving: templatePersist.saving,
      loading: templatePersist.loading,
      lastError: templatePersist.lastError,
    });
  }, [templateMode, templatePersist.saving, templatePersist.loading, templatePersist.lastError]);

  useEffect(() => {
    templateMode?.onCanvasSizeChange?.({ width: canvasW, height: canvasH });
  }, [templateMode, canvasW, canvasH]);

  useEffect(() => {
    const name = workNameRef.current || "Studio";
    const titleText = `${name}, Bitgrain`;
    document.title = titleText;
    const timer = setTimeout(() => { document.title = titleText; }, 50);
    return () => clearTimeout(timer);
  }, [workId, layers.length]);

  const handleExit = buildHandleExit({ handleManualSave, navigate, onExit: templateMode?.onExit });

  const handleLoadBTG = useCallback(
    (project: BTGStudioProject, customFontList: Array<{ label: string; dataUrl: string }>) => {
      applyBtgProject({
        project, customFontList,
        setPages, setActivePageId, setCanvasW, setCanvasH, setImage,
        resetHistory, setCustomFonts,
      });
      markDirty();
      requestCanvasFit();
    },
    [resetHistory, setPages, setActivePageId, setImage],
  );

  useEffect(() => {
    if (routerState?.fromBTG) {
      const data = routerState.fromBTG;
      queueMicrotask(() => handleLoadBTG(data, data.customFonts || []));
    }
  }, [routerState?.fromBTG, handleLoadBTG]);

  const resolveTargetFrame = (): FrameLayer | null => {
    if (selectedIds.length !== 1) return null;
    const selected = findLayerById(layers, selectedIds[0]);
    if (selected?.type === "frame") return selected;
    const parentId = findParentContainerId(pages, selectedIds[0]);
    if (parentId) {
      const parent = findLayerById(layers, parentId);
      if (parent?.type === "frame") return parent;
    }
    return null;
  };
  const targetFrame = resolveTargetFrame();

  const layersApi = useStudioLayers({
    layers, selectedIds,
    pageWidth: activePage?.width ?? canvasW,
    pageHeight: activePage?.height ?? canvasH,
    background, setLayers, setSelectedIds, pushHistory, setEditingId,
    targetFrameId: targetFrame?.id ?? null,
    targetFrameSize: targetFrame ? { width: targetFrame.width, height: targetFrame.height } : null,
    setLayersForFrame: pagesApi.setLayersForFrame,
  });

  useElementInsert({ pages, activePageId, setLayersForPage, setActivePageId, setSelectedIds, pushHistory });

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setLayers((prev) => updateLayersRecursively(prev, [id], () => updates));
  };

  const animationApi = useStudioAnimation({
    activePage,
    activePageId,
    layers,
    template: { ...template, width: canvasW, height: canvasH },
    updatePage,
    setLayers,
    updateLayer,
    pushHistory,
  });

  useEffect(() => {
    loadDesignKits();
  }, []);

  useEffect(() => initModifierKeys(), []);

  const applyToSelection = (fn: (layer: Layer) => Partial<Layer> | null): void => {
    if (selectedIds.length === 0) return;
    pushHistory();
    for (const id of selectedIds) {
      const layer = findLayerById(layers, id);
      if (!layer) continue;
      const update = fn(layer);
      if (update) updateLayer(id, update);
    }
  };

  const handleApplyKitColor = (varId: string, hex: string): void => {
    if (selectedIds.length === 0) return;
    trackKit("studio_kit_applied", { token: "color" });
    applyToSelection((layer) => colorBindUpdateForLayer(layer, varId, hex));
  };

  const handleVariableColorChange = (varId: string, hex: string): void => {
    pushHistory();
    updateColor(varId, { value: hex });
    setPages(resyncVarInPages(pages, varId, hex));
  };

  const handlePageBackgroundBind = (pageId: string, varId: string, value: string): void => {
    pushHistory();
    bindPageBackground(pageId, value, varId);
  };

  const handleApplyKitTextStyle = (style: TextStyleVariable): void => {
    if (selectedIds.length === 0) return;
    trackKit("studio_kit_applied", { token: "text_style" });
    applyToSelection((layer) => (layer.type === "text" ? textStyleUpdate(style) : null));
  };

  const handleApplyKitNumber = (token: NumberToken): void => {
    if (selectedIds.length === 0) return;
    trackKit("studio_kit_applied", { token: "number", kind: token.kind });
    applyToSelection((layer) => numberUpdateForLayer(layer, token));
  };

  const handleAddImageFromUrl = layersApi.handleAddImageFromUrl;
  useEffect(() => {
    return onInsertImage((payload) => {
      handleAddImageFromUrl(payload.src, {
        name: payload.name,
        width: payload.width,
        height: payload.height,
      });
    });
  }, [handleAddImageFromUrl]);

  const duplicateActivePageShortcut = useCallback(() => {
    pushHistory();
    const newId = pagesApi.duplicateActivePage();
    if (newId) setActivePageId(newId);
    trackEvent("studio", "page_duplicated", { details: { source: "shortcut" } });
  }, [pushHistory, pagesApi, setActivePageId]);

  const deleteSelectedFrameShortcut = useCallback(() => {
    if (!selectedFramePageId) return;
    pushHistory();
    pagesApi.deleteFrame(selectedFramePageId);
    setSelectedFramePageId(null);
    trackEvent("studio", "frame_deleted", { details: { source: "shortcut", is_page: true } });
  }, [selectedFramePageId, pushHistory, pagesApi]);

  const handleAddFrame = useCallback(
    (parentId: string | null, rect: FrameRect): string => {
      pushHistory();
      trackEvent("studio", "frame_added", { details: { nested: parentId !== null } });
      return pagesApi.addFrame(parentId, rect);
    },
    [pushHistory, pagesApi],
  );

  const handleDeleteFrame = useCallback(
    (frameId: string) => {
      pushHistory();
      pagesApi.deleteFrame(frameId);
      trackEvent("studio", "frame_deleted", {
        details: { source: "panel", is_page: pagesApi.pages.some((page) => page.id === frameId) },
      });
      if (frameId === selectedFramePageId) setSelectedFramePageId(null);
      setSelectedIds((prev) => prev.filter((id) => id !== frameId));
    },
    [pushHistory, pagesApi, selectedFramePageId, setSelectedFramePageId, setSelectedIds],
  );

  const handleReparentFrame = useCallback(
    (frameId: string, newParentId: string | null, dropLocal?: { x: number; y: number }) => {
      pushHistory();
      pagesApi.reparentFrame(frameId, newParentId, dropLocal);
      trackEvent("studio", "frame_reparented", { details: { to_top_level: newParentId === null } });
    },
    [pushHistory, pagesApi],
  );

  useStudioShortcuts({
    undo, redo, selectedIds, editingId, vectorEditingId,
    setVectorEditingId, setSelectedIds, pushHistory, setLayers,
    handleGroup: layersApi.handleGroup, handleUngroup: layersApi.handleUngroup,
    handleDuplicate: layersApi.handleDuplicate,
    handleDuplicatePage: duplicateActivePageShortcut,
    selectedFramePageId,
    handleDeleteSelectedFrame: deleteSelectedFrameShortcut,
  });

  const handleNewProject = buildHandleNewProject({ handleManualSave, navigate, onExit: templateMode?.onExit });

  const applyTemplate = (t: TemplateDef) => {
    trackPosthog("studio_template_selected", { template_id: t.id, width: t.width, height: t.height });
    trackEvent("studio", "template_selected", { details: { template_id: t.id } });
    setTemplate(t);
    resetPagesFromTemplate(t);
    setCanvasW(t.width);
    setCanvasH(t.height);
    setSelectedIds([]);
    setEditingId(null);
    clearStudioAutosave().catch(() => {});
    markDirty();
    requestCanvasFit();
  };

  const handleSelectTemplate = (t: TemplateDef) => {
    promptTemplateSwitch(handleManualSave, () => applyTemplate(t));
  };

  useApplyRouteTemplate(routeTemplateId, initial.id, applyTemplate);

  useStudioCommands({ ...layersApi, layers, selectedIds, setSelectedIds, setLayers, pushHistory });

  const handleLayerContextMenu = (id: string, x: number, y: number) => {
    buildLayerContextMenu({
      ...layersApi, id, x, y, selectedIds, layers, setSelectedIds, updateLayer, pushHistory, setLayers,
    });
  };

  const pageHandlers = useStudioPageHandlers({
    pushHistory,
    undo,
    pagesApi: {
      addPage: pagesApi.addPage,
      addPageWithSize: pagesApi.addPageWithSize,
      duplicatePageById: pagesApi.duplicatePageById,
      deletePage: pagesApi.deletePage,
    },
    setActivePageId,
    setSelectedIds,
    setSelectedFramePageId,
    setEditingId,
    setVectorEditingId,
    setLayersForPage,
    setPagePosition,
    setPageBackgroundForPage,
    setPageSize,
    setPageTransform,
    renamePage,
    scaleContents,
  });

  const handleMatchPageToLayer = useCallback(
    (layerId: string) => {
      const layer = findLayerById(layers, layerId);
      if (!layer) return;
      pushHistory();
      const width = Math.max(MIN_PAGE_SIZE_PX, Math.round(layer.width));
      const height = Math.max(MIN_PAGE_SIZE_PX, Math.round(layer.height));
      setPageSize(activePageId, width, height);
      setCanvasW(width);
      setCanvasH(height);
      setLayers((prev) => updateLayersRecursively(prev, [layerId], () => ({ x: 0, y: 0 })));
      trackEvent("studio", "page_matched_to_layer", { details: { width, height } });
    },
    [layers, activePageId, pushHistory, setPageSize, setCanvasW, setCanvasH, setLayers],
  );

  const effectiveTemplate: TemplateDef = { ...template, width: canvasW, height: canvasH };
  const displayLayers = animationApi.displayLayers;
  const selectedLayer = selectedIds[0] ? findLayerById(displayLayers, selectedIds[0]) : null;

  const railActive = useSignalValue(activeTabIdSignal) === tabId;
  updateStudioRatingSource({ template, pages, activePageId, workId });

  const workspaceProps: StudioWorkspaceProps = {
    railActive,
    template, effectiveTemplate, background, layers: displayLayers, selectedIds, selectedLayer,
    image, zoom, dark, past, future, editingId, vectorEditingId, scaleContents,
    canvasW, canvasH, customFonts, showRestoreToast,
    workName, onRenameWork: handleRenameWork,
    canvasWRef, canvasHRef, dragCanvasWRef, dragCanvasHRef,
    setSelectedIds, setLayers: animationApi.setLayers, setBackground, setCanvasW, setCanvasH,
    setEditingId, setVectorEditingId, setZoom, setImage, setCustomFonts,
    setShowRestoreToast,
    pushHistory, undo, redo, updateLayer: animationApi.updateLayer, commitUpdate: animationApi.commitUpdate,
    handleApplyKitColor, handleApplyKitTextStyle, handleApplyKitNumber,
    handleVariableColorChange,
    handlePageBackgroundBind,
    handleExit, handleNewProject, handleLoadBTG, handleSelectTemplate,
    handleMatchPageToLayer, handleLayerContextMenu, handleRestore, handleResizeToFormats, handleAddMockupPage,
    pages, activePageId,
    selectedFramePageId, setSelectedFramePageId,
    handleAddFrame, handleDeleteFrame, handleReparentFrame,
    animation: animationApi.controller,
    ...pageHandlers,
    ...layersApi,
  };

  // Studio's export + present live in the app title bar (keyed by this tab), not
  // in a custom top bar. Published whenever the document changes; the title bar
  // renders it only while this tab is active.
  const { handleExport, openExportPopup } = useExportHandlers({
    template: effectiveTemplate, background, layers: displayLayers, image, pages, activePageId,
  });
  const handlePresent = useCallback(() => {
    if (pages.length === 0) return;
    const presentPages = pages.map((page) =>
      page.id === activePageId ? { ...page, layers: displayLayers } : page,
    );
    const startIndex = Math.max(presentPages.findIndex((p) => p.id === activePageId), 0);
    emitModal({ type: "present", pages: presentPages, template: effectiveTemplate, startIndex });
  }, [pages, activePageId, displayLayers, effectiveTemplate]);

  useEffect(() => {
    if (templateMode || !tabId) return;
    setTitlebarActions(
      tabId,
      <div className="flex items-center gap-1.5">
        <button
          onClick={handlePresent}
          aria-label="Present"
          title="Present"
          className="flex h-8 items-center gap-1.5 rounded-lg border border-[var(--s-border)] px-3 text-[12px] font-medium text-[var(--s-text)] transition-colors hover:bg-[var(--s-bg-input)] active:scale-95"
        >
          <Play size={12} strokeWidth={2} className="fill-current" />
          Present
        </button>
        <TopBarExport onExport={handleExport} onOpenPopup={openExportPopup} />
      </div>,
    );
    return () => clearTitlebarActions(tabId);
  }, [tabId, templateMode, handlePresent, handleExport, openExportPopup]);

  // Bitgrain (.btg) document import/export, invoked from the native File menu.
  const { importBTG } = useBTGImport();
  const btgInputRef = useRef<HTMLInputElement>(null);
  const handleSaveBtg = useCallback(() => {
    // Embedded fonts are kept in localStorage under bitgrain_font_*; collect them
    // so the exported .btg is self-contained.
    const fonts: Array<{ label: string; dataUrl: string }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith("bitgrain_font_")) continue;
      const item = localStorage.getItem(key);
      if (!item) continue;
      try {
        const { dataUrl, fontName } = JSON.parse(item);
        fonts.push({ label: fontName, dataUrl });
      } catch {
        /* skip */
      }
    }
    const btgPages = pages.map((page) => ({
      id: page.id, name: page.name, layers: page.layers, background: page.background,
      x: page.x, y: page.y, width: page.width, height: page.height, image: page.image ?? null,
    }));
    const project = createStudioBTG(
      canvasW, canvasH, background, layers, fonts, image, btgPages, activePageId,
    );
    downloadBTG(project);
  }, [canvasW, canvasH, background, layers, image, pages, activePageId]);
  const handleBtgFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const project = await importBTG(file);
      if (project && project.type === "studio") {
        handleLoadBTG(project, project.customFonts || []);
      }
    }
    e.target.value = "";
  }, [importBTG, handleLoadBTG]);

  // Register the studio's native-menu commands while this tab is the active one.
  useEffect(() => {
    if (templateMode || !tabId) return;
    registerSurfaceCommands(tabId, {
      save: () => void handleManualSave(),
      export: handleExport,
      "export-options": openExportPopup,
      "open-btg": () => btgInputRef.current?.click(),
      "save-btg": handleSaveBtg,
      "new-project": handleNewProject,
      "fit-canvas": () => setZoom(DEFAULT_ZOOM),
      present: handlePresent,
      plugins: () => {
        const list = pluginsSignal.value;
        if (list.length > 0) setActivePluginSlug(list[0].slug);
      },
      "release-notes": () => emitModal({ type: "changelog" }),
      resize: () =>
        emitModal({ type: "resize", sourceWidth: canvasW, sourceHeight: canvasH, onApply: handleResizeToFormats }),
      mockup: () =>
        emitModal({
          type: "mockup", template: effectiveTemplate, background, layers: displayLayers,
          image, width: canvasW, height: canvasH, selectedLayer, onAddPage: handleAddMockupPage,
        }),
    });
    return () => clearSurfaceCommands(tabId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId, templateMode, handleManualSave, handleExport, openExportPopup, handleSaveBtg, handleNewProject,
      canvasW, canvasH, effectiveTemplate, background, displayLayers, image, selectedLayer]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < MOBILE_BREAKPOINT_PX;
  if (isMobile) return <MobileStudioWorkspace {...workspaceProps} />;

  return (
    <main
      data-theme={dark ? "dark" : "light"}
      data-animate-mode={animationApi.controller.mode ? "true" : undefined}
      className="flex flex-col h-screen overflow-hidden font-editorial"
    >
      <h1 className="sr-only">Bitgrain Studio, Dithered Design Workspace</h1>

      <StudioWorkspace {...workspaceProps} />
      <WorkLoadOverlay onRetry={() => void studioPersist.retryLoad()} onBack={() => navigate("/studio")} />

      <PopoverPortal />
      <ExportPopupPortal />
      <ContextMenuPortal />
      <PluginFloatingWindow />
      <input
        ref={btgInputRef}
        type="file"
        accept=".btg,application/json"
        className="hidden"
        onChange={handleBtgFileInput}
      />
    </main>
  );
};

export default Studio;
