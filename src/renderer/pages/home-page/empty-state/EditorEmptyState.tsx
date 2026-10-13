import React, { useRef } from "react";
import { EmptyStateHeading } from "./EmptyStateHeading";
import { DropFrame } from "./DropFrame";
import { SampleStrip } from "./SampleStrip";
import { WindowDropOverlay } from "./WindowDropOverlay";
import { useWindowImageIntake } from "./use-window-image-intake";

interface EditorEmptyStateProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditorEmptyState: React.FC<EditorEmptyStateProps> = ({ onUpload }) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  useWindowImageIntake(overlayRef);

  return (
    <div className="relative w-full h-full overflow-y-auto flex flex-col items-center px-7 pt-20 pb-44 md:pb-32">
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(var(--s-border)_1px,transparent_1.5px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_75%)]"
      />
      <div className="relative z-10 my-auto w-full max-w-2xl flex flex-col items-center">
        <EmptyStateHeading />
        <DropFrame onUpload={onUpload} />
        <SampleStrip />
      </div>
      <WindowDropOverlay overlayRef={overlayRef} />
    </div>
  );
};
