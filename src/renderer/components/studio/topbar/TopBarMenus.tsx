import React, { useRef, useEffect } from "react";
import type { TemplateDef, Layer, TemplatePage } from "../../../data/studioTypes";
import { useSignalValue } from "../../../lib/signal";
import { emitModal } from "../../../lib/event-bus";
import { MenuDrop } from "../ui/MenuDrop";
import { activeMenuSignal } from "../ui/menu-signal";
import { MenuItem } from "../ui/MenuItem";
import { MenuSep } from "../ui/MenuSep";
import { useBTGImport } from "../../../hooks/useBTGImport";
import type { BTGStudioProject } from "../../../utils/btg-export";
import { saveStudioBTG } from "./save-studio-btg";
import { pluginsSignal, pluginsLoadedSignal, setActivePluginSlug } from "../../../studio-plugins/host/plugin-bus";
import { fetchPlugins } from "../../../studio-plugins/host/api";

const ZOOM_PRESETS = [0.25, 0.5, 0.75, 1.0, 1.5, 2.0];

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
  onExport: () => void;
  onExportOptions: () => void;
  onAddImage: () => void;
  onAddAdjustment: () => void;
  onLoadBTG?: (project: BTGStudioProject, customFonts: Array<{ label: string; dataUrl: string }>) => void;
  onStartFresh?: () => void;
}

const closeMenu = () => {
  activeMenuSignal.value = null;
};

export const TopBarMenus: React.FC<TopBarMenusProps> = ({
  template, background, layers, image, pages, activePageId,
  zoom, dark, canUndo, canRedo,
  onBack, onUndo, onRedo, onZoomSet, onZoomReset, onToggleDark,
  onExport, onExportOptions, onAddImage, onAddAdjustment, onLoadBTG, onStartFresh,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const plugins = useSignalValue(pluginsSignal);
  const pluginsLoaded = useSignalValue(pluginsLoadedSignal);
  const { importBTG } = useBTGImport();

  useEffect(() => {
    if (pluginsLoaded) return;
    const ctrl = new AbortController();
    fetchPlugins(ctrl.signal).then((list) => {
      pluginsSignal.value = list;
      pluginsLoadedSignal.value = true;
    });
    return () => ctrl.abort();
  }, [pluginsLoaded]);

  const handleBTGImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleBTGFileInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !onLoadBTG) return;
    const project = await importBTG(file);
    if (!project || project.type !== "studio") return;
    const studioProject = project as BTGStudioProject;
    onLoadBTG(studioProject, studioProject.customFonts);
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
        <MenuItem
          label="New project"
          glyph="⬚"
          onClick={() => { onStartFresh?.(); closeMenu(); }}
        />
        <MenuItem
          label="Import image…"
          glyph="▦"
          onClick={() => { onAddImage(); closeMenu(); }}
        />
        <MenuItem
          label="Adjustment layer"
          glyph="◐"
          onClick={() => { onAddAdjustment(); closeMenu(); }}
        />
        <MenuSep />
        <MenuItem
          label="Back to projects"
          glyph="◂"
          onClick={() => { onBack(); closeMenu(); }}
        />
        <MenuSep />
        <MenuItem label="Open .btg file…" glyph="⌬" onClick={handleBTGImportClick} />
        <MenuItem label="Save as .btg…" glyph="⬢" onClick={handleBTGExport} />
        <MenuSep />
        <MenuItem label="Export png" glyph="◈" shortcut="⌘E" onClick={() => { onExport(); closeMenu(); }} />
        <MenuItem label="Export options…" glyph="⬙" onClick={() => { onExportOptions(); closeMenu(); }} />
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
          label="Undo" glyph="◀" shortcut="⌘Z" disabled={!canUndo}
          onClick={() => { onUndo(); closeMenu(); }}
        />
        <MenuItem
          label="Redo" glyph="◁" shortcut="⌘⇧Z" disabled={!canRedo}
          onClick={() => { onRedo(); closeMenu(); }}
        />
      </MenuDrop>

      <MenuDrop name="view" label="View">
        {ZOOM_PRESETS.map((z) => (
          <MenuItem
            key={z}
            label={`${Math.round(z * 100)}%`}
            glyph="◌"
            checked={Math.abs(zoom - z) < 0.01}
            onClick={() => { onZoomSet(z); closeMenu(); }}
          />
        ))}
        <MenuSep />
        <MenuItem
          label="Fit canvas" glyph="▣"
          onClick={() => { onZoomReset(); closeMenu(); }}
        />
        <MenuSep />
        <MenuItem
          label={dark ? "Switch to light" : "Switch to dark"} glyph="◑"
          onClick={() => { onToggleDark(); closeMenu(); }}
        />
      </MenuDrop>

      <MenuDrop name="help" label="Help">
        <MenuItem
          label="Release notes" glyph="▤"
          onClick={() => { closeMenu(); emitModal({ type: "changelog" }); }}
        />
      </MenuDrop>

      {plugins.length > 0 && (
        <MenuDrop name="plugins" label="Plugins">
          {plugins.map((plugin) => (
            <MenuItem
              key={plugin.slug}
              label={plugin.name}
              glyph="◈"
              onClick={() => { setActivePluginSlug(plugin.slug); closeMenu(); }}
            />
          ))}
        </MenuDrop>
      )}
    </>
  );
};
