export const readCssToken = (element: Element, token: string): string =>
  getComputedStyle(element).getPropertyValue(token).trim();
