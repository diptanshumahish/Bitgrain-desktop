import React, { useEffect } from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { StudioDialogShell } from "@bitgrain/ui/dialogs/StudioDialogShell";
import { cleanerEntriesSignal, resetCleaner } from "../store/cleaner-store";
import { CleanerDropZone } from "./CleanerDropZone";
import { CleanedFileRow } from "./CleanedFileRow";

interface MetadataCleanerModalProps {
  onClose: () => void;
}

const DESCRIPTION =
  "Removes the hidden data files carry, like camera and location details, editing history, content credentials and AI source labels. Your pixels stay exactly the same.";

const FOOTNOTE =
  "Anything you export from Bitgrain is already clean, the hidden data of images placed inside your design never makes it into the file. This tool reads file data only, it does not change what is drawn in the image.";

export const MetadataCleanerModal: React.FC<MetadataCleanerModalProps> = ({ onClose }) => {
  const entries = useSignalValue(cleanerEntriesSignal);

  useEffect(() => resetCleaner, []);

  return (
    <StudioDialogShell
      title="Clean image metadata"
      description={DESCRIPTION}
      widthClass="max-w-lg"
      onClose={onClose}
      footer={<p className="text-[11.5px] text-[var(--s-text-muted)]">{FOOTNOTE}</p>}
    >
      <CleanerDropZone />
      {entries.length > 0 && (
        <ul className="mt-3">
          {entries.map((entry) => (
            <CleanedFileRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}
    </StudioDialogShell>
  );
};
