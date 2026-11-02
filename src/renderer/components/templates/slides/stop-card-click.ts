import type React from "react";

export const stopCardClick = (event: React.MouseEvent): void => {
  event.stopPropagation();
  event.preventDefault();
};
