export interface Point {
  x: number;
  y: number;
}

export const pointInElement = (element: Element, event: { clientX: number; clientY: number }): Point => {
  const rect = element.getBoundingClientRect();
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};
