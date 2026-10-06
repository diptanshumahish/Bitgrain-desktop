import React from "react";
import { Magnet, Ruler, RotateCw, FlipHorizontal, FlipVertical, ScanSearch } from "lucide-react";

interface StageToolbarProps {
  dark: boolean;
  snapToEdges: boolean;
  showGuides: boolean;
  onToggleSnap: () => void;
  onToggleGuides: () => void;
  onDetect: () => void;
  onRotate: () => void;
  onFlipHorizontal: () => void;
  onFlipVertical: () => void;
}

interface ToolbarAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  active?: boolean;
}

export const StageToolbar: React.FC<StageToolbarProps> = ({
  dark,
  snapToEdges,
  showGuides,
  onToggleSnap,
  onToggleGuides,
  onDetect,
  onRotate,
  onFlipHorizontal,
  onFlipVertical,
}) => {
  const actions: ToolbarAction[] = [
    { key: "detect", label: "find the surface again", icon: <ScanSearch size={15} strokeWidth={2} />, onClick: onDetect },
    { key: "snap", label: "snap corners to edges in the photo", icon: <Magnet size={15} strokeWidth={2} />, onClick: onToggleSnap, active: snapToEdges },
    { key: "guides", label: "show perspective guides", icon: <Ruler size={15} strokeWidth={2} />, onClick: onToggleGuides, active: showGuides },
    { key: "rotate", label: "rotate artwork a quarter turn", icon: <RotateCw size={15} strokeWidth={2} />, onClick: onRotate },
    { key: "flip-h", label: "mirror artwork left to right", icon: <FlipHorizontal size={15} strokeWidth={2} />, onClick: onFlipHorizontal },
    { key: "flip-v", label: "mirror artwork top to bottom", icon: <FlipVertical size={15} strokeWidth={2} />, onClick: onFlipVertical },
  ];

  const idleClass = dark ? "border-white/10 text-zinc-400 hover:border-white/25" : "border-zinc-200 text-zinc-500 hover:border-zinc-400";
  const activeClass = dark ? "border-[#820000] text-white" : "border-[#820000] text-zinc-900";

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {actions.map((action) => (
        <button
          key={action.key}
          onClick={action.onClick}
          title={action.label}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border ${action.active ? activeClass : idleClass}`}
        >
          {action.icon}
        </button>
      ))}
    </div>
  );
};
