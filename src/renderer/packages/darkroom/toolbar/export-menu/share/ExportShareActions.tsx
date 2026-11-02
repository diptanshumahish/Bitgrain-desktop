import React from "react";
import { Link, Save, Layers, Share2 } from "lucide-react";
import { publishCurrentLook } from "../../../recipe/publish/publish-recipe";
import { ExportOptionRow } from "../ExportOptionRow";

interface ExportShareActionsProps {
  shareState: "idle" | "copied";
  canSaveBtg: boolean;
  onShareImage: () => void;
  onSharePreset: () => void;
  onDownloadBTG: () => void;
  onClose: () => void;
}

const runAndClose = (action: () => void, onClose: () => void): void => {
  action();
  onClose();
};

export const ExportShareActions: React.FC<ExportShareActionsProps> = ({
  shareState,
  canSaveBtg,
  onShareImage,
  onSharePreset,
  onDownloadBTG,
  onClose,
}) => (
  <div className="flex flex-col -mx-2">
    <ExportOptionRow
      icon={Share2}
      title="Share image with its recipe"
      hint="Sends the picture with a link that opens this look"
      onClick={() => runAndClose(onShareImage, onClose)}
    />
    <ExportOptionRow
      icon={Link}
      title={shareState === "copied" ? "Link copied" : "Copy recipe link"}
      hint="Anyone with the link can try this look on their photo"
      onClick={() => runAndClose(onSharePreset, onClose)}
    />
    <ExportOptionRow
      icon={Layers}
      title="Publish to community"
      hint="Adds this look to the public recipes"
      onClick={() => runAndClose(publishCurrentLook, onClose)}
    />
    <ExportOptionRow
      icon={Save}
      title="Save project to edit later"
      hint="Keeps your image and every setting in one file"
      onClick={onDownloadBTG}
      disabled={!canSaveBtg}
    />
  </div>
);
