const HTML_ESCAPES: Readonly<Record<string, string>> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

const ESCAPABLE_PATTERN = /[&<>"']/g;

export const escapeHtml = (text: string): string =>
  text.replace(ESCAPABLE_PATTERN, (char) => HTML_ESCAPES[char] ?? char);
