import React, { useRef, useEffect } from "react";
import type { TemplateDef, Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { useSignalValue } from "@bitgrain/core/signal";
import { emitPlatformModal } from "@bitgrain/platform/modals/platform-modal-events";
import { emitStudioModal } from "../modals/studio-dialog/host/studio-modal-events";
import { MenuDrop } from "../ui/MenuDrop";
import { activeMenuSignal } from "../ui/menu-signal";
import { MenuItem } from "../ui/MenuItem";
import { MenuSep } from "../ui/MenuSep";
import { useBTGImport } from "@bitgrain/studio-core/io/use-btg-import";
import type { BTGStudioProject } from "@bitgrain/studio-core/io/btg-export";
import { saveStudioBTG } from "./save-studio-btg";
import { pluginsSignal, setActivePluginSlug } from "../plugins/host/plugin-bus";
import { ensurePluginsLoaded } from "../plugins/host/load-plugins";
import { trackEvent } from "@bitgrain/platform/tracker";
import { layerClipboardSignal } from "../state/layer-clipboard-store";
import { emitStudioCommand, type StudioCommand } from "../editor/studio-command-event";
import { MOD_ALT_KEY, MOD_KEY, MOD_SHIFT_KEY } from "../editor/shortcut-labels";
import { emitOpenFindReplace } from "../find-replace/find-replace-events";
import { canvasAidsSignal, toggleGuides, toggleRulers } from "../state/canvas-aids/canvas-aids-visibility";
import { emitVersionCommand, type VersionCommand } from "../features/versions/version-events";
import { openSlideSorter } from "../features/presenter/sorter/state/slide-sorter-store";
import { showCommentsSignal } from "../features/sharing/comment-state/comment-ui-store";
import { toggleShowComments } from "../features/sharing/comment-state/comment-mode";
import { notesStripVisibleSignal, toggleNotesStripVisible } from "../features/presenter/notes/notes-strip-visibility";
import { openMetadataCleaner } from "@bitgrain/darkroom/metadata-cleaner/open-metadata-cleaner";
import { openPalette } from "../features/command-palette/state/palette-store";
import { emitTutorial } from "@bitgrain/ui/tutorial/tutorial-events";

const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0, 4.0, 8.0, 16.0, 32.0];
const STUDIO_GUIDE_PATH = "/docs";

interface TopBarMenusProps {
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
  onBack: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomSet: (z: number) => void;
  onZoomReset: () => void;
  onToggleDark: () => void;
  onExportOptions: () => void;
  onAddImage: () => void;
  onAddAdjustment: () => void;
  onLoadBTG?: (project: BTGStudioProject, customFonts: Array<{ label: string; dataUrl: string }>) => void;
  onStartFresh?: () => void;
  onResize?: () => void;
  hasSelection: boolean;
}

const closeMenu = () => {
  activeMenuSignal.value = null;
};

const runCommand = (command: StudioCommand): void => {
  emitStudioCommand(command);
  closeMenu();
};

const runVersionCommand = (command: VersionCommand): void => {
  closeMenu();
  emitVersionCommand(command);
};

const openShortcuts = (): void => {
  closeMenu();
  trackEvent("studio", "shortcuts_opened", { details: { source: "help_menu" } });
  emitStudioModal({ type: "keyboard-shortcuts" });
};

const openSearch = (): void => {
  closeMenu();
  openPalette("help_menu");
};

const startStudioTour = (): void => {
  closeMenu();
  trackEvent("studio", "tour_replayed", { details: { source: "help_menu" } });
  emitTutorial({ type: "start", tutorialId: "studio" });
};

const openFeedback = (): void => {
  closeMenu();
  trackEvent("studio", "feedback_opened", { details: { source: "help_menu" } });
  emitPlatformModal({ type: "ticket" });
};

const openStudioGuide = (): void => {
  closeMenu();
  trackEvent("studio", "studio_guide_opened");
  window.open(STUDIO_GUIDE_PATH, "_blank", "noopener");
};

export const TopBarMenus: React.FC<TopBarMenusProps> = ({
  template, background, layers, image, pages, activePageId,
  zoom, dark, canUndo, canRedo,
  onBack, onUndo, onRedo, onZoomSet, onZoomReset, onToggleDark,
  onExportOptions, onAddImage, onAddAdjustment, onLoadBTG, onStartFresh, onResize, hasSelection,
}) => {
  const canPaste = useSignalValue(layerClipboardSignal) !== null;
  const canvasAids = useSignalValue(canvasAidsSignal);
  const showComments = useSignalValue(showCommentsSignal);
  const showNotesStrip = useSignalValue(notesStripVisibleSignal);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plugins = useSignalValue(pluginsSignal);
  const { importBTG } = useBTGImport();

  useEffect(() => {
    void ensurePluginsLoaded();
  }, []);

  const handleBTGImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleBTGFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onLoadBTG) return;
    const project = await importBTG(file);
    if (!project || project.type !== "studio") return;
    const studioProject = project as BTGStudioProject;
    emitVersionCommand("checkpoint-import");
    onLoadBTG(studioProject, studioProject.customFonts);
    trackEvent("studio", "btg_imported", { details: { source: "file_menu" } });
    closeMenu();
    event.target.value = "";
  };

  const handleBTGExport = () => {
    saveStudioBTG({ template, background, layers, image, pages, activePageId });
    closeMenu();
  };

  return (
    <>
      <MenuDrop name="file" label="File">
        <MenuItem label="New project" onClick={() => { onStartFresh?.(); closeMenu(); }} />
        <MenuItem label="Import image…" onClick={() => { onAddImage(); closeMenu(); }} />
        <MenuItem label="Adjustment layer" onClick={() => { onAddAdjustment(); closeMenu(); }} />
        {onResize && <MenuItem label="Resize to formats…" onClick={() => { onResize(); closeMenu(); }} />}
        <MenuSep />
        <MenuItem label="Back to projects" onClick={() => { onBack(); closeMenu(); }} />
        <MenuSep />
        <MenuItem label="Open .btg file…" onClick={handleBTGImportClick} />
        <MenuItem label="Save as .btg…" onClick={handleBTGExport} />
        <MenuSep />
        <MenuItem label="Save version…" shortcut={`${MOD_ALT_KEY}S`} onClick={() => runVersionCommand("save")} />
        <MenuItem label="Version history" onClick={() => runVersionCommand("history")} />
        <MenuSep />
        <MenuItem label="Export…" onClick={() => { onExportOptions(); closeMenu(); }} />
        <MenuItem label="Clean image metadata…" onClick={() => { closeMenu(); openMetadataCleaner("studio"); }} />
      </MenuDrop>

      <input
        ref={fileInputRef}
        type="file"
        accept=".btg,application/json"
        className="hidden"
        onChange={handleBTGFileInput}
      />

      <MenuDrop name="edit" label="Edit">
        <MenuItem
          label="Undo" shortcut={`${MOD_KEY}Z`} disabled={!canUndo}
          onClick={() => { onUndo(); closeMenu(); }}
        />
        <MenuItem
          label="Redo" shortcut={`${MOD_SHIFT_KEY}Z`} disabled={!canRedo}
          onClick={() => { onRedo(); closeMenu(); }}
        />
        <MenuSep />
        <MenuItem label="Copy" shortcut={`${MOD_KEY}C`} disabled={!hasSelection} onClick={() => runCommand("copy")} />
        <MenuItem label="Paste" shortcut={`${MOD_KEY}V`} disabled={!canPaste} onClick={() => runCommand("paste")} />
        <MenuItem label="Duplicate" shortcut={`${MOD_KEY}D`} disabled={!hasSelection} onClick={() => runCommand("duplicate")} />
        <MenuItem label="Delete" shortcut="⌫" disabled={!hasSelection} onClick={() => runCommand("delete")} />
        <MenuSep />
        <MenuItem label="Select all" shortcut={`${MOD_KEY}A`} onClick={() => runCommand("select-all")} />
        <MenuItem label="Find and replace" shortcut={`${MOD_KEY}F`} onClick={() => { closeMenu(); emitOpenFindReplace(); }} />
      </MenuDrop>

      <MenuDrop name="view" label="View">
        {ZOOM_PRESETS.map((z) => (
          <MenuItem
            key={z}
            label={`${Math.round(z * 100)}%`}
            checked={Math.abs(zoom - z) < 0.01}
            onClick={() => { onZoomSet(z); closeMenu(); }}
          />
        ))}
        <MenuSep />
        <MenuItem
          label="Zoom to fit" shortcut={`${MOD_KEY}0`}
          onClick={() => { onZoomReset(); closeMenu(); }}
        />
        <MenuItem
          label="Slide sorter" shortcut="G"
          onClick={() => { openSlideSorter(); closeMenu(); }}
        />
        <MenuSep />
        <MenuItem
          label="Rulers" shortcut="⇧R" checked={canvasAids.rulers}
          onClick={() => { toggleRulers(); closeMenu(); }}
        />
        <MenuItem
          label="Guides" shortcut={`${MOD_KEY};`} checked={canvasAids.guides}
          onClick={() => { toggleGuides(); closeMenu(); }}
        />
        <MenuItem
          label="Show comments" shortcut="⇧C" checked={showComments}
          onClick={() => { toggleShowComments(); closeMenu(); }}
        />
        <MenuItem
          label="Speaker notes" checked={showNotesStrip}
          onClick={() => { toggleNotesStripVisible(); closeMenu(); }}
        />
        <MenuSep />
        <MenuItem
          label={dark ? "Switch to light" : "Switch to dark"}
          onClick={() => { onToggleDark(); closeMenu(); }}
        />
      </MenuDrop>

      <MenuDrop name="help" label="Help">
        <MenuItem label="Search tools" shortcut={`${MOD_KEY}K`} onClick={openSearch} />
        <MenuItem label="Take the studio tour" onClick={startStudioTour} />
        <MenuItem label="Keyboard shortcuts" onClick={openShortcuts} />
        <MenuItem label="Studio guide" onClick={openStudioGuide} />
        <MenuItem label="Report a bug or idea" onClick={openFeedback} />
        <MenuSep />
        <MenuItem
          label="Release notes"
          onClick={() => {
            closeMenu();
            trackEvent("studio", "release_notes_opened");
            emitPlatformModal({ type: "changelog" });
          }}
        />
      </MenuDrop>

      {plugins.length > 0 && (
        <MenuDrop name="plugins" label="Plugins">
          {plugins.map((plugin) => (
            <MenuItem
              key={plugin.slug}
              label={plugin.name}
              onClick={() => {
                trackEvent("studio", "plugin_opened", { details: { plugin_slug: plugin.slug, source: "plugins_menu" } });
                setActivePluginSlug(plugin.slug);
                closeMenu();
              }}
            />
          ))}
        </MenuDrop>
      )}
    </>
  );
};
