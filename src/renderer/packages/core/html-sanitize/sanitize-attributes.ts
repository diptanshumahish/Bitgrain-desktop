import { DATA_ATTRIBUTE_PATTERN, FONT_ATTRIBUTES, FONT_TAG, GLOBAL_ATTRIBUTES } from "./sanitize-allowlist";
import { sanitizeStyle } from "./sanitize-style";

const STYLE_ATTRIBUTE = "style";

const isAllowedAttribute = (tag: string, name: string): boolean =>
  GLOBAL_ATTRIBUTES.has(name) || DATA_ATTRIBUTE_PATTERN.test(name) || (tag === FONT_TAG && FONT_ATTRIBUTES.has(name));

const copyAttribute = (target: Element, name: string, value: string): void => {
  if (name !== STYLE_ATTRIBUTE) {
    target.setAttribute(name, value);
    return;
  }
  const style = sanitizeStyle(value);
  if (style) target.setAttribute(name, style);
};

export const copySafeAttributes = (source: Element, target: Element): void => {
  for (const attribute of Array.from(source.attributes)) {
    const name = attribute.name.toLowerCase();
    if (isAllowedAttribute(target.localName, name)) copyAttribute(target, name, attribute.value);
  }
};
