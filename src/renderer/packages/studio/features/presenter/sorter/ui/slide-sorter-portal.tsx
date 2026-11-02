import React from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { slideSorterOpenSignal } from "../state/slide-sorter-store";
import { SlideSorterOverlay } from "./slide-sorter-overlay";

export const SlideSorterPortal: React.FC = () => {
  const open = useSignalValue(slideSorterOpenSignal);
  if (!open) return null;
  return createPortal(<SlideSorterOverlay />, document.body);
};
