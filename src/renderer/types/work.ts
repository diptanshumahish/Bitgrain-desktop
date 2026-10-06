export interface WorkPage {
  id: string;
  name: string;
  layers: unknown[];
  background: string;
  backgroundVar?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  image?: string | null;
  clip?: boolean;
  animation?: import("../data/animation-types").PageAnimation;
}

export interface Work {
  id: string;
  name: string;
  thumbnail: string | null;
  background: string;
  canvasW: number;
  canvasH: number;
  layers: unknown[];
  pages?: WorkPage[];
  image: string | null;
  createdAt: number;
  updatedAt: number;
}
