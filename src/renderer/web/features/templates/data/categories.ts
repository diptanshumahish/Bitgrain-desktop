export const ALL_CATEGORY = "all";

export interface TemplateCategory {
  key: string;
  label: string;
  blurb: string;
  accent: string;
  description: string;
}

export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    key: "poster",
    label: "Posters",
    blurb: "Walls, gigs, announcements",
    accent: "bg-accent-orange",
    description:
      "Loud, printable layouts for walls, gigs, and announcements that need to read from across the room.",
  },
  {
    key: "social",
    label: "Social",
    blurb: "Posts, stories, covers",
    accent: "bg-accent-purple",
    description:
      "Posts, stories, and covers sized for every feed, ready to drop your photos straight in.",
  },
  {
    key: "album",
    label: "Album covers",
    blurb: "Records, singles, mixtapes",
    accent: "bg-accent-lime",
    description:
      "Cover art for records, singles, and mixtapes, built for streaming squares and vinyl alike.",
  },
  {
    key: "wallpaper",
    label: "Wallpapers",
    blurb: "Phones and desktops",
    accent: "bg-accent-yellow",
    description:
      "Backgrounds tuned for phones and desktops, staying crisp at every screen size.",
  },
  {
    key: "invitation",
    label: "Invitations",
    blurb: "Events and parties",
    accent: "bg-accent-purple",
    description:
      "Cards for events and parties, from house shows to weddings, ready to fill in and send.",
  },
  {
    key: "certificate",
    label: "Certificates",
    blurb: "Awards and proof",
    accent: "bg-accent-orange",
    description:
      "Awards, proof, and recognition layouts you can personalise and print in minutes.",
  },
  {
    key: "resume",
    label: "Resumes",
    blurb: "Clean professional layouts",
    accent: "bg-accent-lime",
    description:
      "Clean professional layouts that put your work first and read fast for any recruiter.",
  },
  {
    key: "portfolio",
    label: "Portfolios",
    blurb: "Show the work",
    accent: "bg-accent-yellow",
    description:
      "Pages that show the work, built to let your projects breathe and speak for themselves.",
  },
  {
    key: "pitch-deck",
    label: "Pitch decks",
    blurb: "Slides that land",
    accent: "bg-accent-purple",
    description:
      "Slides that land, with room for the story, the numbers, and a confident close.",
  },
  {
    key: "letterhead",
    label: "Letterheads",
    blurb: "Branded company paper",
    accent: "bg-accent-lime",
    description:
      "Branded company paper for letters, quotes, and notices, set up for A4 and ready to print.",
  },
  {
    key: "menu",
    label: "Menus",
    blurb: "Cafes, bars, kitchens",
    accent: "bg-accent-orange",
    description:
      "Menus for cafes, bars, and kitchens, laid out so every dish and price is easy to find.",
  },
  {
    key: "business-card",
    label: "Business cards",
    blurb: "Front and back",
    accent: "bg-accent-yellow",
    description:
      "Two sided cards that hand over your name, role, and contact details with a little style.",
  },
  {
    key: "flyer",
    label: "Flyers",
    blurb: "Handouts and notices",
    accent: "bg-accent-purple",
    description:
      "Handouts and notice board sheets for classes, sales, services, and lost cats alike.",
  },
  {
    key: "book-cover",
    label: "Book covers",
    blurb: "Novels, guides, ebooks",
    accent: "bg-accent-lime",
    description:
      "Covers for novels, guides, and ebooks that still read clearly as a tiny thumbnail.",
  },
  {
    key: "thumbnail",
    label: "Thumbnails",
    blurb: "Videos and podcasts",
    accent: "bg-accent-orange",
    description:
      "Bold 16:9 thumbnails for videos and podcasts, made to win the click in a crowded feed.",
  },
  {
    key: "banner",
    label: "Banners",
    blurb: "Headers and covers",
    accent: "bg-accent-yellow",
    description:
      "Profile headers, channel art, and email banners sized for the platforms you post on.",
  },
  {
    key: "planner",
    label: "Planners",
    blurb: "Plans, lists, trackers",
    accent: "bg-accent-purple",
    description:
      "Printable planners, checklists, and trackers to keep the week, the budget, and the habits honest.",
  },
  {
    key: "packaging",
    label: "Packaging and labels",
    blurb: "Jars, bottles, tags, stickers",
    accent: "bg-accent-orange",
    description:
      "Labels, sleeves, hang tags, and sticker sheets for small batch products that deserve a proper shelf.",
  },
  {
    key: "app-screenshot",
    label: "App store screenshots",
    blurb: "App Store and Google Play",
    accent: "bg-accent-lime",
    description:
      "Screenshot sets and feature graphics at exact store sizes, so your app page sells the app.",
  },
  {
    key: "business-docs",
    label: "Business documents",
    blurb: "Invoices, quotes, vouchers",
    accent: "bg-accent-yellow",
    description:
      "Invoices, quotes, price lists, and gift vouchers that look as considered as the work you bill for.",
  },
  {
    key: "sports",
    label: "Sports graphics",
    blurb: "Matchday, lineups, scores",
    accent: "bg-accent-purple",
    description:
      "Matchday posts, starting lineups, and full time scores your club can turn around before the final whistle.",
  },
  {
    key: "stream-kit",
    label: "Stream kits",
    blurb: "Panels and stream screens",
    accent: "bg-accent-orange",
    description:
      "Starting soon, be right back, and profile panels that make a channel feel like it has a crew behind it.",
  },
  {
    key: "signage",
    label: "Signs",
    blurb: "Doors, boards, price talkers",
    accent: "bg-accent-lime",
    description:
      "Door signs, sidewalk boards, opening hours, and shelf talkers for the shop floor and the office.",
  },
  {
    key: "ticket",
    label: "Tickets and passes",
    blurb: "Gigs, events, conferences",
    accent: "bg-accent-yellow",
    description:
      "Tickets with tear off stubs, conference passes, and boarding pass invites for anything with a guest list.",
  },
  {
    key: "greeting",
    label: "Greetings",
    blurb: "Festivals, weddings, wishes",
    accent: "bg-accent-purple",
    description:
      "Festival wishes and wedding e-invites sized for WhatsApp, stories, and the family group chat.",
  },
  {
    key: "link-preview",
    label: "Link previews",
    blurb: "Share cards and headers",
    accent: "bg-accent-orange",
    description:
      "Share cards and newsletter headers that make a pasted link look like it was meant to be clicked.",
  },
  {
    key: "recipe-card",
    label: "Recipe cards",
    blurb: "Printable and social",
    accent: "bg-accent-lime",
    description:
      "Printable recipe cards and step by step carousels that are easy to follow with flour on your hands.",
  },
  {
    key: "frame",
    label: "Frames",
    blurb: "Borders and mats",
    accent: "bg-accent-orange",
    description:
      "Borders and mats to wrap around any image you bring, from snapshots to fine prints.",
  },
  {
    key: "id-card",
    label: "ID cards",
    blurb: "Badges and passes",
    accent: "bg-accent-lime",
    description:
      "Badges and passes for teams, events, and members, sized and ready to print.",
  },
  {
    key: "grade-card",
    label: "Grade cards",
    blurb: "Report layouts",
    accent: "bg-accent-purple",
    description:
      "Report layouts for grades, marks, and progress, clear enough for any classroom.",
  },
  {
    key: "grand-opening",
    label: "Grand opening",
    blurb: "Launch announcements",
    accent: "bg-accent-yellow",
    description:
      "Launch announcements that make the first day feel like the event it is.",
  },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  TEMPLATE_CATEGORIES.map((category) => [category.key, category.label]),
);

export function categoryLabel(key: string): string {
  return CATEGORY_LABELS[key] ?? key.replace(/-/g, " ");
}
