interface NavLink {
  to: string;
  label: string;
  description: string;
}

export const NAV_LINKS: NavLink[] = [
  { to: "/editor", label: "Photo effects", description: "Develop photos and stack print effects" },
  { to: "/studio", label: "Design studio", description: "Posters, covers, posts and decks" },
  { to: "/video", label: "Video", description: "Cut video and animate stills" },
  { to: "/template-gallery", label: "Templates", description: "Editable starting points" },
  { to: "/mcp", label: "MCP", description: "Use Bitgrain from Claude" },
  { to: "/pricing", label: "Pricing", description: "Free tier and Pro" },
  { to: "/docs", label: "Docs", description: "How every tool works" },
  { to: "/blog", label: "Blog", description: "Notes on craft and releases" },
];

export const SIGNED_IN_HOME = "/hello";
export const SIGN_IN_PATH = "/sign-in";
export const PRIMARY_TOOL_PATH = "/studio";
