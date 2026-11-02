export const WORLD_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;700;900&family=Shippori+Mincho:wght@400;700;800&family=Zen+Antique&family=Zen+Old+Mincho:wght@400;700;900&family=Kaisei+Decol:wght@400;700&family=Yuji+Syuku&family=Yuji+Mai&family=Hina+Mincho&family=Zen+Kaku+Gothic+New:wght@400;700;900&family=Klee+One:wght@400;600&family=Potta+One&family=Reggae+One&family=Shippori+Antique&family=Zen+Maru+Gothic:wght@400;700&family=Ma+Shan+Zheng&family=Zhi+Mang+Xing&family=Liu+Jian+Mao+Cao&family=Long+Cang&family=ZCOOL+XiaoWei&family=ZCOOL+QingKe+HuangYou&family=Noto+Serif+SC:wght@400;700;900&family=Noto+Serif+TC:wght@400;700;900&family=LXGW+WenKai+TC:wght@400;700&family=Nanum+Myeongjo:wght@400;700;800&family=Gowun+Batang:wght@400;700&family=Song+Myung&family=Hahmlet:wght@300..900&family=Nanum+Brush+Script&family=Do+Hyeon&family=Chonburi&family=Pridi:wght@300;400;600;700&family=Mitr:wght@300..700&family=Trirong:wght@300;400;600;700&family=Amiri:wght@400;700&family=Reem+Kufi:wght@400..700&family=Aref+Ruqaa:wght@400;700&family=Lalezar&family=El+Messiri:wght@400..700&family=Frank+Ruhl+Libre:wght@300..900&family=Suez+One&family=Noto+Serif+Display:wght@400;700&family=Noto+Sans+Ethiopic:wght@400;700&family=Noto+Serif+Armenian:wght@400;700&family=Noto+Serif+Georgian:wght@400;700&display=swap";

interface WorldFont {
  label: string;
  value: string;
  group: string;
}

export const WORLD_FONT_FAMILIES: WorldFont[] = [
  { label: "Noto Serif JP", value: "'Noto Serif JP', serif", group: "Japanese" },
  { label: "Shippori Mincho", value: "'Shippori Mincho', serif", group: "Japanese" },
  { label: "Zen Antique", value: "'Zen Antique', serif", group: "Japanese" },
  { label: "Zen Old Mincho", value: "'Zen Old Mincho', serif", group: "Japanese" },
  { label: "Kaisei Decol", value: "'Kaisei Decol', serif", group: "Japanese" },
  { label: "Yuji Syuku", value: "'Yuji Syuku', serif", group: "Japanese" },
  { label: "Yuji Mai", value: "'Yuji Mai', serif", group: "Japanese" },
  { label: "Hina Mincho", value: "'Hina Mincho', serif", group: "Japanese" },
  { label: "Zen Kaku Gothic New", value: "'Zen Kaku Gothic New', sans-serif", group: "Japanese" },
  { label: "Klee One", value: "'Klee One', cursive", group: "Japanese" },
  { label: "Potta One", value: "'Potta One', cursive", group: "Japanese" },
  { label: "Reggae One", value: "'Reggae One', cursive", group: "Japanese" },
  { label: "Shippori Antique", value: "'Shippori Antique', sans-serif", group: "Japanese" },
  { label: "Zen Maru Gothic", value: "'Zen Maru Gothic', sans-serif", group: "Japanese" },
  { label: "Ma Shan Zheng", value: "'Ma Shan Zheng', cursive", group: "Chinese" },
  { label: "Zhi Mang Xing", value: "'Zhi Mang Xing', cursive", group: "Chinese" },
  { label: "Liu Jian Mao Cao", value: "'Liu Jian Mao Cao', cursive", group: "Chinese" },
  { label: "Long Cang", value: "'Long Cang', cursive", group: "Chinese" },
  { label: "ZCOOL XiaoWei", value: "'ZCOOL XiaoWei', serif", group: "Chinese" },
  { label: "ZCOOL QingKe HuangYou", value: "'ZCOOL QingKe HuangYou', sans-serif", group: "Chinese" },
  { label: "Noto Serif SC", value: "'Noto Serif SC', serif", group: "Chinese" },
  { label: "Noto Serif TC", value: "'Noto Serif TC', serif", group: "Chinese" },
  { label: "LXGW WenKai TC", value: "'LXGW WenKai TC', cursive", group: "Chinese" },
  { label: "Nanum Myeongjo", value: "'Nanum Myeongjo', serif", group: "Korean" },
  { label: "Gowun Batang", value: "'Gowun Batang', serif", group: "Korean" },
  { label: "Song Myung", value: "'Song Myung', serif", group: "Korean" },
  { label: "Hahmlet", value: "'Hahmlet', serif", group: "Korean" },
  { label: "Nanum Brush Script", value: "'Nanum Brush Script', cursive", group: "Korean" },
  { label: "Do Hyeon", value: "'Do Hyeon', sans-serif", group: "Korean" },
  { label: "Chonburi", value: "'Chonburi', serif", group: "Thai" },
  { label: "Pridi", value: "'Pridi', serif", group: "Thai" },
  { label: "Mitr", value: "'Mitr', sans-serif", group: "Thai" },
  { label: "Trirong", value: "'Trirong', serif", group: "Thai" },
  { label: "Amiri", value: "'Amiri', serif", group: "Arabic" },
  { label: "Reem Kufi", value: "'Reem Kufi', sans-serif", group: "Arabic" },
  { label: "Aref Ruqaa", value: "'Aref Ruqaa', serif", group: "Arabic" },
  { label: "Lalezar", value: "'Lalezar', sans-serif", group: "Arabic" },
  { label: "El Messiri", value: "'El Messiri', sans-serif", group: "Arabic" },
  { label: "Frank Ruhl Libre", value: "'Frank Ruhl Libre', serif", group: "Hebrew" },
  { label: "Suez One", value: "'Suez One', serif", group: "Hebrew" },
  { label: "Noto Serif Display", value: "'Noto Serif Display', serif", group: "Greek" },
  { label: "Noto Sans Ethiopic", value: "'Noto Sans Ethiopic', sans-serif", group: "Ethiopic" },
  { label: "Noto Serif Armenian", value: "'Noto Serif Armenian', serif", group: "Armenian" },
  { label: "Noto Serif Georgian", value: "'Noto Serif Georgian', serif", group: "Georgian" },
];
