import { useEditorShortcuts } from "./session/hooks/use-editor-shortcuts";

// Desktop keeps only the editor shortcuts from the web session hooks. No image is
// auto-restored (each darkroom tab is its own blank instance; documents reopen from
// the Home library), there is no beforeunload guard (it would silently block window
// close in Electron; instances autosave), the home tour is not mounted, and recipes
// never arrive through the URL.
export const useHomeInit = (): void => {
  useEditorShortcuts();
};
