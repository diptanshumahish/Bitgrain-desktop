import React from "react";
import { Link, Save, Layers, Share2 } from "lucide-react";
import { publishCurrentLook } from "../../../pages/recipes-page/publish-recipe";

interface ExportShareActionsProps {
  shareState: "idle" | "copied";
  canSaveBtg: boolean;
  onShareImage: () => void;
  onSharePreset: () => void;
  onDownloadBTG: () => void;
  onClose: () => void;
}

const ICON_SIZE = 11;
const ICON_STROKE = 1.6;
const ACTION_CLASS =
  "flex items-center gap-2 px-2 h-7 rounded-md text-[12px] text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors";

export const ExportShareActions: React.FC<ExportShareActionsProps> = ({
  shareState,
  canSaveBtg,
  onShareImage,
  onSharePreset,
  onDownloadBTG,
  onClose,
}) => (
  <>
    <button
      onClick={() => {
        onShareImage();
        onClose();
      }}
      className={`${ACTION_CLASS} font-medium text-[var(--s-text)]`}
    >
      <Share2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      share image with its recipe
    </button>

    <button
      onClick={() => {
        onSharePreset();
        onClose();
      }}
      className={`flex items-center gap-2 px-2 h-7 rounded-md text-[12px] transition-colors ${
        shareState === "copied"
          ? "text-[var(--s-accent)]"
          : "text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)]"
      }`}
    >
      <Link size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      {shareState === "copied" ? "link copied" : "copy recipe link"}
    </button>

    <button
      onClick={() => {
        publishCurrentLook();
        onClose();
      }}
      className={ACTION_CLASS}
    >
      <Layers size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      publish to community
    </button>

    <button
      onClick={onDownloadBTG}
      disabled={!canSaveBtg}
      className={`${ACTION_CLASS} disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent`}
    >
      <Save size={ICON_SIZE} strokeWidth={ICON_STROKE} />
      save project to edit later
    </button>

  </>
);
