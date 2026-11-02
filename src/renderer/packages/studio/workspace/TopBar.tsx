import React, { useRef, useEffect } from "react";
import { ArrowLeft, Play } from "lucide-react";
import { ShellWorkspaceSwitcher } from "@bitgrain/ui/shell/ShellWorkspaceSwitcher";
import { useAnimationMode } from "../state/animation-editor-store";
import { emitStudioModal } from "../modals/studio-dialog/host/studio-modal-events";
import { trackEvent } from "@bitgrain/platform/tracker";
import type { TemplateDef, Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { TextStyleVariable, NumberToken } from "@bitgrain/studio-core/model/design-kit-types";
import { activeMenuSignal } from "../ui/menu-signal";
import { Tooltip } from "@bitgrain/ui/controls/panel/Tooltip";
import type { BTGStudioProject } from "@bitgrain/studio-core/io/btg-export";
import { TopBarMenus } from "../topbar/TopBarMenus";
import { TopBarUndoRedo } from "../topbar/TopBarUndoRedo";
import { TopBarExport } from "../topbar/TopBarExport";
import { TopBarProject } from "../topbar/TopBarProject";
import { AnimateModeToggle } from "../topbar/AnimateModeToggle";
import { SaveStatus } from "../topbar/save-status/save-status";
import { TopBarDesignKit } from "../topbar/TopBarDesignKit";
import { BrandCheckButton } from "../design-kit/brand-check/brand-check-button";
import { useExportHandlers } from "../topbar/use-export-handlers";
import { TopBarShare } from "../features/sharing/studio/TopBarShare";
import { useStudioCommandHandler } from "../editor/use-studio-command-handler";
import { PaletteSearchButton } from "../features/command-palette/ui/PaletteSearchButton";
import { TopBarResizeButton } from "./top-bar-resize-button";

interface TopBarProps {
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  pages: TemplatePage[];
  activePageId: string;
  zoom: number;
  dark: boolean;
  canUndo: boolean;
  canRedo: boolean;
  workName?: string;
  onRenameWork: (name: string) => void;
  onToggleAnimate: () => void;
  onBack: () => void;
  onOpenAccount: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomSet: (z: number) => void;
  onZoomReset: () => void;
  onToggleDark: () => void;
  onAddImage: () => void;
  onAddAdjustment: () => void;
  onLoadBTG?: (
    project: BTGStudioProject,
    customFonts: Array<{ label: string; dataUrl: string }>,
  ) => void;
  onStartFresh?: () => void;
  onResize?: () => void;
  selectedLayer: Layer | null;
  selectedIds: string[];
  onApplyKitColor: (varId: string, hex: string) => void;
  onApplyKitTextStyle: (style: TextStyleVariable) => void;
  onApplyKitNumber: (token: NumberToken) => void;
  onVariableColorChange: (varId: string, hex: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  template, background, layers, image, pages, activePageId,
  zoom, dark, canUndo, canRedo, workName, onRenameWork, onToggleAnimate,
  onBack, onUndo, onRedo, onZoomSet, onZoomReset, onToggleDark,
  onAddImage, onAddAdjustment, onLoadBTG, onStartFresh, onResize,
  selectedLayer, selectedIds,
  onApplyKitColor, onApplyKitTextStyle, onApplyKitNumber, onVariableColorChange,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const animateMode = useAnimationMode();
  const activePage = pages.find((page) => page.id === activePageId);

  const { openExportPopup, openExportOptions } = useExportHandlers({
    template, background, layers, image, pages, activePageId,
  });
  // Desktop: no useExportShortcut, Cmd+E is the native menu accelerator (PORTED.md).
  useStudioCommandHandler("export-options", openExportOptions);

  const handlePresent = () => {
    if (pages.length === 0) return;
    const presentPages = pages.map((page) =>
      page.id === activePageId ? { ...page, layers } : page,
    );
    const startIndex = Math.max(
      presentPages.findIndex((page) => page.id === activePageId),
      0,
    );
    trackEvent("studio", "present_opened", { details: { page_count: presentPages.length } });
    emitStudioModal({ type: "present", pages: presentPages, template, startIndex });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) {
        activeMenuSignal.value = null;
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={barRef}
      className="h-10 flex items-center gap-1 px-2 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)] shrink-0 font-editorial relative z-50"
    >
      <ShellWorkspaceSwitcher label="Studio" />
      <Tooltip content="Back to projects">
        <button
          onClick={onBack}
          aria-label="Back to projects"
          className="flex items-center justify-center w-7 h-7 rounded-md border-none cursor-pointer bg-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors active:scale-95"
        >
          <ArrowLeft size={13} strokeWidth={1.75} />
        </button>
      </Tooltip>

      <div className="w-px h-4 bg-[var(--s-border)] mx-1" />

      <div className="flex items-center gap-0.5 h-full">
        <TopBarMenus
          template={template}
          background={background}
          layers={layers}
          image={image}
          pages={pages}
          activePageId={activePageId}
          zoom={zoom}
          dark={dark}
          canUndo={canUndo}
          canRedo={canRedo}
          onBack={onBack}
          onUndo={onUndo}
          onRedo={onRedo}
          onZoomSet={onZoomSet}
          onZoomReset={onZoomReset}
          onToggleDark={onToggleDark}
          onExportOptions={openExportOptions}
          onAddImage={onAddImage}
          onAddAdjustment={onAddAdjustment}
          onLoadBTG={onLoadBTG}
          onStartFresh={onStartFresh}
          onResize={onResize}
          hasSelection={selectedIds.length > 0}
        />
      </div>

      <PaletteSearchButton />

      <div className="flex-1 flex items-center justify-center-safe gap-3 px-3 min-w-0 overflow-hidden">
        <div className="hidden lg:flex min-w-[180px]">
          <TopBarProject
            workName={workName}
            canvasWidth={activePage?.width ?? template.width}
            canvasHeight={activePage?.height ?? template.height}
            onRename={onRenameWork}
          />
        </div>
        <TopBarUndoRedo
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={onUndo}
          onRedo={onRedo}
        />
        <AnimateModeToggle active={animateMode} onToggle={onToggleAnimate} />
        <div className="hidden min-[1400px]:flex shrink-0">
          <SaveStatus />
        </div>
      </div>

      <BrandCheckButton />
      <TopBarDesignKit
        selectedLayer={selectedLayer}
        selectedLayerIds={selectedIds}
        onApplyKitColor={onApplyKitColor}
        onApplyKitTextStyle={onApplyKitTextStyle}
        onApplyKitNumber={onApplyKitNumber}
        onVariableColorChange={onVariableColorChange}
      />

      <div className="w-px h-4 bg-[var(--s-border)] mx-1.5" />

      <TopBarShare
        template={template}
        background={background}
        layers={layers}
        image={image}
        pages={pages}
        activePageId={activePageId}
        workName={workName}
      />

      {onResize && <TopBarResizeButton onResize={onResize} />}

      <Tooltip content="Present (fullscreen)">
        <button
          onClick={handlePresent}
          aria-label="Present"
          className="flex items-center justify-center w-7 h-7 mr-1.5 rounded-md border-none cursor-pointer bg-transparent text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)] transition-colors active:scale-95"
        >
          <Play size={13} strokeWidth={1.75} />
        </button>
      </Tooltip>

      <TopBarExport onOpenPopup={openExportPopup} />
    </div>
  );
};
