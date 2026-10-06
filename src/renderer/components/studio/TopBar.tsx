import React, { useRef, useEffect } from "react";
import { Scaling, Shirt } from "lucide-react";
import { useAnimationMode } from "../../store/animation-editor-store";
import type { TemplateDef, Layer } from "../../data/studioTypes";
import type { TextStyleVariable, NumberToken } from "../../data/design-kit-types";
import { activeMenuSignal } from "./ui/menu-signal";
import { TopBarChrome } from "./topbar/TopBarChrome";
import { TopBarProject } from "./topbar/TopBarProject";
import { AnimateModeToggle } from "./topbar/AnimateModeToggle";
import { SaveStatus } from "./topbar/SaveStatus";
import { TopBarDesignKit } from "./topbar/TopBarDesignKit";

// The studio tool strip. File/Edit/View/Help now live in the native OS menu bar
// (their in-window duplicates were removed), and Export/Present live in the app
// title bar. This strip keeps only the document name, canvas actions
// (resize/mockup), animate toggle, save status, design kit, and undo/redo/theme.
interface TopBarProps {
  template: TemplateDef;
  dark: boolean;
  canUndo: boolean;
  canRedo: boolean;
  workName?: string;
  onRenameWork: (name: string) => void;
  onToggleAnimate: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onToggleDark: () => void;
  onResize?: () => void;
  onMockup?: () => void;
  selectedLayer: Layer | null;
  selectedIds: string[];
  onApplyKitColor: (varId: string, hex: string) => void;
  onApplyKitTextStyle: (style: TextStyleVariable) => void;
  onApplyKitNumber: (token: NumberToken) => void;
  onVariableColorChange: (varId: string, hex: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  template, dark, canUndo, canRedo, workName, onRenameWork, onToggleAnimate,
  onUndo, onRedo, onToggleDark, onResize, onMockup,
  selectedLayer, selectedIds,
  onApplyKitColor, onApplyKitTextStyle, onApplyKitNumber, onVariableColorChange,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const animateMode = useAnimationMode();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!barRef.current?.contains(e.target as Node)) {
        activeMenuSignal.value = null;
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={barRef}
      className="h-10 flex items-center px-2 border-b border-[var(--s-border)] bg-[var(--s-bg-panel)] shrink-0 font-editorial relative z-50"
    >
      {/* Left: mode toggle */}
      <div className="flex flex-1 items-center gap-1 min-w-0">
        <AnimateModeToggle active={animateMode} onToggle={onToggleAnimate} />
      </div>

      {/* Center: document name + canvas actions */}
      <div className="flex shrink-0 items-center gap-1">
        <TopBarProject
          workName={workName}
          canvasWidth={template.width}
          canvasHeight={template.height}
          onRename={onRenameWork}
        />
        {onResize && (
          <button
            onClick={onResize}
            title="Resize to other formats"
            className="ml-1 w-7 h-7 flex items-center justify-center rounded text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors shrink-0"
          >
            <Scaling size={15} strokeWidth={1.75} />
          </button>
        )}
        {onMockup && (
          <button
            onClick={onMockup}
            title="Place artwork on a photo"
            className="w-7 h-7 flex items-center justify-center rounded text-[var(--s-text-muted)] hover:bg-[var(--s-bg-input-hover)] hover:text-[var(--s-text)] transition-colors shrink-0"
          >
            <Shirt size={15} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Right: save status, design kit, undo/redo/theme */}
      <div className="flex flex-1 items-center justify-end gap-1 min-w-0">
        <SaveStatus />
        <TopBarDesignKit
          selectedLayer={selectedLayer}
          selectedLayerIds={selectedIds}
          onApplyKitColor={onApplyKitColor}
          onApplyKitTextStyle={onApplyKitTextStyle}
          onApplyKitNumber={onApplyKitNumber}
          onVariableColorChange={onVariableColorChange}
        />
        <div className="w-px h-4 bg-[var(--s-border)] mx-1" />
        <TopBarChrome
          canUndo={canUndo}
          canRedo={canRedo}
          dark={dark}
          onUndo={onUndo}
          onRedo={onRedo}
          onToggleDark={onToggleDark}
        />
      </div>
    </div>
  );
};
