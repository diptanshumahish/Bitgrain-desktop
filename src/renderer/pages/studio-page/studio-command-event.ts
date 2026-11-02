const STUDIO_COMMAND_EVENT = "bg:studio-command";

export type StudioCommand = "copy" | "paste" | "duplicate" | "delete" | "select-all";

export function emitStudioCommand(command: StudioCommand): void {
  document.dispatchEvent(new CustomEvent<StudioCommand>(STUDIO_COMMAND_EVENT, { detail: command }));
}

export function onStudioCommand(handler: (command: StudioCommand) => void): () => void {
  const listener = (event: Event): void => handler((event as CustomEvent<StudioCommand>).detail);
  document.addEventListener(STUDIO_COMMAND_EVENT, listener);
  return () => document.removeEventListener(STUDIO_COMMAND_EVENT, listener);
}
