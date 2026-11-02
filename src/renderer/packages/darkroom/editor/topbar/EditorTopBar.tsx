import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ShellWorkspaceSwitcher } from "@bitgrain/ui/shell/ShellWorkspaceSwitcher";
import { ToolTopBar } from "@bitgrain/ui/shell/ToolTopBar";
import { useHubPath } from "@bitgrain/ui/shell/shell-config";
import { TopBarButton } from "@bitgrain/ui/components/TopBarButton";
import { TopBarImageInfo } from "./TopBarImageInfo";
import { TopBarHistory } from "./TopBarHistory";
import { TopBarExportButton } from "./TopBarExportButton";
import { TopBarMoreButton } from "./TopBarMoreButton";
import { TopBarOpenPhoto } from "./TopBarOpenPhoto";

interface EditorTopBarProps {
  hasImage: boolean;
  onToggleCompare: () => void;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imageAccept: string;
}

const Divider: React.FC = () => <div className="w-px h-4 bg-[var(--s-border)] mx-1.5" />;

export const EditorTopBar: React.FC<EditorTopBarProps> = ({ hasImage, onToggleCompare, onImageUpload, imageAccept }) => {
  const navigate = useNavigate();
  const hubPath = useHubPath();
  return (
    <ToolTopBar
      className="hidden md:grid"
      left={(
        <>
          <ShellWorkspaceSwitcher label="Photo effects" />
          <TopBarButton label="Back to hub" onClick={() => navigate(hubPath)}>
            <ArrowLeft size={14} strokeWidth={1.75} />
          </TopBarButton>
          <Divider />
          <TopBarImageInfo />
        </>
      )}
      center={hasImage && <TopBarHistory onToggleCompare={onToggleCompare} />}
      right={(
        <>
          <TopBarOpenPhoto onImageUpload={onImageUpload} imageAccept={imageAccept} />
          <TopBarMoreButton hasImage={hasImage} />
          <TopBarExportButton disabled={!hasImage} />
        </>
      )}
    />
  );
};
