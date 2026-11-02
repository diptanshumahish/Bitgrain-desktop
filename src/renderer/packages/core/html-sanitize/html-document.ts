const HTML_MIME = "text/html";
const DOCUMENT_OPEN = "<!doctype html><html><head></head><body>";
const DOCUMENT_CLOSE = "</body></html>";

export const parseHtmlDocument = (bodyHtml: string): Document =>
  new DOMParser().parseFromString(`${DOCUMENT_OPEN}${bodyHtml}${DOCUMENT_CLOSE}`, HTML_MIME);
