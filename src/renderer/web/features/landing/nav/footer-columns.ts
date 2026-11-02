import { EFFECT_LINKS, FOOTER_LINKS, FREE_TOOL_LINKS, PRODUCT_LINKS, type FooterLink } from "./footer-links";

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

const pickLinks = (paths: string[]): FooterLink[] =>
  FOOTER_LINKS.filter((link) => paths.includes(link.to));

export const FOOTER_COLUMNS: FooterColumn[] = [
  { title: "Make", links: pickLinks(["/editor", "/studio", "/video", "/template-gallery"]) },
  { title: "Products", links: PRODUCT_LINKS },
  { title: "Learn", links: pickLinks(["/docs", "/blog", "/showcase", "/recipes", "/mcp", "/pricing"]) },
  { title: "Free tools", links: FREE_TOOL_LINKS },
  { title: "Effects", links: EFFECT_LINKS },
  { title: "Bitgrain", links: pickLinks(["/about", "/contact", "/support"]) },
];
