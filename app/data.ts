import distilleryData from "../data/distilleries.json";
import distilleryProfiles from "../data/distillery-profiles.json";
import subtypeExpansion from "../data/subtype-expansion.json";

export type SpiritCategory = {
  id: string;
  name: string;
  short: string;
  color: string;
  summary: string;
  subcategories: string[];
  regions: string[];
  taste: string[];
  production: string;
  law: string;
  history: string;
  price: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type SpiritLocation = {
  id: string;
  name: string;
  place: string;
  country: string;
  coordinates: [number, number];
  categoryId: string;
  subcategory: string;
  descriptor: string;
  note: string;
  tags: string[];
  precision?: "exact" | "approximate";
  sourceLabel?: string;
  sourceUrl?: string;
  profile: {
    established: string;
    production: string;
    style: string;
    context: string;
  };
};

export type CredentialedBar = {
  id: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
  credential: string;
  year: number;
  position?: number;
  style: string;
  sourceUrl: string;
};

export const categories: SpiritCategory[] = [
  {
    id: "whisky",
    name: "Whisky & whiskey",
    short: "WH",
    color: "#D4A15D",
    summary:
      "Grain spirits shaped by cereal choice, fermentation, still design, oak, climate, and regional law.",
    subcategories: [
      "Scotch whisky",
      "Bourbon",
      "Rye whiskey",
      "Tennessee whiskey",
      "Irish whiskey",
      "Canadian whisky",
      "Japanese whisky",
      "Taiwanese single malt whisky",
      "Indian single malt whisky",
      "American single malt whiskey",
    ],
    regions: ["Scotland", "United States", "Ireland", "Canada", "Japan", "Taiwan", "India"],
    taste: ["Cereal", "Orchard fruit", "Vanilla", "Oak", "Smoke"],
    production:
      "Cereals are converted, fermented, distilled, then usually matured in oak. Mash bill, fermentation, still type, cask history and climate all leave a mark.",
    law:
      "Rules differ by jurisdiction. Protected names can control origin, raw materials, distillation strength, maturation vessel, age and labeling.",
    history:
      "Distillation traditions grew across Ireland and Scotland before grain whisky expanded through column distillation. North American and Japanese traditions developed distinct legal and stylistic identities.",
    price:
      "Age, cask type, evaporation, batch size, production yield, scarcity and brand positioning can all move price.",
    sourceLabel: "WSET Level 3 specification",
    sourceUrl:
      "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
  },
  {
    id: "brandy",
    name: "Brandy & fruit spirits",
    short: "BR",
    color: "#BC6F55",
    summary:
      "Spirits distilled from wine, grape pomace or other fermented fruit, from polished aged brandies to vivid eaux-de-vie.",
    subcategories: [
      "Cognac",
      "Armagnac",
      "Brandy de Jerez",
      "Pisco",
      "Grappa",
      "Calvados",
      "Fruit eaux-de-vie",
      "Singani",
      "South African pot-still brandy",
    ],
    regions: ["France", "Spain", "Italy", "Peru", "Chile", "Bolivia", "South Africa"],
    taste: ["Fresh grape", "Orchard fruit", "Floral", "Rancio", "Oak spice"],
    production:
      "Fruit is fermented and distilled; choices around pressing, lees, still type, cut points and maturation determine intensity and texture.",
    law:
      "Cognac, Armagnac, Calvados, Pisco and other protected categories have origin-specific rules. The word brandy alone is much broader.",
    history:
      "Wine distillation developed as both preservation and trade technology. Regional stills and maturation practices later created recognizable local styles.",
    price:
      "Fruit quality, low spirit yields, long maturation, vintage stocks and protected origin are common price drivers.",
    sourceLabel: "WSET Level 3 specification",
    sourceUrl:
      "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
  },
  {
    id: "rum",
    name: "Rum & sugar cane",
    short: "RU",
    color: "#9B7653",
    summary:
      "A diverse family made from fresh cane juice, syrup or molasses, with traditions spanning the Caribbean and the Americas.",
    subcategories: [
      "Molasses-based rum",
      "Cane-juice rum",
      "Rhum agricole",
      "Jamaican rum",
      "Cuban-style rum",
      "Cachaça",
      "Clairin",
    ],
    regions: ["Caribbean", "Haiti", "Brazil", "Central America", "South America"],
    taste: ["Fresh cane", "Tropical fruit", "Caramel", "Ester", "Warm spice"],
    production:
      "Base material, fermentation length, yeast and bacteria, pot or column distillation, blending and tropical or continental maturation create enormous range.",
    law:
      "Rum legislation varies widely. Rhum Agricole Martinique AOC and Brazilian cachaça are examples with more specific geographic and production rules.",
    history:
      "Rum is inseparable from the history of sugar, colonization and forced labor. The category’s story should name that human cost alongside production development.",
    price:
      "Raw material, distillation intensity, tropical aging losses, cask program, additives, transparency and rarity influence value.",
    sourceLabel: "WSET Level 3 specification",
    sourceUrl:
      "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
  },
  {
    id: "agave",
    name: "Agave & related spirits",
    short: "AG",
    color: "#63A876",
    summary:
      "Cooked plant hearts, long growing cycles and place-specific methods produce spirits ranging from bright and peppery to smoky and deeply savory.",
    subcategories: ["Tequila", "Mezcal", "Ancestral mezcal", "Bacanora", "Raicilla", "Sotol", "Texas sotol-style spirit"],
    regions: ["Jalisco", "Oaxaca", "Durango", "Sonora", "Chihuahua", "Texas"],
    taste: ["Cooked agave", "Citrus", "Pepper", "Earth", "Smoke"],
    production:
      "Mature plants are harvested, cooked, crushed, fermented and distilled. Species, maturity, cooking method, fermentation vessel and still material shape style.",
    law:
      "Tequila and Mezcal are protected Mexican denominations with defined territories and production rules. Sotol comes from dasylirion, not agave.",
    history:
      "Indigenous fermented agave traditions predate distillation. Regional distilling practices later evolved around local plants, equipment and communities.",
    price:
      "Plant maturity, wild or cultivated supply, harvest yield, labor-intensive cooking and tiny batches can raise cost.",
    sourceLabel: "WSET Level 3 specification",
    sourceUrl:
      "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
  },
  {
    id: "gin",
    name: "Gin & genever",
    short: "GI",
    color: "#5EA6A6",
    summary:
      "Juniper-led spirits whose character comes from botanical recipe, extraction method and the personality of the base spirit.",
    subcategories: [
      "London Dry Gin",
      "Distilled gin",
      "Contemporary gin",
      "Old Tom gin",
      "Genever",
      "Barrel-aged gin",
    ],
    regions: ["United Kingdom", "Netherlands", "Belgium", "Global"],
    taste: ["Juniper", "Citrus peel", "Coriander", "Floral", "Herbal"],
    production:
      "Botanicals may be macerated, percolated or vapor-infused before redistillation. Recipe, extraction and cut points control balance.",
    law:
      "Gin must show juniper character, but definitions and minimum strengths vary. London Dry describes a production standard, not a required London origin.",
    history:
      "Genever traditions influenced English gin, which moved through periods of mass consumption, regulation, dry styles and modern botanical experimentation.",
    price:
      "Botanical quality, extraction complexity, scale, base spirit, packaging and market position tend to matter more than age.",
    sourceLabel: "WSET Level 3 specification",
    sourceUrl:
      "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
  },
  {
    id: "vodka",
    name: "Vodka",
    short: "VO",
    color: "#83A8C9",
    summary:
      "A broad category that can pursue extreme neutrality or preserve subtle raw-material and texture cues.",
    subcategories: [
      "Neutral vodka",
      "Characterful vodka",
      "Flavored vodka",
      "Infused vodka",
      "Potato vodka",
    ],
    regions: ["Poland", "Sweden", "Finland", "United States", "Global"],
    taste: ["Clean", "Cereal", "Pepper", "Creamy", "Citrus"],
    production:
      "Highly rectified spirit is filtered, adjusted and diluted; raw material, rectification level, filtration and water can still alter texture and aroma.",
    law:
      "EU and US definitions differ, including how character and flavoring are treated. Country-specific labeling must be checked at publication time.",
    history:
      "Vodka traditions developed across northern and eastern Europe before the category expanded globally through cocktails and international brands.",
    price:
      "Raw material and distillation can matter, but filtration story, packaging, scale and brand positioning often have a large effect.",
    sourceLabel: "WSET Level 3 specification",
    sourceUrl:
      "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
  },
  {
    id: "asian",
    name: "Asian grain spirits",
    short: "AS",
    color: "#B482C4",
    summary:
      "Distinct traditions that use qu, kōji or nuruk to unlock starch—never one interchangeable category.",
    subcategories: [
      "Strong-aroma baijiu",
      "Sauce-aroma baijiu",
      "Light-aroma baijiu",
      "Rice-aroma baijiu",
      "Honkaku shōchū",
      "Awamori",
      "Diluted soju",
      "Distilled soju",
      "Kaoliang",
    ],
    regions: ["China", "Taiwan", "Japan", "Okinawa", "South Korea"],
    taste: ["Fermented fruit", "Grain", "Umami", "Earth", "Floral"],
    production:
      "Filamentous fungi and mixed cultures convert starch while fermentation proceeds. Solid or liquid fermentations, repeated batches and varied stills create radically different profiles.",
    law:
      "Baijiu, shōchū and soju have distinct methods and legal identities. Shōchū rules distinguish continuous and single-distilled forms; awamori has its own tradition.",
    history:
      "These categories developed through local fermentation cultures, grains and service customs. Treating them as a single ‘Asian spirit’ erases essential differences.",
    price:
      "Fermentation time, aging vessel, batch complexity, raw material, regional prestige and allocation can all affect price.",
    sourceLabel: "WSET Level 3 specification",
    sourceUrl:
      "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
  },
  {
    id: "flavoured",
    name: "Flavored spirits & liqueurs",
    short: "FL",
    color: "#C95F83",
    summary:
      "A wide field built through botanicals, fruit, spice, bitterness and sweetness—from amari to aquavit and liqueurs.",
    subcategories: [
      "Liqueurs",
      "Amari",
      "Aniseed spirits",
      "Aquavit",
      "Cocktail bitters",
      "Flavored vodka",
      "Infused vodka",
      "Absinthe",
    ],
    regions: ["Italy", "France", "Scandinavia", "Mediterranean", "Global"],
    taste: ["Herbal", "Bitter", "Sweet", "Spice", "Citrus"],
    production:
      "Flavor may be extracted through maceration, percolation, redistillation or direct addition before blending, sweetening, coloring and resting.",
    law:
      "Definitions depend on category and market. Sweetening thresholds, permitted flavorings, base spirit and labeling rules need jurisdiction-specific sourcing.",
    history:
      "Medicinal, monastic, household and commercial flavoring traditions converged into today’s aperitifs, digestifs, bitters and cocktail modifiers.",
    price:
      "Ingredient cost, extraction, aging, concentration, production scale and brand heritage can all influence price.",
    sourceLabel: "WSET Level 3 specification",
    sourceUrl:
      "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
  },
];

type DistilleryProfile = SpiritLocation["profile"];

const profileById = distilleryProfiles as Record<string, DistilleryProfile>;

type ExpansionTuple = [
  id: string,
  name: string,
  place: string,
  country: string,
  longitude: number,
  latitude: number,
  descriptor: string,
  tagOne: string,
  tagTwo: string,
  tagThree: string,
  sourceUrl: string,
];

const expandedLocations = Object.entries(
  subtypeExpansion as unknown as Record<string, ExpansionTuple[]>,
).flatMap(([key, entries]) => {
  const separator = key.indexOf(":");
  const categoryId = key.slice(0, separator);
  const subcategory = key.slice(separator + 1);

  return entries.map((entry) => {
    const [
      id,
      name,
      place,
      country,
      longitude,
      latitude,
      descriptor,
      tagOne,
      tagTwo,
      tagThree,
      sourceUrl,
    ] = entry;
    const note = `A documented ${subcategory} production site that broadens the atlas beyond its original reference set.`;

    return {
      id,
      name,
      place,
      country,
      coordinates: [longitude, latitude] as [number, number],
      categoryId,
      subcategory,
      descriptor,
      note,
      tags: [tagOne, tagTwo, tagThree],
      precision: "approximate" as const,
      sourceLabel: `Official ${name} website`,
      sourceUrl,
      profile: {
        established: "See official producer history",
        production: `${name} produces ${subcategory} at or around the mapped ${place} site. The producer source below is the reference for current production and visitor information.`,
        style: `${descriptor}. Representative cues include ${tagOne}, ${tagTwo} and ${tagThree}.`,
        context: note,
      },
    } satisfies SpiritLocation;
  });
});

export const locations = [
  ...distilleryData.map((location) => ({
    ...location,
    coordinates: location.coordinates as [number, number],
    precision: location.precision as SpiritLocation["precision"],
    profile: profileById[location.id],
  })),
  ...expandedLocations,
] satisfies SpiritLocation[];

export const credentialedBars: CredentialedBar[] = [
  {
    id: "bar-leone",
    name: "Bar Leone",
    city: "Hong Kong",
    country: "Hong Kong",
    coordinates: [114.15, 22.284],
    credential: "The World’s 50 Best Bars",
    year: 2025,
    position: 1,
    style: "Italian aperitivo spirit with focused, approachable classics.",
    sourceUrl: "https://www.theworlds50best.com/bars/list/1-50-winner",
  },
  {
    id: "handshake",
    name: "Handshake Speakeasy",
    city: "Mexico City",
    country: "Mexico",
    coordinates: [-99.164, 19.427],
    credential: "The World’s 50 Best Bars",
    year: 2025,
    position: 2,
    style: "Technique-led signatures in an intimate room.",
    sourceUrl: "https://www.theworlds50best.com/bars/list/1-50-winner",
  },
  {
    id: "sips",
    name: "Sips",
    city: "Barcelona",
    country: "Spain",
    coordinates: [2.164, 41.391],
    credential: "The World’s 50 Best Bars",
    year: 2025,
    position: 3,
    style: "Highly designed, modern cocktails with playful presentation.",
    sourceUrl: "https://www.theworlds50best.com/bars/list/1-50-winner",
  },
  {
    id: "tayer",
    name: "Tayēr + Elementary",
    city: "London",
    country: "United Kingdom",
    coordinates: [-0.081, 51.525],
    credential: "The World’s 50 Best Bars",
    year: 2025,
    position: 5,
    style: "Two-mode experience: easygoing highballs and experimental serves.",
    sourceUrl: "https://www.theworlds50best.com/bars/list/1-50-winner",
  },
  {
    id: "jigger-pony",
    name: "Jigger & Pony",
    city: "Singapore",
    country: "Singapore",
    coordinates: [103.852, 1.277],
    credential: "The World’s 50 Best Bars",
    year: 2025,
    position: 9,
    style: "Polished hospitality and contemporary interpretations of classics.",
    sourceUrl: "https://www.theworlds50best.com/bars/list/1-50-winner",
  },
  {
    id: "alquimico",
    name: "Alquímico",
    city: "Cartagena",
    country: "Colombia",
    coordinates: [-75.55, 10.423],
    credential: "The World’s 50 Best Bars",
    year: 2025,
    position: 11,
    style: "Colombian ingredients and a high-energy multi-level experience.",
    sourceUrl: "https://www.theworlds50best.com/bars/list/1-50-winner",
  },
  {
    id: "bar-benfiddich",
    name: "Bar Benfiddich",
    city: "Tokyo",
    country: "Japan",
    coordinates: [139.697, 35.692],
    credential: "The World’s 50 Best Bars",
    year: 2025,
    position: 18,
    style: "Botanical, farm-linked drinks and singular bartender craft.",
    sourceUrl: "https://www.theworlds50best.com/bars/list/1-50-winner",
  },
  {
    id: "maybe-sammy",
    name: "Maybe Sammy",
    city: "Sydney",
    country: "Australia",
    coordinates: [151.208, -33.864],
    credential: "The World’s 50 Best Bars",
    year: 2025,
    position: 42,
    style: "Theatrical hospitality grounded in classic cocktail structure.",
    sourceUrl: "https://www.theworlds50best.com/bars/list/1-50-winner",
  },
  {
    id: "sip-guzzle",
    name: "Sip & Guzzle",
    city: "New York",
    country: "United States",
    coordinates: [-74.0, 40.729],
    credential: "North America’s 50 Best Bars",
    year: 2026,
    position: 1,
    style: "A lively tavern-level bar paired with a quieter cocktail room.",
    sourceUrl: "https://www.theworlds50best.com/bars/northamerica/list/1-50l",
  },
  {
    id: "bar-mauro",
    name: "Bar Mauro",
    city: "Mexico City",
    country: "Mexico",
    coordinates: [-99.168, 19.419],
    credential: "North America’s 50 Best Bars",
    year: 2026,
    position: 2,
    style: "Italian-influenced aperitivo culture in Mexico City.",
    sourceUrl: "https://www.theworlds50best.com/bars/northamerica/list/1-50l",
  },
  {
    id: "jewel-south",
    name: "Jewel of the South",
    city: "New Orleans",
    country: "United States",
    coordinates: [-90.071, 29.958],
    credential: "North America’s 50 Best Bars",
    year: 2026,
    position: 6,
    style: "Historically minded drinks and Southern hospitality.",
    sourceUrl: "https://www.theworlds50best.com/bars/northamerica/list/1-50l",
  },
  {
    id: "kumiko",
    name: "Kumiko",
    city: "Chicago",
    country: "United States",
    coordinates: [-87.648, 41.886],
    credential: "North America’s 50 Best Bars",
    year: 2026,
    position: 11,
    style: "Japanese-informed precision, thoughtful pairings and quiet hospitality.",
    sourceUrl: "https://www.theworlds50best.com/bars/northamerica/list/1-50l",
  },
];

export const getCategory = (id: string) =>
  categories.find((category) => category.id === id);

export const getLocation = (id: string) =>
  locations.find((location) => location.id === id);
