import React from "react";
import { Frame } from "lucide-react";
import { HeaderIconButton } from "../ui/HeaderIconButton";

interface MatchPageButtonProps {
  onClick: () => void;
}

export const MatchPageButton: React.FC<MatchPageButtonProps> = ({ onClick }) => (
  <HeaderIconButton title="Resize page to this image" onClick={onClick}>
    <Frame size={12} strokeWidth={1.75} />
  </HeaderIconButton>
);
