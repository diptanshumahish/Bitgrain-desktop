import React from "react";
import { cloudStateLabel, formatVersionTime, versionDisplayName } from "../version-labels";
import type { ProjectVersion } from "../version-types";
import { confirmDeleteVersion, confirmRestoreVersion, promptRenameVersion } from "./version-row-actions";

interface VersionRowProps {
  version: ProjectVersion;
  onPreview: (version: ProjectVersion) => void;
  onRestore: (version: ProjectVersion) => void;
}

const ACTION_CLASS =
  "h-7 px-2 rounded-md text-[11.5px] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input)] hover:text-[var(--s-text)]";

export const VersionRow: React.FC<VersionRowProps> = ({ version, onPreview, onRestore }) => (
  <li className="flex items-center gap-3 py-2.5 border-b border-[var(--s-border)] last:border-b-0">
    <div className="w-16 h-12 shrink-0 overflow-hidden rounded-md border border-[var(--s-border)] bg-[var(--s-bg-input)] flex items-center justify-center">
      {version.thumbnail && (
        <img src={version.thumbnail} alt="" loading="lazy" className="max-w-full max-h-full object-contain" />
      )}
    </div>
    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
      <span className="text-[12.5px] font-medium truncate">{versionDisplayName(version)}</span>
      <span className="text-[11px] text-[var(--s-text-muted)] truncate">
        {formatVersionTime(version.createdAt)}, {version.auto ? "autosave" : "named"}, {cloudStateLabel(version.cloud).toLowerCase()}
      </span>
    </div>
    <div className="flex items-center gap-0.5 shrink-0">
      <button type="button" className={ACTION_CLASS} onClick={() => onPreview(version)}>Preview</button>
      <button type="button" className={ACTION_CLASS} onClick={() => confirmRestoreVersion(version, onRestore)}>Restore</button>
      <button type="button" className={ACTION_CLASS} onClick={() => promptRenameVersion(version)}>Rename</button>
      <button type="button" className={ACTION_CLASS} onClick={() => confirmDeleteVersion(version)}>Delete</button>
    </div>
  </li>
);
