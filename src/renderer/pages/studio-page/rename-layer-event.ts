const RENAME_LAYER_EVENT = "bg:rename-layer";

export function emitRenameLayer(layerId: string): void {
  document.dispatchEvent(new CustomEvent<string>(RENAME_LAYER_EVENT, { detail: layerId }));
}

export function onRenameLayer(handler: (layerId: string) => void): () => void {
  const listener = (event: Event): void => handler((event as CustomEvent<string>).detail);
  document.addEventListener(RENAME_LAYER_EVENT, listener);
  return () => document.removeEventListener(RENAME_LAYER_EVENT, listener);
}
