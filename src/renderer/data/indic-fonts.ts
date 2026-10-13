export const INDIC_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Khand:wght@300..700&family=Yatra+One&family=Eczar:wght@400..800&family=Amita:wght@400;700&family=Martel:wght@300;400;600;700;800&family=Laila:wght@300..700&family=Sura:wght@400;700&family=Anek+Devanagari:wght@100..800&family=Rajdhani:wght@300..700&family=Modak&family=Gotu&family=Galada&family=Atma:wght@300..700&family=Anek+Bangla:wght@100..800&family=Hind+Siliguri:wght@300..700&family=Baloo+Da+2:wght@400..800&family=Mina:wght@400;700&family=Arima:wght@100..700&family=Kavivanar&family=Baloo+Paaji+2:wght@400..800&family=Mukta+Mahee:wght@200..800&family=Anek+Kannada:wght@100..800&family=Ramaraja&family=Gulzar&display=swap";

interface IndicFont {
  label: string;
  value: string;
  group: string;
}

export const INDIC_FONT_FAMILIES: IndicFont[] = [
  { label: "Khand", value: "'Khand', sans-serif", group: "Devanagari" },
  { label: "Yatra One", value: "'Yatra One', cursive", group: "Devanagari" },
  { label: "Eczar", value: "'Eczar', serif", group: "Devanagari" },
  { label: "Amita", value: "'Amita', cursive", group: "Devanagari" },
  { label: "Martel", value: "'Martel', serif", group: "Devanagari" },
  { label: "Laila", value: "'Laila', serif", group: "Devanagari" },
  { label: "Sura", value: "'Sura', serif", group: "Devanagari" },
  { label: "Anek Devanagari", value: "'Anek Devanagari', sans-serif", group: "Devanagari" },
  { label: "Rajdhani", value: "'Rajdhani', sans-serif", group: "Devanagari" },
  { label: "Modak", value: "'Modak', cursive", group: "Devanagari" },
  { label: "Gotu", value: "'Gotu', sans-serif", group: "Devanagari" },
  { label: "Galada", value: "'Galada', cursive", group: "Bengali" },
  { label: "Atma", value: "'Atma', cursive", group: "Bengali" },
  { label: "Anek Bangla", value: "'Anek Bangla', sans-serif", group: "Bengali" },
  { label: "Hind Siliguri", value: "'Hind Siliguri', sans-serif", group: "Bengali" },
  { label: "Baloo Da 2", value: "'Baloo Da 2', sans-serif", group: "Bengali" },
  { label: "Mina", value: "'Mina', sans-serif", group: "Bengali" },
  { label: "Arima", value: "'Arima', serif", group: "Tamil" },
  { label: "Kavivanar", value: "'Kavivanar', cursive", group: "Tamil" },
  { label: "Baloo Paaji 2", value: "'Baloo Paaji 2', sans-serif", group: "Gurmukhi" },
  { label: "Mukta Mahee", value: "'Mukta Mahee', sans-serif", group: "Gurmukhi" },
  { label: "Anek Kannada", value: "'Anek Kannada', sans-serif", group: "Kannada" },
  { label: "Ramaraja", value: "'Ramaraja', serif", group: "Telugu" },
  { label: "Gulzar", value: "'Gulzar', serif", group: "Urdu" },
];
