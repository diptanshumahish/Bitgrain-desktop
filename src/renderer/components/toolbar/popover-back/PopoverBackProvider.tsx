import React from "react";
import { PopoverBackContext } from "./popover-back-context";

interface PopoverBackProviderProps {
  label: string;
  onBack: () => void;
  children: React.ReactNode;
}

export const PopoverBackProvider: React.FC<PopoverBackProviderProps> = ({ label, onBack, children }) => (
  <PopoverBackContext.Provider value={{ label, onBack }}>{children}</PopoverBackContext.Provider>
);
