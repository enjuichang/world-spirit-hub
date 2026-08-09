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
    ],
    regions: ["Scotland", "United States", "Ireland", "Canada", "Japan"],
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
    ],
    regions: ["France", "Spain", "Italy", "Peru", "Chile", "South Africa"],
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
    ],
    regions: ["Caribbean", "Brazil", "Central America", "South America"],
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
    subcategories: ["Tequila", "Mezcal", "Bacanora", "Raicilla", "Sotol"],
    regions: ["Jalisco", "Oaxaca", "Durango", "Sonora", "Chihuahua"],
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
    ],
    regions: ["China", "Japan", "Okinawa", "South Korea"],
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

export const locations: SpiritLocation[] = [
  {
    id: "glenfiddich",
    name: "Glenfiddich Distillery",
    place: "Dufftown, Speyside",
    country: "Scotland",
    coordinates: [-3.128, 57.454],
    categoryId: "whisky",
    subcategory: "Single Malt Scotch Whisky",
    descriptor: "Orchard-fruited Speyside malt",
    note: "A useful starting point for connecting copper pot distillation, ex-bourbon and sherry-influenced maturation with Speyside style.",
    tags: ["pear", "malt", "oak"],
  },
  {
    id: "laphroaig",
    name: "Laphroaig Distillery",
    place: "Islay",
    country: "Scotland",
    coordinates: [-6.15, 55.63],
    categoryId: "whisky",
    subcategory: "Single Malt Scotch Whisky",
    descriptor: "Peated, maritime Islay malt",
    note: "Explore how peat smoke, fermentation, still shape and maturation combine with—not simply copy—a place identity.",
    tags: ["peat", "smoke", "coastal"],
  },
  {
    id: "buffalo-trace",
    name: "Buffalo Trace Distillery",
    place: "Frankfort, Kentucky",
    country: "United States",
    coordinates: [-84.87, 38.217],
    categoryId: "whisky",
    subcategory: "Bourbon",
    descriptor: "Kentucky bourbon landmark",
    note: "Compare mash bill, new charred oak, warehouse position and the warm Kentucky maturation environment.",
    tags: ["corn", "vanilla", "char"],
  },
  {
    id: "yamazaki",
    name: "Yamazaki Distillery",
    place: "Shimamoto, Osaka",
    country: "Japan",
    coordinates: [135.674, 34.892],
    categoryId: "whisky",
    subcategory: "Japanese whisky",
    descriptor: "Japanese malt whisky landmark",
    note: "A study in diverse still shapes, fermentation choices and cask types assembled through blending.",
    tags: ["fruit", "incense", "oak"],
  },
  {
    id: "hennessy",
    name: "Hennessy",
    place: "Cognac",
    country: "France",
    coordinates: [-0.328, 45.695],
    categoryId: "brandy",
    subcategory: "Cognac",
    descriptor: "Cognac house and maturation landmark",
    note: "Use the location to explore double distillation, regional crus, oak maturation and the role of blending eaux-de-vie.",
    tags: ["grape", "floral", "rancio"],
  },
  {
    id: "chateau-de-laubade",
    name: "Château de Laubade",
    place: "Sorbet, Bas-Armagnac",
    country: "France",
    coordinates: [-0.03, 43.76],
    categoryId: "brandy",
    subcategory: "Armagnac",
    descriptor: "Bas-Armagnac estate",
    note: "Contrast Armagnac’s common continuous distillation tradition and estate identity with Cognac’s model.",
    tags: ["prune", "spice", "oak"],
    precision: "approximate",
  },
  {
    id: "calvados-drouin",
    name: "Christian Drouin",
    place: "Pont-l’Évêque, Normandy",
    country: "France",
    coordinates: [0.183, 49.282],
    categoryId: "brandy",
    subcategory: "Calvados",
    descriptor: "Norman apple and pear spirit",
    note: "Follow fruit selection, cider fermentation, distillation and oak through a protected regional category.",
    tags: ["apple", "pear", "baking spice"],
    precision: "approximate",
  },
  {
    id: "appleton-estate",
    name: "Appleton Estate",
    place: "Nassau Valley",
    country: "Jamaica",
    coordinates: [-77.82, 18.08],
    categoryId: "rum",
    subcategory: "Jamaican rum",
    descriptor: "Estate rum in Jamaica’s interior",
    note: "Long fermentation, pot distillation, ester development, column spirit and tropical maturation make this a rich comparison point.",
    tags: ["banana", "ester", "molasses"],
    precision: "approximate",
  },
  {
    id: "foursquare",
    name: "Foursquare Rum Distillery",
    place: "Saint Philip",
    country: "Barbados",
    coordinates: [-59.462, 13.122],
    categoryId: "rum",
    subcategory: "Barbados rum",
    descriptor: "Pot and column rum distillery",
    note: "An anchor for studying blended distillate character, cask maturation and Barbados rum identity.",
    tags: ["molasses", "dried fruit", "oak"],
  },
  {
    id: "rhum-clement",
    name: "Habitation Clément",
    place: "Le François, Martinique",
    country: "France",
    coordinates: [-60.9, 14.615],
    categoryId: "rum",
    subcategory: "Rhum Agricole Martinique",
    descriptor: "Cane-juice rhum landmark",
    note: "Explore fresh cane juice, Creole column distillation and AOC production rules.",
    tags: ["fresh cane", "grass", "pepper"],
  },
  {
    id: "la-fortaleza",
    name: "Tequila Fortaleza",
    place: "Tequila, Jalisco",
    country: "Mexico",
    coordinates: [-103.836, 20.88],
    categoryId: "agave",
    subcategory: "Tequila",
    descriptor: "Traditional tequila production",
    note: "A reference point for mature blue agave, oven cooking, tahona crushing and copper pot distillation.",
    tags: ["cooked agave", "citrus", "pepper"],
    precision: "approximate",
  },
  {
    id: "del-maguey-san-luis",
    name: "San Luis del Río Palenque",
    place: "San Luis del Río, Oaxaca",
    country: "Mexico",
    coordinates: [-96.32, 16.84],
    categoryId: "agave",
    subcategory: "Mezcal",
    descriptor: "Village-scale mezcal production",
    note: "An approximate village marker for exploring agave species, earthen roasting, open fermentation and small stills.",
    tags: ["roasted agave", "earth", "smoke"],
    precision: "approximate",
  },
  {
    id: "casa-lotos",
    name: "Sotol landmark",
    place: "Aldama, Chihuahua",
    country: "Mexico",
    coordinates: [-105.91, 28.84],
    categoryId: "agave",
    subcategory: "Sotol",
    descriptor: "Dasylirion spirit region",
    note: "A regional, approximate marker emphasizing that sotol is made from dasylirion rather than agave.",
    tags: ["herbal", "earth", "mineral"],
    precision: "approximate",
  },
  {
    id: "bombay-sapphire",
    name: "Bombay Sapphire Distillery",
    place: "Laverstoke Mill, Hampshire",
    country: "England",
    coordinates: [-1.299, 51.236],
    categoryId: "gin",
    subcategory: "London Dry Gin",
    descriptor: "Vapor-infusion gin landmark",
    note: "Connect botanical recipe and vapor infusion with a clean, juniper-led style.",
    tags: ["juniper", "citrus", "coriander"],
  },
  {
    id: "sipsmith",
    name: "Sipsmith Distillery",
    place: "London",
    country: "England",
    coordinates: [-0.246, 51.495],
    categoryId: "gin",
    subcategory: "London Dry Gin",
    descriptor: "Modern London gin distillery",
    note: "A useful example of the twenty-first-century revival of small-scale copper gin distilling in London.",
    tags: ["juniper", "lemon", "dry"],
    precision: "approximate",
  },
  {
    id: "filliers",
    name: "Filliers Distillery",
    place: "Deinze",
    country: "Belgium",
    coordinates: [3.527, 50.984],
    categoryId: "gin",
    subcategory: "Genever",
    descriptor: "Belgian genever tradition",
    note: "Contrast malt-wine character, botanicals and maturation with neutral-spirit gin.",
    tags: ["malt", "juniper", "spice"],
    precision: "approximate",
  },
  {
    id: "absolut-ahus",
    name: "The Absolut Company",
    place: "Åhus",
    country: "Sweden",
    coordinates: [14.296, 55.928],
    categoryId: "vodka",
    subcategory: "Swedish vodka",
    descriptor: "Large-scale wheat vodka production",
    note: "Explore rectification, consistency, wheat character and the importance of water and dilution.",
    tags: ["wheat", "clean", "soft"],
    precision: "approximate",
  },
  {
    id: "polmos-zyrardow",
    name: "Żyrardów Distillery",
    place: "Żyrardów",
    country: "Poland",
    coordinates: [20.438, 52.048],
    categoryId: "vodka",
    subcategory: "Polish rye vodka",
    descriptor: "Rye vodka landmark",
    note: "Compare a characterful rye-based style with more neutral international vodka profiles.",
    tags: ["rye", "pepper", "cream"],
    precision: "approximate",
  },
  {
    id: "moutai",
    name: "Kweichow Moutai",
    place: "Maotai, Guizhou",
    country: "China",
    coordinates: [106.4, 27.84],
    categoryId: "asian",
    subcategory: "Sauce-aroma baijiu",
    descriptor: "Sauce-aroma baijiu landmark",
    note: "Study high-temperature qu, solid-state fermentation, repeated production cycles and long blending.",
    tags: ["savory", "fermented grain", "umami"],
    precision: "approximate",
  },
  {
    id: "luzhou-laojiao",
    name: "Luzhou Laojiao",
    place: "Luzhou, Sichuan",
    country: "China",
    coordinates: [105.44, 28.87],
    categoryId: "asian",
    subcategory: "Strong-aroma baijiu",
    descriptor: "Strong-aroma baijiu landmark",
    note: "Explore mud-pit fermentation, mixed grains and ester-rich aroma.",
    tags: ["pineapple", "anise", "fermented grain"],
    precision: "approximate",
  },
  {
    id: "kirishima-shuzo",
    name: "Kirishima Shuzo",
    place: "Miyakonojō, Miyazaki",
    country: "Japan",
    coordinates: [131.073, 31.724],
    categoryId: "asian",
    subcategory: "Honkaku shōchū",
    descriptor: "Sweet-potato shōchū landmark",
    note: "Connect kōji choice, sweet potato, single distillation and service temperature with aroma and texture.",
    tags: ["sweet potato", "earth", "floral"],
    precision: "approximate",
  },
  {
    id: "kumesen",
    name: "Kumesen Syuzo",
    place: "Naha, Okinawa",
    country: "Japan",
    coordinates: [127.69, 26.2],
    categoryId: "asian",
    subcategory: "Awamori",
    descriptor: "Okinawan awamori producer",
    note: "Explore Thai rice, black kōji, single fermentation and the tradition of aged kūsu.",
    tags: ["rice", "earth", "tropical"],
    precision: "approximate",
  },
  {
    id: "chartreuse",
    name: "Chartreuse Diffusion",
    place: "Aiguenoire, Isère",
    country: "France",
    coordinates: [5.74, 45.37],
    categoryId: "flavoured",
    subcategory: "Herbal liqueur",
    descriptor: "Herbal liqueur production landmark",
    note: "A reference for complex botanical extraction, blending, sweetness and maturation.",
    tags: ["herbal", "sweet", "spice"],
    precision: "approximate",
  },
  {
    id: "cointreau",
    name: "Carré Cointreau",
    place: "Saint-Barthélemy-d’Anjou",
    country: "France",
    coordinates: [-0.493, 47.468],
    categoryId: "flavoured",
    subcategory: "Orange liqueur",
    descriptor: "Citrus liqueur landmark",
    note: "Explore peel selection, extraction, redistillation, blending and sugar balance.",
    tags: ["orange", "floral", "sweet"],
    precision: "approximate",
  },
  {
    id: "aalborg-akvavit",
    name: "Aalborg Akvavit tradition",
    place: "Aalborg",
    country: "Denmark",
    coordinates: [9.922, 57.048],
    categoryId: "flavoured",
    subcategory: "Aquavit",
    descriptor: "Scandinavian caraway spirit landmark",
    note: "A regional marker for comparing caraway-led aquavit with dill-led and cask-aged styles.",
    tags: ["caraway", "dill", "citrus"],
    precision: "approximate",
  },
];

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
