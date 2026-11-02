import React from "react";
import { useSignalValue } from "@bitgrain/core/signal";
import { workspaceSwitcherSignal, type WorkspaceSwitcherProps } from "./shell-config";

export const ShellWorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = (props) => {
  const renderSwitcher = useSignalValue(workspaceSwitcherSignal);
  return <>{renderSwitcher ? renderSwitcher(props) : null}</>;
};
