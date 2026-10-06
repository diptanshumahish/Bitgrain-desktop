const PEN_BODY =
  "%3Cpath d='M12 19l7-7 3 3-7 7-3-3z'/%3E" +
  "%3Cpath d='M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z'/%3E" +
  "%3Cpath d='M2 2l7.586 7.586'/%3E" +
  "%3Ccircle cx='11' cy='11' r='2'/%3E";

const SVG_OPEN =
  "%3Csvg xmlns='http://www.w3.org/2000/svg' width='22' height='22' viewBox='0 0 24 24' fill='white' stroke='black' stroke-width='1.5' stroke-linejoin='round'%3E";

// Pen with a hollow nib — used when creating a new point on a segment.
export const PEN_CURSOR =
  `url("data:image/svg+xml,${SVG_OPEN}${PEN_BODY}%3C/svg%3E") 2 2, crosshair`;

// Pen with a filled accent node at the nib — used when dragging an existing point.
export const DRAG_NODE_CURSOR =
  `url("data:image/svg+xml,${SVG_OPEN}${PEN_BODY}%3Crect x='0' y='0' width='5.5' height='5.5' rx='1.5' fill='%23820000' stroke='white' stroke-width='1'/%3E%3C/svg%3E") 2 2, grab`;
