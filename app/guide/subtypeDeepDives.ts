import type { MapRegion, SubtypeGuide } from "../guideData";

export type DeepDiveZone = MapRegion & {
  character: string;
  detail: string;
};

export type DeepDiveStyle = {
  name: string;
  character: string;
  detail: string;
};

export type SubtypeDeepDiveData = {
  introduction: string;
  ingredient: {
    name: string;
    scientificName?: string;
    description: string;
    image?: string;
    imageAlt?: string;
    fact: string;
    varieties?: Array<{
      name: string;
      scientificName?: string;
      role: string;
      description: string;
      image: string;
      imageAlt: string;
      credit?: { label: string; url?: string };
    }>;
  };
  mapTitle: string;
  mapNote: string;
  mapFocus?: string[];
  zones: DeepDiveZone[];
  styles?: DeepDiveStyle[];
  source?: { label: string; url: string };
};

const categoryIngredients: Record<string, SubtypeDeepDiveData["ingredient"]> = {
  whisky: {
    name: "Cereal grains",
    description: "Barley, corn, rye, wheat and other cereals change fermentable yield, texture and the family of aromas available before the still and cask add their own influence.",
    fact: "The exact mash bill—or the blend of separately made whiskies—is usually more informative than grain imagery alone.",
  },
  brandy: {
    name: "Fermented fruit",
    description: "Brandy begins with wine, cider, pomace or another fermented fruit. Variety, ripeness, acidity, pressing and lees determine what the still has available to concentrate.",
    fact: "A protected brandy name often narrows both the permitted fruit and the place where it must be grown or transformed.",
  },
  rum: {
    name: "Sugar cane",
    scientificName: "Saccharum species and hybrids",
    description: "Rum may begin with fresh cane juice, cane syrup or molasses. That first choice changes freshness, fermentation behavior and the style of congeners built before distillation.",
    fact: "Fresh juice must be processed quickly; molasses is stable enough to travel and supports a very different production economy.",
  },
  agave: {
    name: "Agave—or Dasylirion for sotol",
    description: "Species, maturity, field conditions and the way a harvested heart is cooked all shape the fermentable sugars and savory plant character of these spirits.",
    fact: "Sotol belongs beside agave spirits culturally and methodologically, but its raw plant is Dasylirion, not agave.",
  },
  gin: {
    name: "Juniper and botanicals",
    scientificName: "Juniperus communis and recipe botanicals",
    description: "Juniper must lead the legal identity of gin, while citrus, coriander, roots, flowers, tea, fruit and local plants reshape its aromatic architecture.",
    fact: "Recipe and extraction method are usually more useful than geography for styles such as London Dry or contemporary gin.",
  },
  vodka: {
    name: "Agricultural fermentables",
    description: "Wheat, rye, corn, potato, grapes and other materials can all supply alcohol. Rectification may quiet their aroma, but texture and subtle cereal, earthy or fruity cues can remain.",
    fact: "Water, filtration and final proof become especially visible when the base spirit is highly rectified.",
  },
  asian: {
    name: "Grain plus fermentation culture",
    description: "Sorghum, rice, barley, sweet potato and other starches meet qu, kōji or nuruk cultures that unlock sugar while building distinctive microbial aroma.",
    fact: "The conversion culture is not a minor ingredient: it is part of the production engine and the flavor system.",
  },
  flavoured: {
    name: "Botanicals, fruit, sugar and a spirit base",
    description: "Roots, bark, seeds, herbs, flowers, fruit, nuts, dairy or coffee may be extracted into a spirit base, then balanced with sweetness, bitterness and alcohol.",
    fact: "The ingredient list and extraction method often explain more than a broad word such as liqueur or bitters.",
  },
};

const curated: Record<string, SubtypeDeepDiveData> = {
  "whisky:Scotch whisky": {
    introduction: "Scotch is one protected national GI with five protected regional or locality names. They are useful orientation points, not flavor guarantees: still shape, fermentation, peat, cask and blending can outweigh geography.",
    ingredient: {
      name: "Malted barley",
      scientificName: "Hordeum vulgare",
      description: "Single malt Scotch begins with malted barley. Germination creates enzymes that release fermentable sugars; kilning stops growth, and peat smoke may—or may not—add smoky phenols at this stage.",
      image: "/ingredients/malted-barley.png",
      imageAlt: "Malted barley grains and barley ears on a traditional malting floor",
      fact: "Grain Scotch can also use other whole cereals, while malt whisky must use malted barley and pot stills.",
    },
    mapTitle: "Scotland's five protected whisky names",
    mapNote: "The vectors follow the protected areas named in the Scotch Whisky product specification. Speyside and Campbeltown use the referenced 2007 ward boundaries; the statutory Highland–Lowland route is cartographically simplified. Flavor notes are tendencies, never requirements.",
    mapFocus: ["Scotland"],
    zones: [
      { name: "Highland", point: [-4.45, 58.35], kind: "protected", character: "Broadest range", detail: "The largest region spans light, fruity inland malts, heathery northern styles and salty coastal expressions.", distillery: { name: "Glenmorangie Distillery", point: [-4.077, 57.842], image: "/bottles/glenmorangie.png" } },
      { name: "Speyside", point: [-3.42, 57.34], kind: "protected", character: "Orchard fruit · honey · spice", detail: "Dense with distilleries; many styles emphasize fruit and restrained peat, with Sherry-cask maturation common but not mandatory.", distillery: { name: "The Glenlivet Distillery", point: [-3.338, 57.344], image: "/bottles/glenlivet.jpg" } },
      { name: "Lowland", point: [-3.65, 55.45], kind: "protected", character: "Grass · floral lift · gentle cereal", detail: "Often associated with lighter profiles, though a growing group of distilleries makes the region increasingly diverse.", distillery: { name: "Auchentoshan Distillery", point: [-4.439, 55.923], image: "/bottles/auchentoshan.webp" } },
      { name: "Islay", point: [-6.24, 55.76], kind: "protected", character: "Peat smoke · maritime savor", detail: "Famous for heavily peated malts, yet individual distilleries and unpeated releases make smoke an important tendency—not a rule.", distillery: { name: "Laphroaig Distillery", point: [-6.15, 55.63], image: "/bottles/laphroaig.webp" } },
      { name: "Campbeltown", point: [-5.63, 55.39], kind: "protected", character: "Salt · smoke · fruit · toffee", detail: "A compact locality known for robust, layered whiskies with oily, coastal and fruit-driven variations.", distillery: { name: "Springbank Distillery", point: [-5.608, 55.425], image: "/bottles/springbank.png" } },
    ],
    source: { label: "UK Scotch Whisky product specification", url: "https://www.gov.uk/protected-food-drink-names/scotch-whisky" },
  },
  "brandy:Cognac": {
    introduction: "Cognac is made inside a delimited area centered on Charente and Charente-Maritime. Its six crus describe where the grapes grew. Soil, distillation choices, cellar climate, oak and blending all influence the final eau-de-vie.",
    ingredient: {
      name: "Ugni Blanc",
      scientificName: "Vitis vinifera · Ugni Blanc",
      description: "Ugni Blanc accounts for about 98% of Cognac vines. Its high acidity, relatively low alcohol and disease resistance make a restrained base wine that is well suited to distillation and long maturation.",
      image: "/ingredients/ugni-blanc.png",
      imageAlt: "Pale Ugni Blanc grapes growing over chalky vineyard soil",
      fact: "The base wine is not designed as a rich table wine; acidity and subtle aroma help it survive two distillations and years in oak.",
      varieties: [
        {
          name: "Ugni Blanc",
          scientificName: "Vitis vinifera",
          role: "More than 98% of Cognac vineyards",
          description: "High acidity, low sugar and a restrained profile make the benchmark distillation wine: delicate, floral and built to age.",
          image: "/ingredients/ugni-blanc.png",
          imageAlt: "Pale Ugni Blanc grapes on a vine",
        },
        {
          name: "Folle Blanche",
          scientificName: "Vitis vinifera",
          role: "Historic · now less than 1%",
          description: "The pre-phylloxera mainstay survives in small plantings and can give balanced eau-de-vie with vivid, powerful aromatics.",
          image: "/ingredients/folle-blanche.jpg",
          imageAlt: "A ripe cluster of Folle Blanche grapes",
          credit: { label: "Photo · Pancrat / CC BY-SA", url: "https://commons.wikimedia.org/wiki/File:Folle_blanche_raisin.jpg" },
        },
        {
          name: "Colombard",
          scientificName: "Vitis vinifera",
          role: "Aromatic blending variety",
          description: "Naturally high acidity and stronger fruit aromatics make Colombard a useful blending counterpoint to neutral Ugni Blanc.",
          image: "/ingredients/colombard.jpg",
          imageAlt: "A ripe cluster of Colombard grapes",
          credit: { label: "Photo · Pancrat / CC BY-SA", url: "https://commons.wikimedia.org/wiki/File:Colombard_raisin.jpg" },
        },
      ],
    },
    mapTitle: "The six official Cognac crus",
    mapNote: "The map uses an accurate outline of metropolitan France with orientation markers for the six crus; it does not invent cadastral cru polygons. Fine Champagne is not a seventh cru: it is a blend of Grande and Petite Champagne, with at least 50% Grande Champagne.",
    mapFocus: ["France"],
    zones: [
      { name: "Grande Champagne", point: [-0.31, 45.61], kind: "protected", character: "Floral finesse · long aging", detail: "Deep chalk and limestone are associated with fine, fragrant eaux-de-vie that can require long maturation to show their full range." },
      { name: "Petite Champagne", point: [-0.25, 45.48], kind: "protected", character: "Floral · supple · earlier development", detail: "Chalky soils also support fine eau-de-vie, generally described as reaching maturity sooner than Grande Champagne." },
      { name: "Borderies", point: [-0.38, 45.79], kind: "protected", character: "Violet · nutty roundness", detail: "The smallest cru is often associated with rounded texture, floral perfume and distinctive violet-like notes." },
      { name: "Fins Bois", point: [-0.52, 45.72], kind: "protected", character: "Fresh fruit · approachable maturity", detail: "A large, varied ring around the central crus, commonly linked with fruity eaux-de-vie that mature relatively quickly." },
      { name: "Bons Bois", point: [-0.72, 45.8], kind: "protected", character: "Rustic fruit · structure", detail: "More varied soils and greater coastal influence can produce robust, direct fruit and a broader-grained style." },
      { name: "Bois Ordinaires", point: [-1.08, 45.85], kind: "protected", character: "Coastal · direct · maritime", detail: "The outer coastal and island areas can show pronounced maritime influence and straightforward fruit character." },
    ],
    styles: [
      { name: "Fine Champagne", character: "A blend designation", detail: "Only Grande and Petite Champagne eaux-de-vie are permitted, and Grande Champagne must make up at least half of the blend." },
    ],
    source: { label: "Bureau National Interprofessionnel du Cognac", url: "https://www.cognac.fr/en/discover/the-cognac-region/cognac-crus/" },
  },
  "brandy:Armagnac": {
    introduction: "Armagnac is Gascony's protected wine spirit. Ten grape varieties are authorized, but four account for the varieties most regularly used; they meet three production zones whose soils and climate shift from west to east.",
    ingredient: {
      name: "Armagnac's four principal grapes",
      scientificName: "Vitis species and crosses",
      description: "Ugni Blanc supplies dependable acidity, Baco 22A brings a uniquely Gascon hybrid voice, Folle Blanche carries the historic floral line, and Colombard adds exuberant fruit. The producer can distill and blend them separately or together.",
      fact: "The appellation permits ten varieties. These four are the widely and regularly used core—not a closed list of everything legally possible.",
      varieties: [
        {
          name: "Ugni Blanc",
          scientificName: "Vitis vinifera",
          role: "Most widely planted",
          description: "Acidic, low-alcohol base wines distill into fine, precise eaux-de-vie and adapt well across all three Armagnac terroirs.",
          image: "/ingredients/ugni-blanc.png",
          imageAlt: "Pale Ugni Blanc grapes on a vine",
        },
        {
          name: "Baco 22A",
          scientificName: "Folle Blanche × Noah",
          role: "Armagnac signature · especially Bas-Armagnac",
          description: "France's distinctive permitted hybrid is prized on sandy soils for roundness, ripe-fruit depth and an affinity for long aging.",
          image: "/ingredients/baco-22a.png",
          imageAlt: "Illustrative close-up of pale Baco 22A grapes on the vine",
          credit: { label: "Illustrative botanical reference · AI-generated" },
        },
        {
          name: "Folle Blanche",
          scientificName: "Vitis vinifera",
          role: "Historic and rare",
          description: "The pre-phylloxera grape gives fine, elegant and often floral spirit, especially expressive in Blanche and young Armagnac.",
          image: "/ingredients/folle-blanche.jpg",
          imageAlt: "A ripe cluster of Folle Blanche grapes",
          credit: { label: "Photo · Pancrat / CC BY-SA", url: "https://commons.wikimedia.org/wiki/File:Folle_blanche_raisin.jpg" },
        },
        {
          name: "Colombard",
          scientificName: "Vitis vinifera",
          role: "Fruit-forward accent",
          description: "The least used of the principal four contributes strong fruit and lift, often as an aromatic component rather than the whole composition.",
          image: "/ingredients/colombard.jpg",
          imageAlt: "A ripe cluster of Colombard grapes",
          credit: { label: "Photo · Pancrat / CC BY-SA", url: "https://commons.wikimedia.org/wiki/File:Colombard_raisin.jpg" },
        },
      ],
    },
    mapTitle: "Armagnac's three production zones",
    mapNote: "The accurate France outline establishes national context; the three labels orient the western, central and eastern Armagnac zones without pretending that point markers are legal boundary polygons.",
    mapFocus: ["France"],
    zones: [
      { name: "Bas-Armagnac", point: [-0.18, 43.86], kind: "protected", character: "Tawny sands · light, fruity finesse", detail: "The western zone spans parts of Landes and Gers. Acidic, low-alcohol wines and sandy, iron-tinged soils are associated with delicate, highly reputed eaux-de-vie." },
      { name: "Armagnac-Ténarèze", point: [0.34, 43.93], kind: "protected", character: "Clay-limestone · structure", detail: "The central transition zone combines boulbènes with heavier terreforts, commonly giving fuller-bodied spirit that rewards long aging." },
      { name: "Haut-Armagnac", point: [0.73, 43.67], kind: "protected", character: "Limestone hills · sparse vineyards", detail: "The spread-out southern and eastern zone has clay-limestone hills and relatively limited vineyard area today." },
    ],
    source: { label: "Bureau National Interprofessionnel de l'Armagnac", url: "https://armagnac.fr/grape-varieties-and-terroirs" },
  },
  "agave:Tequila": {
    introduction: "Tequila has one required agave species and a legally authorized production territory. Within Jalisco, the Tequila Valley and Los Altos are useful growing-landscape lenses, but they are not separate legal tequila classes.",
    ingredient: {
      name: "Blue Weber agave",
      scientificName: "Agave tequilana Weber var. azul",
      description: "Blue agave is the only agave permitted for tequila. The plant commonly spends five to eight years in the field before jimadores remove its leaves and harvest the sugar-rich heart for cooking.",
      image: "/ingredients/blue-agave.png",
      imageAlt: "Mature blue Weber agave plants growing in red Jalisco soil",
      fact: "“100% agave” tequila uses only blue-agave sugars; the broader tequila category must use at least 51% blue-agave sugars.",
    },
    mapTitle: "Two Jalisco landscapes—and the wider denomination",
    mapNote: "Highlands and Valley are trade and terroir language, not separate classes in the tequila standard. Authorized municipalities also extend beyond Jalisco into Guanajuato, Michoacán, Nayarit and Tamaulipas.",
    zones: [
      { name: "Los Altos · Highlands", point: [-102.72, 20.82], kind: "traditional", character: "Ripe fruit · floral lift", detail: "Higher elevation and iron-rich red soils are often discussed alongside sweeter fruit and floral impressions, though producer method remains decisive." },
      { name: "Tequila Valley", point: [-103.84, 20.88], kind: "traditional", character: "Cooked agave · pepper · earth", detail: "The volcanic valley around Tequila is often associated with earthy, herbal and peppery expressions." },
      { name: "Other authorized areas", point: [-101.8, 20.5], kind: "protected", character: "Legally included · locally varied", detail: "The denomination includes named municipalities outside Jalisco; geography alone does not predict one flavor profile." },
    ],
    styles: [
      { name: "Blanco", character: "Agave · citrus · pepper", detail: "Direct from the still or briefly rested, keeping cooked-agave and production character most visible." },
      { name: "Reposado", character: "Agave + gentle oak", detail: "At least two months in oak or holm-oak vessels, adding vanilla and spice without necessarily hiding the plant." },
      { name: "Añejo", character: "Vanilla · dried fruit · oak spice", detail: "At least one year in oak or holm-oak casks no larger than 600 L." },
      { name: "Extra añejo", character: "Deep oak · cacao · cooked fruit", detail: "At least three years in direct contact with oak or holm oak." },
    ],
    source: { label: "Consejo Regulador del Tequila", url: "https://www.crt.org.mx/en/our-tequila/" },
  },
};

export function getSubtypeTargetId(categoryId: string, subtypeName: string) {
  const slug = subtypeName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${categoryId}-${slug}`;
}

export function getSubtypeDeepDive(categoryId: string, subtype: SubtypeGuide): SubtypeDeepDiveData {
  const key = `${categoryId}:${subtype.name}`;
  const specific = curated[key];
  if (specific) return specific;

  const ingredient = categoryIngredients[categoryId] ?? categoryIngredients.flavoured;
  const zones: DeepDiveZone[] = subtype.region
    ? [{ ...subtype.region, character: subtype.style, detail: subtype.law }]
    : [];

  return {
    introduction: `${subtype.name} is best understood by separating raw material, production method, legal identity and maturation. ${subtype.style}`,
    ingredient,
    mapTitle: zones.length ? "Where this identity is rooted" : "Method-led rather than map-led",
    mapNote: zones.length
      ? "This marker shows the named production origin or tradition. It is an orientation point, not a claim that one place produces only one flavor."
      : "This subtype has no single truthful internal regional map. Its most useful subdivisions come from recipe, extraction, distillation or maturation rather than geography.",
    zones,
  };
}
