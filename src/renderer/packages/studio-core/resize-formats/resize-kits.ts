export interface ResizeKit {
  id: string;
  label: string;
  detail: string;
  formatIds: readonly string[];
}

export const RESIZE_KITS: ResizeKit[] = [
  {
    id: "social-kit",
    label: "Social kit",
    detail: "Instagram post and portrait, story, YouTube thumbnail, X post and LinkedIn",
    formatIds: ["instagram-post", "instagram-portrait", "story", "youtube-thumbnail", "twitter-post", "linkedin-square"],
  },
  {
    id: "release-kit",
    label: "Release kit",
    detail: "Album, Apple Music and Amazon covers, Spotify Canvas, a story and an A3 tour poster",
    formatIds: ["album-cover", "apple-cover", "amazon-cover", "spotify-canvas", "story", "a3"],
  },
];
