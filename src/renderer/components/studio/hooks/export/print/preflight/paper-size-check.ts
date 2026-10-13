import { describePrintSize, resolvePrintSize } from "../print-geometry";
import type { PreflightInput, PreflightItem } from "./preflight-types";

const PASS_ID = "paper-size-pass";

const checkPage = (page: PreflightInput["pages"][number]): PreflightItem | null => {
  const size = resolvePrintSize(page.width, page.height);
  if (size.paperName) return null;
  return {
    id: `paper-size-${page.id}`,
    level: "info",
    message: `${page.name} is not a standard paper size, so it prints at ${describePrintSize(size)} at 300 dpi.`,
  };
};

export const checkPaperSizes = (input: PreflightInput): PreflightItem[] => {
  const issues = input.pages.map(checkPage).filter((item): item is PreflightItem => item !== null);
  if (issues.length > 0) return issues;
  return [{ id: PASS_ID, level: "pass", message: "Every page matches a standard paper size." }];
};
