import React, { useRef } from "react";
import { WindowDropOverlay } from "./WindowDropOverlay";
import { useWindowImageIntake } from "./use-window-image-intake";

export const ImageIntake: React.FC = () => {
  const overlayRef = useRef<HTMLDivElement>(null);
  useWindowImageIntake(overlayRef);
  return <WindowDropOverlay overlayRef={overlayRef} />;
};
