import type { NavigateFunction } from "react-router-dom";

const EXTERNAL_LINK_PATTERN = /^https?:\/\//;

export const followLink = (to: string, navigate: NavigateFunction): void => {
  if (EXTERNAL_LINK_PATTERN.test(to)) {
    window.location.assign(to);
    return;
  }
  navigate(to);
};
