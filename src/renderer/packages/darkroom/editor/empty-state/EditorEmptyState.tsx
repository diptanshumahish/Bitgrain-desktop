import React from "react";
import { EmptyStateHeading } from "./EmptyStateHeading";
import { DropFrame } from "./DropFrame";
import { MobilePhotoPicker } from "./MobilePhotoPicker";
import { SampleStrip } from "./SampleStrip";
import { GravityField } from "@bitgrain/ui/motion/gravity-field/GravityField";

interface EditorEmptyStateProps {
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const EditorEmptyState: React.FC<EditorEmptyStateProps> = ({ onUpload }) => (
  <div className="relative w-full h-full overflow-y-auto flex flex-col items-center px-5 py-6 md:px-7 md:pt-10 md:pb-10">
    <GravityField className="absolute inset-0 h-full w-full pointer-events-none [mask-image:radial-gradient(ellipse_at_center,transparent_25%,black_75%)]" />
    <div className="relative z-10 my-auto w-full max-w-2xl flex flex-col items-center">
      <EmptyStateHeading />
      <DropFrame onUpload={onUpload} />
      <MobilePhotoPicker onUpload={onUpload} />
      <SampleStrip />
    </div>
  </div>
);
