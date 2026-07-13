export type SundayCategory = {
  id: string;
  name: string;
  glyph: string;
  hint: string;
  detail: string;
  placeTypes: string[];
};

export const SUNDAY_CATEGORIES: SundayCategory[] = [
  {
    id: "spaeti",
    name: "Späti",
    glyph: "S",
    hint: "Meist bis spät",
    detail:
      "Getränke, Snacks, Zigaretten, oft auch Kondome und Kaugummi. Vor allem in Berlin, Leipzig, Hamburg.",
    placeTypes: ["convenience_store"],
  },
  {
    id: "tankstelle",
    name: "Tankstelle",
    glyph: "T",
    hint: "24/7 Notfall",
    detail:
      "Milch, Brot, Süßigkeiten, überteuert aber offen. Der klassische Sonntagsretter.",
    placeTypes: ["gas_station"],
  },
  {
    id: "bahnhof",
    name: "Bahnhof-Rewe",
    glyph: "B",
    hint: "Bis 22:00",
    detail:
      "Rewe, Edeka oder Kaisers in großen Bahnhöfen. Volles Sortiment, meist 06:00–22:00, auch sonntags.",
    placeTypes: ["train_station"],
  },
  {
    id: "baeckerei",
    name: "Bäckerei",
    glyph: "B",
    hint: "Bis Mittag",
    detail:
      "Sonntagsbrötchen! Die meisten Bäckereien öffnen 07:00–12:00. Am besten früh aufstehen.",
    placeTypes: ["bakery"],
  },
  {
    id: "apotheke",
    name: "Notdienst-Apotheke",
    glyph: "A",
    hint: "Wechselnd",
    detail:
      "Immer eine Apotheke im Notdienst. Aushang an jeder Apotheke oder online über die Apothekerkammer.",
    placeTypes: ["pharmacy"],
  },
  {
    id: "blumen",
    name: "Blumenladen",
    glyph: "B",
    hint: "Meist offen",
    detail:
      "Der klassische Sonntags-Handel — als Ausnahme in der Ladenschlussregel. Perfekt für den Besuch bei den Schwiegereltern.",
    placeTypes: ["florist"],
  },
];

export type ActivityIdea = {
  title: string;
  blurb: string;
  weather: "sunny" | "cloudy" | "rainy" | "any";
};

export const ACTIVITIES: ActivityIdea[] = [
  {
    title: "Spaziergang im Park",
    blurb: "Die klassische deutsche Sonntagsdisziplin. Bonuspunkte für Kastanien im Herbst.",
    weather: "sunny",
  },
  {
    title: "Biergarten & Brezn",
    blurb: "Wenn die Sonne scheint, gehört der Nachmittag unter Kastanienbäumen verbracht.",
    weather: "sunny",
  },
  {
    title: "Flohmarkt-Runde",
    blurb: "Mauerpark, Nordbahnhof, Fünf-Höfe — jede Stadt hat ihren Sonntags-Flohmarkt.",
    weather: "sunny",
  },
  {
    title: "Waldwanderung",
    blurb: "Frische Luft, keine Erreichbarkeit. Perfekt gegen die Wochen-Reizüberflutung.",
    weather: "cloudy",
  },
  {
    title: "Café mit Zeitung",
    blurb: "FAZ am Sonntag, Milchkaffee, drei Stunden nichts tun. Ohne schlechtes Gewissen.",
    weather: "cloudy",
  },
  {
    title: "Museum & Ausstellung",
    blurb: "Viele Museen mit freiem Sonntag im Monat. Der Regenschutz mit Kulturbonus.",
    weather: "rainy",
  },
  {
    title: "Brettspiel-Nachmittag",
    blurb: "Siedler von Catan, Kniffel, Skat. Regen draußen, Chaos drinnen.",
    weather: "rainy",
  },
  {
    title: "Kino-Matinee",
    blurb: "Vormittagsvorstellung, halb leer, günstiger. Perfekt fürs Regenwetter.",
    weather: "rainy",
  },
  {
    title: "Tatort um 20:15",
    blurb: "Nicht verhandelbar. Das eigentliche Ende der deutschen Woche.",
    weather: "any",
  },
  {
    title: "Sonntagsbraten kochen",
    blurb: "Rouladen, Klöße, Rotkohl. Vier Stunden Küche, zwanzig Minuten essen.",
    weather: "any",
  },
];

export type ShoppingPreset = {
  id: string;
  name: string;
  items: string[];
};

export const SHOPPING_PRESETS: ShoppingPreset[] = [
  {
    id: "brunch",
    name: "Brunch für 4",
    items: [
      "Brötchen (vorbestellen)",
      "Eier",
      "Räucherlachs",
      "Frischkäse",
      "Orangensaft",
      "Kaffee",
    ],
  },
  {
    id: "grill",
    name: "Grillabend",
    items: [
      "Nackensteaks",
      "Bratwurst",
      "Grillkohle",
      "Kartoffelsalat-Zutaten",
      "Bier (Kasten)",
      "Senf & Ketchup",
    ],
  },
  {
    id: "netflix",
    name: "Netflix-Abend",
    items: [
      "Tiefkühlpizza",
      "Chips",
      "Schokolade",
      "Cola",
      "Wein (Rotwein)",
    ],
  },
  {
    id: "tatort",
    name: "Tatort-Sonntag",
    items: [
      "Bier",
      "Erdnussflips",
      "Salzstangen",
      "Käseigel-Zutaten",
    ],
  },
];