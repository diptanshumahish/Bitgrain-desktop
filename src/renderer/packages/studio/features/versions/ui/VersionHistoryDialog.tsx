import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { Button } from "@bitgrain/ui/components/Button";
import { versionsLoadingSignal, versionsSignal } from "../storage/versions-store";
import { MAX_AUTO_VERSIONS } from "../storage/version-actions";
import { MOD_ALT_KEY } from "../../../editor/shortcut-labels";
import type { VersionHistoryRequest } from "../version-events";
import { VersionRow } from "./VersionRow";
import { VersionDialogFrame } from "./VersionDialogFrame";

interface VersionHistoryDialogProps {
  request: VersionHistoryRequest;
  onClose: () => void;
}

const VersionListEmpty: React.FC<{ loading: boolean }> = ({ loading }) => (
  <p className="py-8 text-center text-[12px] text-[var(--s-text-muted)]">
    {loading ? "Loading versions" : `No versions yet. Save one with ${MOD_ALT_KEY}S, or keep editing and autosaves will appear here.`}
  </p>
);

export const VersionHistoryDialog: React.FC<VersionHistoryDialogProps> = ({ request, onClose }) => {
  const versions = useSignalValue(versionsSignal);
  const loading = useSignalValue(versionsLoadingSignal);

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] text-[var(--s-text-muted)]">{loading ? "Syncing" : `${versions.length} saved`}</span>
      <Button variant="primary" size="xs" onClick={request.onSaveVersion}>Save version</Button>
    </div>
  );

  return (
    <VersionDialogFrame
      title="Version history"
      description={`Named versions stay until you delete them. The latest ${MAX_AUTO_VERSIONS} autosaves are kept.`}
      onClose={onClose}
      footer={footer}
    >
      {versions.length === 0 ? (
        <VersionListEmpty loading={loading} />
      ) : (
        <ul className="flex flex-col">
          {versions.map((version) => (
            <VersionRow key={version.id} version={version} onPreview={request.onPreview} onRestore={request.onRestore} />
          ))}
        </ul>
      )}
    </VersionDialogFrame>
  );
};
