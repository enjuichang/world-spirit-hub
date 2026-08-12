export type SubtypeClassification = {
  definition: string;
  distilleryId: string;
};

const classifications: Record<string, SubtypeClassification> = {
  "whisky:Scotch whisky": {
    definition: "Scottish geographical indication covering single malt, single grain and the three Scotch blending categories.",
    distilleryId: "glenfiddich",
  },
  "whisky:Bourbon": {
    definition: "United States corn-majority whiskey entered into new charred oak; it is not restricted to Kentucky.",
    distilleryId: "buffalo-trace",
  },
  "whisky:Rye whiskey": {
    definition: "United States rye-majority whiskey entered into new charred oak, with a drier grain-led identity than bourbon.",
    distilleryId: "sagamore-spirit",
  },
  "whisky:Tennessee whiskey": {
    definition: "Tennessee-made whiskey meeting state and federal rules, normally distinguished by maple-charcoal mellowing.",
    distilleryId: "jack-daniels",
  },
  "whisky:Irish whiskey": {
    definition: "Island-of-Ireland geographical indication divided into malt, grain, pot-still and blended whiskey categories.",
    distilleryId: "midleton",
  },
  "whisky:Canadian whisky": {
    definition: "Canadian geographical indication commonly built by blending separately made base and flavoring whiskies.",
    distilleryId: "crown-royal-gimli",
  },
  "whisky:Japanese whisky": {
    definition: "Japanese industry-standard classification tying qualifying fermentation, distillation, maturation and bottling to Japan.",
    distilleryId: "yamazaki",
  },
  "whisky:Taiwanese single malt whisky": {
    definition: "Malted-barley whisky from one Taiwanese distillery; a production-and-origin description rather than a global GI.",
    distilleryId: "kavalan",
  },
  "whisky:Indian single malt whisky": {
    definition: "Malted-barley whisky from one Indian distillery, distinguished by origin and single-distillery production.",
    distilleryId: "amrut",
  },
  "whisky:American single malt whiskey": {
    definition: "United States standard made entirely from malted barley at one U.S. distillery and matured in oak no larger than 700 liters.",
    distilleryId: "westland",
  },

  "brandy:Cognac": {
    definition: "Cognac-region wine-brandy GI defined by permitted grapes, seasonal double distillation and regional oak maturation.",
    distilleryId: "hennessy",
  },
  "brandy:Armagnac": {
    definition: "Gascon wine-brandy GI commonly distinguished by single distillation in a continuous Armagnac still.",
    distilleryId: "chateau-de-laubade",
  },
  "brandy:Brandy de Jerez": {
    definition: "Jerez-area Spanish brandy GI defined by local maturation, characteristically in a solera of Sherry-seasoned casks.",
    distilleryId: "bodegas-fundador",
  },
  "brandy:Pisco": {
    definition: "Grape spirit governed by separate Peruvian and Chilean denominations with materially different production rules.",
    distilleryId: "la-caravedo",
  },
  "brandy:Grappa": {
    definition: "Protected Italian, Sammarinese or Ticinese grape-marc spirit distilled from pomace rather than wine.",
    distilleryId: "nardini",
  },
  "brandy:Calvados": {
    definition: "Family of Normandy cider-and-perry spirit appellations differentiated by orchard origin and distillation method.",
    distilleryId: "calvados-drouin",
  },
  "brandy:Fruit eaux-de-vie": {
    definition: "Broad family of unsweetened spirits distilled from a named fermented fruit and normally bottled without oak influence.",
    distilleryId: "rochelt",
  },
  "brandy:Singani": {
    definition: "Bolivian high-valley denomination for aromatic Moscatel of Alexandria grape spirit.",
    distilleryId: "casa-real-singani",
  },
  "brandy:South African pot-still brandy": {
    definition: "South African class made entirely from double-pot-distilled wine spirit and matured in oak for at least three years.",
    distilleryId: "kwv-paarl",
  },

  "rum:Molasses-based rum": {
    definition: "Raw-material family fermented from the sugar-refining by-product, spanning light column and heavy pot-still styles.",
    distilleryId: "foursquare",
  },
  "rum:Cane-juice rum": {
    definition: "Broad raw-material family fermented directly from fresh-pressed cane juice, without implying one protected origin.",
    distilleryId: "ko-hana",
  },
  "rum:Rhum agricole": {
    definition: "French-language cane-juice tradition; only qualifying origins such as Martinique add a tightly defined appellation.",
    distilleryId: "rhum-clement",
  },
  "rum:Jamaican rum": {
    definition: "Jamaican geographical indication whose origin and production specification distinguish it from generic high-ester rum.",
    distilleryId: "appleton-estate",
  },
  "rum:Cuban-style rum": {
    definition: "Market style for light column spirit, aguardiente blending, filtration and restrained oak—not a universal legal class.",
    distilleryId: "havana-club-san-jose",
  },
  "rum:Cachaça": {
    definition: "Brazilian fresh-cane-juice spirit category with its own origin and distillation-strength rules.",
    distilleryId: "novo-fogo",
  },
  "rum:Clairin": {
    definition: "Traditional Haitian village-scale cane spirit identified most precisely by producer, place and cane variety.",
    distilleryId: "chelo-sajous",
  },

  "agave:Tequila": {
    definition: "Mexican denomination made from Blue Weber agave in authorized territory, as either 100% agave or mixto tequila.",
    distilleryId: "la-fortaleza",
  },
  "agave:Mezcal": {
    definition: "Mexican multi-agave denomination whose label separates production category, maturation class, species and place.",
    distilleryId: "del-maguey-san-luis",
  },
  "agave:Ancestral mezcal": {
    definition: "Regulated Mezcal production category requiring pit cooking, low-mechanization processing and direct-fire clay or wood stills.",
    distilleryId: "lalocura-palenque",
  },
  "agave:Bacanora": {
    definition: "Sonoran denomination for regional agave spirit, commonly produced from Agave angustifolia.",
    distilleryId: "kilinga-bacanora",
  },
  "agave:Raicilla": {
    definition: "Jalisco-and-Nayarit denomination whose coastal and mountain traditions use distinct agaves and still designs.",
    distilleryId: "estancia-raicilla",
  },
  "agave:Sotol": {
    definition: "Northern Mexican denomination distilled from Dasylirion, botanically separating it from every agave subtype.",
    distilleryId: "casa-lotos",
  },
  "agave:Texas sotol-style spirit": {
    definition: "United States Dasylirion spirit made outside the Mexican Sotol denomination and therefore classified by method, not protected origin.",
    distilleryId: "desert-door",
  },

  "gin:London Dry Gin": {
    definition: "Regulated distilled-gin subset with flavor created in redistillation and strict limits on later sweetening or additions.",
    distilleryId: "bombay-sapphire",
  },
  "gin:Distilled gin": {
    definition: "Legal production class made by redistilling agricultural alcohol with juniper and other natural botanicals.",
    distilleryId: "hendricks-gin-palace",
  },
  "gin:Contemporary gin": {
    definition: "Modern market style in which non-juniper botanicals lead, while the spirit still meets the applicable gin definition.",
    distilleryId: "four-pillars",
  },
  "gin:Old Tom gin": {
    definition: "Historical, non-uniform gin style generally marked by a rounder, sweeter profile than London Dry.",
    distilleryId: "haymans",
  },
  "gin:Genever": {
    definition: "Protected Dutch-and-Belgian grain-spirit family built around malt wine and integrated juniper character.",
    distilleryId: "filliers",
  },
  "gin:Barrel-aged gin": {
    definition: "Wood-maturation technique layered onto a qualifying gin, without a universal minimum age or cask rule.",
    distilleryId: "barr-hill-montpelier",
  },

  "vodka:Neutral vodka": {
    definition: "Highly rectified vodka style designed to minimize congeners and foreground proofing water, filtration and texture.",
    distilleryId: "absolut-ahus",
  },
  "vodka:Characterful vodka": {
    definition: "Descriptive style retaining identifiable raw-material aroma or texture through less-neutral production choices.",
    distilleryId: "koskenkorva",
  },
  "vodka:Flavored vodka": {
    definition: "Market-recognized vodka type whose declared flavor is added by extract, essence, maceration or direct blending.",
    distilleryId: "deep-eddy",
  },
  "vodka:Infused vodka": {
    definition: "Technique-led vodka style made by steeping identifiable ingredients, usually without redistilling the infusion.",
    distilleryId: "hanson-sonoma",
  },
  "vodka:Potato vodka": {
    definition: "Raw-material classification for vodka fermented from converted potatoes rather than a distinct origin or sweetness class.",
    distilleryId: "chopin-krzesk",
  },

  "asian:Strong-aroma baijiu": {
    definition: "Chinese aroma class defined by ester-rich solid-state fermentation in continuously reused mud pits.",
    distilleryId: "luzhou-laojiao",
  },
  "asian:Sauce-aroma baijiu": {
    definition: "Chinese aroma class defined by high-temperature daqu and repeated cooking, fermentation and distillation rounds.",
    distilleryId: "moutai",
  },
  "asian:Light-aroma baijiu": {
    definition: "Chinese aroma class centered on a short, clean sorghum fermentation traditionally conducted in stone vessels.",
    distilleryId: "fenjiu",
  },
  "asian:Rice-aroma baijiu": {
    definition: "Chinese aroma class made from rice with small-qu in semi-solid or liquid fermentation.",
    distilleryId: "guilin-sanhua",
  },
  "asian:Honkaku shōchū": {
    definition: "Japanese single-distilled shōchū class preserving the identity of a permitted base ingredient and kōji fermentation.",
    distilleryId: "kirishima-shuzo",
  },
  "asian:Awamori": {
    definition: "Okinawan geographical indication based on all-kōji indica rice, black kōji and single batch distillation.",
    distilleryId: "kumesen",
  },
  "asian:Diluted soju": {
    definition: "Modern Korean style made by reducing and blending highly rectified neutral spirit rather than distilling the final mash once.",
    distilleryId: "hitejinro-icheon",
  },
  "asian:Distilled soju": {
    definition: "Characterful Korean grain spirit distilled directly from a fermented mash, traditionally saccharified with nuruk.",
    distilleryId: "hwayo",
  },
  "asian:Kaoliang": {
    definition: "Chinese-language sorghum-spirit tradition, especially associated in Taiwan with the distinct Kinmen and Matsu islands.",
    distilleryId: "kinmen-kaoliang",
  },

  "flavoured:Liqueurs": {
    definition: "Sweetened spirit category meeting a market-specific sugar threshold and flavored by fruit, botanicals, dairy or other materials.",
    distilleryId: "cointreau",
  },
  "flavoured:Amari": {
    definition: "Italian bittersweet herbal style within the wider liqueur or bitter framework, not one protected recipe.",
    distilleryId: "fernet-branca",
  },
  "flavoured:Aniseed spirits": {
    definition: "Anise-led family containing distinct protected or defined types such as ouzo, pastis and anis.",
    distilleryId: "ouzo-plomari",
  },
  "flavoured:Aquavit": {
    definition: "Caraway-and/or-dill-led spirit category, with additional geographic protection for certain Nordic names.",
    distilleryId: "arcus-gjellerasen",
  },
  "flavoured:Cocktail bitters": {
    definition: "Concentrated aromatic-bitter preparation formulated for dashes, distinct from full-pour bitter liqueurs.",
    distilleryId: "angostura-bitters",
  },
  "flavoured:Flavored vodka": {
    definition: "Vodka category carrying added declared flavor; unlike infusion, the flavor may come entirely from extracts or essences.",
    distilleryId: "absolut-flavors",
  },
  "flavoured:Infused vodka": {
    definition: "Vodka style flavored by direct maceration of identifiable ingredients, generally retaining natural oils or color.",
    distilleryId: "zubrowka-bialystok",
  },
  "flavoured:Absinthe": {
    definition: "Wormwood, anise and fennel spirit tradition; only qualifying place names such as Absinthe de Pontarlier add GI protection.",
    distilleryId: "distillerie-guy",
  },
};

export function getSubtypeClassification(categoryId: string, subtypeName: string) {
  return classifications[`${categoryId}:${subtypeName}`];
}

export const subtypeClassificationEntries = Object.entries(classifications);
