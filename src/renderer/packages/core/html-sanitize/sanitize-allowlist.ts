export const ALLOWED_TAGS: ReadonlySet<string> = new Set([
  "span", "b", "strong", "i", "em", "u", "ins", "s", "strike", "del",
  "br", "div", "p", "ul", "ol", "li", "sub", "sup", "font",
]);

export const DROPPED_TAGS: ReadonlySet<string> = new Set([
  "script", "style", "template", "noscript", "iframe", "frame", "frameset",
  "object", "embed", "applet", "img", "picture", "video", "audio", "source",
  "track", "canvas", "svg", "math", "link", "meta", "base", "title", "form",
  "input", "button", "textarea", "select", "option", "xmp", "noembed",
  "noframes", "plaintext",
]);

export const GLOBAL_ATTRIBUTES: ReadonlySet<string> = new Set(["style", "dir", "lang"]);

export const FONT_TAG = "font";

export const FONT_ATTRIBUTES: ReadonlySet<string> = new Set(["color", "face", "size"]);

export const DATA_ATTRIBUTE_PATTERN = /^data-[a-z0-9_.-]+$/;

export const UNSAFE_STYLE_PATTERN =
  /url\s*\(|image-set|image\s*\(|cross-fade|src\s*\(|expression\s*\(|javascript:|@import|behavior\s*:|-moz-binding|\\/i;
