export type Declarations = Record<string, string>;

export interface CssRule {
  selector: string;
  declarations: Declarations;
}

const COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
const RULE_PATTERN = /([^{}]+)\{([^{}]*)\}/g;
const SIMPLE_SELECTOR = /^([a-zA-Z][\w-]*)?((?:[.#][\w-]+)*)$/;
const IMPORTANT_PATTERN = /\s*!important\s*$/i;

export const parseDeclarations = (text: string): Declarations => {
  const declarations: Declarations = {};
  for (const part of text.split(";")) {
    const colon = part.indexOf(":");
    if (colon < 0) continue;
    const name = part.slice(0, colon).trim().toLowerCase();
    const value = part.slice(colon + 1).replace(IMPORTANT_PATTERN, "").trim();
    if (name && value) declarations[name] = value;
  }
  return declarations;
};

export const parseStyleSheet = (text: string): CssRule[] => {
  const rules: CssRule[] = [];
  for (const match of text.replace(COMMENT_PATTERN, "").matchAll(RULE_PATTERN)) {
    const declarations = parseDeclarations(match[2]);
    match[1].split(",").map((selector) => selector.trim()).filter(Boolean)
      .forEach((selector) => rules.push({ selector, declarations }));
  }
  return rules;
};

const classListOf = (element: Element): string[] => (element.getAttribute("class") ?? "").split(/\s+/).filter(Boolean);

export const selectorMatches = (element: Element, selector: string): boolean => {
  const match = SIMPLE_SELECTOR.exec(selector);
  if (!match) return false;
  const [, tag, rest] = match;
  if (tag && tag.toLowerCase() !== element.tagName.toLowerCase()) return false;
  const classes = classListOf(element);
  const parts = rest.match(/[.#][\w-]+/g) ?? [];
  if (!tag && parts.length === 0) return false;
  return parts.every((part) =>
    part.startsWith(".") ? classes.includes(part.slice(1)) : element.getAttribute("id") === part.slice(1),
  );
};
