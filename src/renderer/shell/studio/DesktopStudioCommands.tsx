import { useEffect, useRef } from "react";
import type { Layer, TemplateDef, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { BTGStudioProject } from "@bitgrain/studio-core/io/btg-export";
import { useBTGImport } from "@bitgrain/studio-core/io/use-btg-import";
import { useExportHandlers } from "@bitgrain/studio/topbar/use-export-handlers";
import { saveStudioBTG } from "@bitgrain/studio/topbar/save-studio-btg";
import { emitStudioModal } from "@bitgrain/studio/modals/studio-dialog/host/studio-modal-events";
import { emitVersionCommand } from "@bitgrain/studio/features/versions/version-events";
import { requestCanvasFit } from "@bitgrain/studio/state/canvas-fit-request";
import { pluginsSignal, setActivePluginSlug } from "@bitgrain/studio/plugins/host/plugin-bus";
import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { registerSurfaceCommands, clearSurfaceCommands } from "../../store/surface-commands-store";

export interface DesktopStudioCommandsProps {
  tabId: string | undefined;
  template: TemplateDef;
  background: string;
  layers: Layer[];
  image: string | null;
  pages: TemplatePage[];
  activePageId: string;
  canvasW: number;
  canvasH: number;
  selectedLayer: Layer | null;
  handleManualSave: () => Promise<unknown>;
  handleNewProject: () => void;
  handleLoadBTG: (project: BTGStudioProject, customFonts: Array<{ label: string; dataUrl: string }>) => void;
  handleResizeToFormats: (formatIds: string[]) => void;
  handleAddMockupPage: (dataUrl: string, width: number, height: number) => void;
}

// Desktop-only: registers this studio tab's handlers for the native OS menu
// (Save, Export, .btg import/export, Present, Resize, Mockup, ...). Studio
// renders it inside its <Activity> pane, so the commands exist only while the tab
// is visible. Every action reuses the web studio's own helpers and modal events.
export function DesktopStudioCommands(props: DesktopStudioCommandsProps) {
  const { tabId, template, background, layers, image, pages, activePageId, canvasW, canvasH } = props;
  const btgInputRef = useRef<HTMLInputElement>(null);
  const propsRef = useRef(props);
  useEffect(() => {
    propsRef.current = props;
  });
  const { importBTG } = useBTGImport();
  const { handleExport, openExportOptions } = useExportHandlers({
    template, background, layers, image, pages, activePageId,
  });

  useEffect(() => {
    if (!tabId) return;
    const current = (): DesktopStudioCommandsProps => propsRef.current;
    registerSurfaceCommands(tabId, {
      save: () => void current().handleManualSave(),
      export: () => void handleExport(),
      "export-options": openExportOptions,
      "open-btg": () => btgInputRef.current?.click(),
      "save-btg": () => saveStudioBTG(current()),
      "new-project": () => current().handleNewProject(),
      "fit-canvas": requestCanvasFit,
      present: () => presentPages(current()),
      plugins: openFirstPlugin,
      "release-notes": () => emitPlatformModal({ type: "changelog" }),
      resize: () => emitStudioModal({
        type: "resize", sourceWidth: canvasW, sourceHeight: canvasH, onApply: current().handleResizeToFormats,
      }),
      mockup: () => openMockup(current()),
    });
    return () => clearSurfaceCommands(tabId);
  }, [tabId, handleExport, openExportOptions, canvasW, canvasH]);

  const handleBtgFile = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const project = await importBTG(file);
    if (!project || project.type !== "studio") return;
    const studioProject = project as BTGStudioProject;
    emitVersionCommand("checkpoint-import");
    propsRef.current.handleLoadBTG(studioProject, studioProject.customFonts);
  };

  return (
    <input
      ref={btgInputRef}
      type="file"
      accept=".btg,application/json"
      className="hidden"
      onChange={(event) => void handleBtgFile(event)}
    />
  );
}

function presentPages({ pages, activePageId, layers, template }: DesktopStudioCommandsProps): void {
  if (pages.length === 0) return;
  const presented = pages.map((page) => (page.id === activePageId ? { ...page, layers } : page));
  const startIndex = Math.max(presented.findIndex((page) => page.id === activePageId), 0);
  emitStudioModal({ type: "present", pages: presented, template, startIndex });
}

function openMockup(props: DesktopStudioCommandsProps): void {
  emitStudioModal({
    type: "mockup",
    template: props.template,
    background: props.background,
    layers: props.layers,
    image: props.image,
    width: props.canvasW,
    height: props.canvasH,
    selectedLayer: props.selectedLayer,
    onAddPage: props.handleAddMockupPage,
  });
}

function openFirstPlugin(): void {
  const list = pluginsSignal.value;
  if (list.length > 0) setActivePluginSlug(list[0].slug);
}
