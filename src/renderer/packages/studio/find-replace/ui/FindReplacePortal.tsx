import React from "react";
import { createPortal } from "react-dom";
import { useSignalValue } from "@bitgrain/core/signal";
import { findReplaceOpenSignal } from "../find-replace-state";
import { FindReplacePanel } from "./FindReplacePanel";

export const FindReplacePortal: React.FC = () => {
  const open = useSignalValue(findReplaceOpenSignal);
  if (!open) return null;
  return createPortal(<FindReplacePanel />, document.body);
};
