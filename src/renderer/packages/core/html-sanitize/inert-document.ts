import { parseHtmlDocument } from "./html-document";

let cachedDocument: Document | null = null;

export const inertDocument = (): Document => {
  if (!cachedDocument) cachedDocument = parseHtmlDocument("");
  return cachedDocument;
};
