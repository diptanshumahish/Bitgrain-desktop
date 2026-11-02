export interface CuratedTemplate {
  id: string;
  name: string;
  thumbnail: string;
  width: number;
  height: number;
}

const THUMBNAIL_BASE = "https://api.bitgrain.app/api/thumbnails/";

export const curatedThumbnailUrl = (template: CuratedTemplate): string => `${THUMBNAIL_BASE}${template.thumbnail}`;

export const CURATED_TEMPLATES: CuratedTemplate[] = [
  { id: "posterlad-arc", name: "Arc", thumbnail: "3570c6fb388df518ab41d3ee3d67820a7cd512178860bfdf5749ab35d3b0ea68", width: 420, height: 594 },
  { id: "minimal-bauhaus", name: "Bauhaus Minimal", thumbnail: "25bb681568d3adfd163c7c7748372532776497016519ca2da3d3e504ce364801", width: 420, height: 594 },
  { id: "taste-of-new-year-nianhua-cookbook-cover", name: "Taste of New Year cookbook cover", thumbnail: "6a147e626011f623645217376652487d8af950784ece791e91ada03dde89d738", width: 1200, height: 1800 },
  { id: "suraj-dada-madhubani-picture-book-cover", name: "Suraj Dada picture book cover", thumbnail: "672d4b6169e3da9d47d91c4f6a113fd18baab23dfcc99804e92ca73a00c0d911", width: 1200, height: 1800 },
  { id: "midnight-jazz-concert-poster", name: "Midnight Jazz concert poster", thumbnail: "32f494c5028a2586d8b2765dbf28a979ffcfe7d9c676faae517493118c91dd80", width: 1200, height: 1697 },
  { id: "lunar-new-year-coin-greeting", name: "Lunar New Year greeting", thumbnail: "01b410094aee35f66b1dbd64302992d602c44d8f11d050d70a997e546de2c11c", width: 1080, height: 1350 },
  { id: "juni-no-yoru-jazz-era-typographic-short-stories-cover", name: "Juni no Yoru short stories cover", thumbnail: "efea98d72c368a184fc32f36bf33e400fa933a230685a65c7e67e8c4237268a3", width: 1200, height: 1800 },
  { id: "lantern-lane-night-market-weekly-flyers", name: "Lantern Lane night market flyer", thumbnail: "ba63067c092439b98b5044227f9f907744e4e9d662b1f14606ed3ba77f4fe4e5", width: 1080, height: 1350 },
  { id: "shab-e-yalda-pomegranate-night-invitation", name: "Shab-e Yalda invitation", thumbnail: "b5ffa57b809dacaaf8e5073b9b511a77a87c92c656cb3ac8b71e8d0ca6dba518", width: 1080, height: 1350 },
  { id: "midnight-noodles-cookbook-cover", name: "Midnight Noodles cookbook cover", thumbnail: "ae952e7eef9cf6c59af2ba43716e79629a4a17ef3b155e0ef2b596c6df75250f", width: 1240, height: 1754 },
  { id: "synthwave-night-drive-album-cover", name: "Night Drive album cover", thumbnail: "389f5f867a110518af255c58b1872b290d6c1a1d63a3ec7e5ba655401eb09677", width: 1400, height: 1400 },
  { id: "posterlad-origami", name: "Origami", thumbnail: "870320c4374ad60cb938d1487b2846a5e241caf416c7b5f00db9da3d6e25aff4", width: 420, height: 594 },
  { id: "parol-lights-simbang-gabi-christmas-card", name: "Parol Lights Christmas card", thumbnail: "46a3227553bbd026376b3a084964b9aad315fcda33622237351334fa9834e88c", width: 1080, height: 1350 },
  { id: "northbay-partners-diwali-corporate-e-card", name: "Diwali e-card", thumbnail: "fbba6430f6973d302b9efaab4899bb8afd152a15f026dad695635f42fcdafe2c", width: 1200, height: 1200 },
  { id: "haus-reiter-concrete-poetry-poster", name: "Concrete Poetry poster", thumbnail: "d21527385bce6b44c30d6a2bcd3b66566edce4d997cbb91dccc29720166c2237", width: 1240, height: 1754 },
  { id: "hollow-light-series-launch-digital-ad", name: "Hollow Light launch ad", thumbnail: "f96c038f8da4ff1518d125ae9308633d943a4951d5eaac6b4ebe117e2dcae622", width: 1080, height: 1920 },
  { id: "mara-quell-night-songs-tour-poster", name: "Night Songs tour poster", thumbnail: "74967909f67e0896a6e73ec5ae8a491af3211f508c424bfd2e0fd4fc364d0910", width: 1240, height: 1754 },
  { id: "mahua-nights-gond-bilingual-stories-cover", name: "Mahua Nights stories cover", thumbnail: "7eb0eb76f978dc2d5239b548639c336c2737b42888c30d34eba6e90f74a1ecd9", width: 1200, height: 1800 },
  { id: "brutal-season-architecture-film-festival-poster", name: "Brutal Season film festival poster", thumbnail: "c438d3a77bbf95ad3bff937def7085dfb888c10926d65fab26bae40da4ac3eee", width: 1080, height: 1528 },
  { id: "where-the-snake-sleeps-gond-coil-memoir-cover", name: "Where the Snake Sleeps memoir cover", thumbnail: "16aae3bc4df2fdd4d7ff946fe1649284316d825c76b7ca0acd70bf01e417aaf4", width: 1200, height: 1800 },
  { id: "night-swim-club-poster", name: "Night Swim Club poster", thumbnail: "c5879878035a4f219fd0445cefea4fb7cd58f1fa8409b72a542ddd6959ca482c", width: 1240, height: 1754 },
  { id: "neue-form-exhibition-poster", name: "Neue Form exhibition poster", thumbnail: "cb43060d35768b40024006c83292c31551f432ec8b0c961153511c7812e5bb1d", width: 1240, height: 1754 },
  { id: "quiet-hours-lo-fi-album-cover", name: "Quiet Hours album cover", thumbnail: "0dfcd75e215b2f1bb63877eb3a3f20ecce6cde5e3a288f3f693725344c2174fc", width: 1400, height: 1400 },
  { id: "kestrel-basin-wpa-park-poster", name: "Kestrel Basin park poster", thumbnail: "10968b298d4daf297785fc5fdefeaaf5996143d7a2e7e46cab3cfc7fea6c7f25", width: 1000, height: 1414 },
  { id: "porch-light-festival-lineup-post", name: "Porch Light festival lineup", thumbnail: "a32283cdac43560019ddfe255f3210c7aa65ec8e7a2d24c84c03583aefadea11", width: 1080, height: 1350 },
  { id: "the-hidden-market-flyer", name: "Hidden Market flyer", thumbnail: "4ad32a4ad0213cf2ff7383cd5494533eeb3d7bd64085847fe97f6714f2e2db7a", width: 1080, height: 1350 },
  { id: "tiger-and-magpie-minhwa-folk-tales-cover", name: "Tiger and Magpie folk tales cover", thumbnail: "bc9a7a7260c4de5edd4471cfd2b55c74b6aa7f22ec660e5e341e7e8f4a3c07fd", width: 1200, height: 1800 },
  { id: "neko-to-kyusu-showa-picture-book-cover", name: "Neko to Kyusu picture book cover", thumbnail: "684d76c77790df24567fb89cd0458fd07cf6ea6925c5631d810a36ddcca015e1", width: 1200, height: 1800 },
  { id: "the-madder-tree-kalamkari-novel-cover", name: "The Madder Tree novel cover", thumbnail: "7e6b7ac30ef5e7833f73d3e792fb4cab821daa4683f77cfe06dc92e737873d94", width: 1200, height: 1800 },
  { id: "seed-abs-bauhaus-block", name: "Bauhaus Block", thumbnail: "ec4258aa9bf36e2a09c375d26c975598eb085a26c4e834ae62f650a460a1f03a", width: 1080, height: 1350 },
];

export const LIBRARY_ROWS: CuratedTemplate[][] = [
  CURATED_TEMPLATES.slice(0, 10),
  CURATED_TEMPLATES.slice(10, 20),
  CURATED_TEMPLATES.slice(20, 30),
];
