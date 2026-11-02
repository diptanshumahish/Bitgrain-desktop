import { UNSAFE_STYLE_PATTERN } from "./sanitize-allowlist";

const DECLARATION_SEPARATOR = ";";

const isSafeDeclaration = (declaration: string): boolean => !UNSAFE_STYLE_PATTERN.test(declaration);

export const sanitizeStyle = (style: string): string => {
  if (isSafeDeclaration(style)) return style;
  const kept = style.split(DECLARATION_SEPARATOR).filter(isSafeDeclaration).join(DECLARATION_SEPARATOR);
  return isSafeDeclaration(kept) ? kept : "";
};
