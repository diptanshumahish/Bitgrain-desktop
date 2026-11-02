import { createEventChannel } from "@bitgrain/core/events/event-channel";

const EXPORT_DIALOG_KEY = "bg:image-export-dialog";

const exportDialogChannel = createEventChannel<void>(EXPORT_DIALOG_KEY);

export const emitExportDialog = (): void => exportDialogChannel.emit();
export const onExportDialog = exportDialogChannel.on;
