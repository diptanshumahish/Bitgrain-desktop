import { createEventChannel } from "@bitgrain/core/events/event-channel";

const STUDIO_COMMAND_EVENT = "bg:studio-command";

type StudioEditCommand = "copy" | "paste" | "duplicate" | "delete" | "select-all";

type StudioInsertCommand = "add-text" | "add-rect" | "add-circle" | "add-line" | "add-image" | "add-adjustment";

type StudioHistoryCommand = "undo" | "redo" | "group" | "ungroup";

type StudioWorkspaceCommand = "export-options" | "resize-formats";

export type StudioCommand = StudioEditCommand | StudioInsertCommand | StudioHistoryCommand | StudioWorkspaceCommand;

const studioCommandChannel = createEventChannel<StudioCommand>(STUDIO_COMMAND_EVENT);

export const emitStudioCommand = studioCommandChannel.emit;
export const onStudioCommand = studioCommandChannel.on;

