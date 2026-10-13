import { createContext } from "react";

export interface PopoverBack {
  label: string;
  onBack: () => void;
}

export const PopoverBackContext = createContext<PopoverBack | null>(null);
