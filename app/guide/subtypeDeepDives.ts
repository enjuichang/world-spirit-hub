import type { MapRegion, SubtypeGuide } from "../guideData";
import subtypeExpansion from "../../data/subtype-expansion.json";
import additionalSubtypeExpansion from "../../data/additional-subtype-expansion.json";

export type DeepDiveZone = MapRegion & {
  character: string;
  detail: string;
  source?: { label: string; url: string };
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
    image: "/ingredients/malted-barley.png",
    imageAlt: "Malted barley grains and barley ears on a traditional malting floor",
  },
  brandy: {
    name: "Fermented fruit",
    description: "Brandy begins with wine, cider, pomace or another fermented fruit. Variety, ripeness, acidity, pressing and lees determine what the still has available to concentrate.",
    fact: "A protected brandy name often narrows both the permitted fruit and the place where it must be grown or transformed.",
    image: "/ingredients/ugni-blanc.png",
    imageAlt: "Pale wine grapes growing over vineyard soil",
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
    image: "/ingredients/blue-agave.png",
    imageAlt: "Mature blue agave plants growing in red soil",
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

const originalExpandedProducers = subtypeExpansion as unknown as Record<string, ExpansionTuple[]>;
const additionalExpandedProducers = additionalSubtypeExpansion as unknown as Record<string, ExpansionTuple[]>;
const expandedProducers = Object.fromEntries(
  [...new Set([...Object.keys(originalExpandedProducers), ...Object.keys(additionalExpandedProducers)])].map((key) => [
    key,
    [...(originalExpandedProducers[key] ?? []), ...(additionalExpandedProducers[key] ?? [])],
  ]),
) as Record<string, ExpansionTuple[]>;

const supplementalProducers: Record<string, ExpansionTuple[]> = {
  "whisky:American single malt whiskey": [
    ["westland", "Westland Distillery", "Seattle, Washington", "United States", -122.33, 47.56, "Pacific Northwest single-malt distillery exploring local barley and peat", "malt", "chocolate", "coffee", "https://westlanddistillery.com/pages/about"],
    ["balcones", "Balcones Distilling", "Waco, Texas", "United States", -97.13, 31.55, "Texas pot-still single malt shaped by a hot maturation climate", "malt", "baked fruit", "cinnamon", "https://www.balconesdistilling.com/news/balcones-1-texas-single-malt-for-moments-worth-savoring"],
    ["stranahans", "Stranahan’s Colorado Whiskey Distillery", "Denver, Colorado", "United States", -105, 39.72, "Rocky Mountain single malt made from malted barley", "malt", "caramel", "oak spice", "https://stranahans.com/"],
  ],
  "agave:Texas sotol-style spirit": [
    ["desert-door", "Desert Door Distillery", "Driftwood, Texas", "United States", -98.039, 30.129, "Texas distillery working with locally harvested Dasylirion", "desert herbs", "grass", "mineral", "https://www.desertdoor.com/the-distillery"],
    ["marfa-spirit", "Marfa Spirit Co.", "Marfa, Texas", "United States", -104.021, 30.309, "Far West Texas producer interpreting desert-spirit traditions", "earth", "pepper", "desert plants", "https://marfaspirit.com/"],
    ["chihuahuan-desert", "Chihuahuan Desert growing area", "West Texas", "United States", -103.45, 30.75, "The wider desert landscape where wild Dasylirion supplies the defining raw material", "grass", "cucumber", "dry earth", "https://www.desertdoor.com/"],
  ],
};

const studySource = {
  label: "WSET Level 3 Award in Spirits specification",
  url: "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf",
};

const agaveDenominationFocus: Record<string, string[]> = {
  Tequila: ["Tequila DO"],
  Mezcal: ["Mezcal DO"],
  "Ancestral mezcal": ["Mezcal DO"],
  Bacanora: ["Bacanora DO"],
  Raicilla: ["Raicilla DO"],
  Sotol: ["Sotol DO"],
};

const methodLenses: Record<string, DeepDiveStyle> = {
  whisky: { name: "Fermentation, still and cask", character: "Three independent flavor levers", detail: "Fermentation builds fruit and texture, still design selects congeners, and cask history adds extraction, oxidation and time. Geography never replaces those production details." },
  brandy: { name: "Fruit, cut points and maturation", character: "Preserve fruit or build aged complexity", detail: "Fruit variety and base-wine condition set the aroma; still type and cut points control concentration; resting or oak moves the spirit toward spice, nuts and rancio." },
  rum: { name: "Fermentation and still architecture", character: "From clean to intensely ester-led", detail: "Fermentation length and microbiology create congeners before pot stills, columns and blending determine how much weight and aroma remain." },
  agave: { name: "Cooking, crushing and fermentation", character: "Plant character transformed by heat", detail: "Oven or pit, crushing method, fermentation vessel and still material can shift the same plant from bright and vegetal to roasted, smoky, lactic or mineral." },
  gin: { name: "Botanical extraction", character: "Macerate, vapor-infuse or compound", detail: "Recipe matters, but so does extraction: steeping can build weight, vapor infusion can preserve lift, and post-distillation additions change the legal and sensory result." },
  vodka: { name: "Rectification, filtration and proofing", character: "Purity with deliberate texture", detail: "Distillation proof controls congener retention; filtration edits the spirit; water chemistry and bottling strength determine much of the final weight and finish." },
  asian: { name: "Conversion culture and fermentation", character: "Microbiology is part of the identity", detail: "Qu, kōji or nuruk convert starch while building aroma. Substrate, vessel, temperature and whether fermentation is solid, semi-solid or liquid fundamentally change the spirit." },
  flavoured: { name: "Extraction and balance", character: "Aroma, bitterness, sugar and proof", detail: "Maceration, percolation, redistillation or direct flavor addition pull out different compounds; sweetness and alcohol then decide how those flavors land on the palate." },
};

function subtypeIngredient(categoryId: string, subtypeName: string): SubtypeDeepDiveData["ingredient"] {
  const base = categoryIngredients[categoryId] ?? categoryIngredients.flavoured;

  if (/single malt/i.test(subtypeName)) return {
    ...categoryIngredients.whisky,
    name: "Malted barley",
    scientificName: "Hordeum vulgare",
    description: "Malted barley supplies both starch and the enzymes needed to release fermentable sugar. Barley variety, malting specification, specialty malt and kilning shape cereal, fruit, chocolate and smoke before distillation.",
    fact: "“Single malt” means malt whisky from one distillery—not one field, one batch or one cask.",
  };
  if (subtypeName === "Bourbon" || subtypeName === "Tennessee whiskey") return {
    ...categoryIngredients.whisky,
    name: "Corn-led mash bill",
    scientificName: "Zea mays with secondary grains",
    description: "At least 51% corn provides fermentable starch and a round, sweet center. Rye, wheat and malted barley in the remainder redirect spice, softness and fermentation performance.",
    fact: "The mash bill and new charred oak work together: corn does not create vanilla or caramel on its own.",
  };
  if (subtypeName === "Rye whiskey") return {
    ...categoryIngredients.whisky,
    name: "Rye-led mash bill",
    scientificName: "Secale cereale with secondary grains",
    description: "At least 51% rye gives a viscous mash and a grain profile often read as peppery, herbal or dry. Corn, malt and process choices keep rye whiskey from being one fixed flavor.",
    fact: "Rye percentage is only the starting point; fermentation, entry proof and maturation time can be equally visible.",
  };
  if (subtypeName === "Pisco") return { ...base, name: "Aromatic and non-aromatic wine grapes", scientificName: "Vitis vinifera", description: "Permitted grape varieties differ between Peru and Chile. Muscat-family grapes can give overt flowers and citrus, while less aromatic varieties emphasize fresh grape, herbs and texture.", fact: "Country is essential label information: Peruvian and Chilean pisco follow different production and maturation rules." };
  if (subtypeName === "Grappa") return { ...base, name: "Fresh grape pomace", scientificName: "Vitis vinifera skins, seeds and pulp", description: "Grappa distills the moist marc left after winemaking. Grape variety, pomace freshness, storage and whether stems are present strongly affect floral, skin, seed and earthy aromas.", fact: "Pomace—not finished wine—is the defining raw material, separating grappa from wine brandy." };
  if (subtypeName === "Calvados") return { ...base, name: "Cider apples and pears", description: "Bittersweet, bittersharp, sweet and acidic apples are blended for fermentable sugar, tannin and freshness; some appellations also permit or emphasize perry pears.", fact: "The orchard blend is designed for cider and distillation, not simply copied from dessert-fruit varieties." };
  if (subtypeName === "Fruit eaux-de-vie") return { ...base, name: "Whole fermented fruit", description: "Pear, cherry, plum, raspberry and other fruits are fermented or macerated according to category rules, then distilled to retain a vivid varietal fingerprint.", fact: "A named fruit tells you more than the broad phrase eau-de-vie; some delicate berries require a different legal production route." };
  if (subtypeName === "Singani") return { ...base, name: "Moscatel of Alexandria", scientificName: "Vitis vinifera · Muscat of Alexandria", description: "This highly aromatic grape grown in Bolivia's elevated valleys gives a wine rich in floral, citrus-peel and fresh-grape precursors for distillation.", fact: "Altitude describes the growing landscape; the denomination also depends on authorized zones and Bolivian production rules." };
  if (/molasses/i.test(subtypeName)) return { ...base, name: "Cane molasses", description: "The concentrated by-product of sugar crystallization contains fermentable sugar plus minerals and compounds that support everything from clean short ferments to intensely aromatic long ones.", fact: "Molasses does not dictate a dark or heavy rum: fermentation, still and blending decide that." };
  if (categoryId === "rum") return { ...base, name: subtypeName === "Clairin" ? "Fresh cane juice or cane syrup" : "Fresh-pressed sugar-cane juice", description: "Fresh cane material preserves grassy, vegetal and mineral precursors that must be fermented soon after harvest. Cane variety, field conditions and microbial practice remain visible in expressive spirit.", fact: "Fresh juice is a raw-material identity; a protected place name adds the legal production boundary." };
  if (subtypeName === "Sotol" || subtypeName === "Texas sotol-style spirit") return { ...base, name: "Dasylirion", scientificName: "Dasylirion species", description: "The spiky desert plant stores fermentable fructans in its stem. Maturity, wild habitat, cooking and fermentation give grassy, resinous, earthy and lactic character.", fact: "Dasylirion is in the asparagus family but is not an agave; Mexican Sotol also carries a protected geographic identity." };
  if (subtypeName === "Bacanora") return { ...base, name: "Pacifica agave", scientificName: "Agave angustifolia var. pacifica", description: "This Sonoran agave is harvested after years in a dry landscape, then cooked, crushed, fermented and distilled in regional vinata traditions.", fact: "Species and Sonoran origin matter more than using smoke as a shortcut for identity." };
  if (subtypeName === "Raicilla") return { ...base, name: "Jalisco and Nayarit agaves", scientificName: "Agave maximiliana, A. inaequidens and other permitted species", description: "Mountain and coastal raicilla traditions work with different agaves whose maturity, roast and fermentation can produce pine, herbs, tropical fruit, cheese-like savor or smoke.", fact: "Raicilla is a denomination with multiple local traditions—not simply mezcal from western Mexico." };
  if (categoryId === "agave") return { ...base, name: "Permitted mature agave", scientificName: "Agave species named by the denomination", description: "Species, years to maturity, wild or cultivated origin and accumulated field sugars establish the raw flavor potential before cooking transforms the harvested hearts.", fact: "The label's agave species and village or state can be more predictive than the word smoky." };
  if (subtypeName === "Genever") return { ...base, name: "Malt wine and juniper", description: "A fermented grain mash supplies a malty, whiskey-like backbone while juniper and other botanicals layer aromatic lift. The malt-wine proportion is a key style signal.", fact: "Genever is not simply sweeter gin; its cereal-spirit foundation changes the architecture." };
  if (categoryId === "gin") return { ...base, name: "Juniper-led botanical recipe", scientificName: "Juniperus communis with recipe botanicals", description: "Juniper supplies pine, resin and citrus-like terpenes. Coriander, peel, roots, flowers, tea, fruit and local botanicals determine whether the recipe reads classic, floral, savory or contemporary.", fact: "Botanical dominance and extraction method explain more than the number of botanicals advertised." };
  if (subtypeName === "Potato vodka") return { ...base, name: "Potatoes", scientificName: "Solanum tuberosum", description: "Cooked potato starch must be enzymatically converted before fermentation. Yield is lower than with many grains, while careful distillation may preserve a broad, creamy or earthy texture.", fact: "Potato vodka can still be highly neutral; raw material does not override rectification and filtration." };
  if (categoryId === "vodka") return { ...base, name: /flavored|infused/i.test(subtypeName) ? "Vodka base plus declared flavor" : "Fermentable grain, potato or fruit", description: /flavored|infused/i.test(subtypeName) ? "A rectified vodka base carries fruit, herbs, spice or other declared ingredients through infusion, extract, essence or blending." : "The base material supplies alcohol and subtle texture before rectification. Wheat, rye, corn, potato and fruit can each be made quiet or deliberately characterful.", fact: /flavored|infused/i.test(subtypeName) ? "Read sweetness, color and flavor-source disclosures as well as the word vodka." : "Water, filtration and final proof often become as visible as the fermentable base." };
  if (/baijiu|Kaoliang/i.test(subtypeName)) return { ...base, name: /Rice-aroma/i.test(subtypeName) ? "Rice and small-qu" : "Sorghum and qu", description: /Rice-aroma/i.test(subtypeName) ? "Rice meets a saccharifying and fermenting small-qu culture, commonly in semi-solid or liquid fermentation that preserves a soft, floral grain profile." : "Sorghum is cooked and fermented with qu, a grain-based culture carrying enzymes, yeasts and bacteria. Repeated cycles and vessel ecology can matter as much as the grain itself.", fact: "Qu is simultaneously a conversion system, microbial starter and flavor-building ingredient." };
  if (subtypeName === "Honkaku shōchū") return { ...base, name: "A named base ingredient plus kōji", description: "Sweet potato, barley, rice, buckwheat, brown sugar and other permitted materials meet rice-, barley- or sweet-potato kōji before a single distillation preserves their identity.", fact: "The base ingredient and kōji type are the two most useful first questions when comparing honkaku shōchū." };
  if (subtypeName === "Awamori") return { ...base, name: "Indica rice and black kōji", scientificName: "Oryza sativa with Aspergillus luchuensis", description: "Long-grain indica rice is made entirely into black-kōji rice, providing both enzymes and citric-acid protection for Okinawa's warm fermentation climate.", fact: "All-kōji preparation and single batch distillation distinguish awamori from most shōchū." };
  if (/soju/i.test(subtypeName)) return { ...base, name: subtypeName === "Diluted soju" ? "Highly rectified neutral spirit" : "Grain and nuruk", description: subtypeName === "Diluted soju" ? "Neutral spirit made from agricultural starch is reduced with water and adjusted into a light, accessible final drink." : "Rice or other grains meet nuruk, a mixed microbial fermentation culture, before direct distillation retains cereal and fermentation character.", fact: "Diluted and directly distilled soju share a name but have fundamentally different production engines." };
  if (subtypeName === "Amari") return { ...base, name: "Bitter roots, bark, citrus and herbs", description: "Gentian, cinchona, rhubarb, wormwood, citrus peel, spices and local herbs may be extracted separately or together, then blended into a proprietary bittersweet profile.", fact: "Amaro is a style family, so ingredient disclosure and producer tradition are more useful than expecting one recipe." };
  if (subtypeName === "Aniseed spirits") return { ...base, name: "Anise and related aromatic seeds", scientificName: "Pimpinella anisum and recipe botanicals", description: "Aniseed supplies anethole, often alongside star anise, fennel or licorice. The oil dissolves at bottle strength and clouds when water is added.", fact: "The louche is a physical emulsion—not proof of added sugar or artificial color." };
  if (subtypeName === "Aquavit") return { ...base, name: "Caraway and/or dill", description: "Caraway brings earthy citrus and warm spice; dill gives fresher green aromatics. Citrus, fennel and cask influence broaden the protected and unprotected regional styles.", fact: "In the EU category, caraway or dill must provide the defining flavor." };
  if (subtypeName === "Cocktail bitters") return { ...base, name: "Concentrated bitter and aromatic botanicals", description: "Roots, bark, spices, citrus peel and herbs are extracted into a potent base designed to season a drink by the dash rather than function as a full pour.", fact: "Aromatic bitters and bitter liqueurs may share ingredients, but concentration and intended serving size are fundamentally different." };
  if (subtypeName === "Absinthe") return { ...base, name: "Wormwood, anise and fennel", scientificName: "Artemisia absinthium and aromatic botanicals", description: "The classic botanical triad combines bitter wormwood with anethole-rich anise and fennel, often joined by hyssop, lemon balm and other herbs in distillation or coloration.", fact: "Traditional dilution releases aromatic oils and softens high bottling strength; fire is not required." };
  return base;
}

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
    mapFocus: ["Tequila DO"],
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

  const ingredient = subtypeIngredient(categoryId, subtype.name);
  const producers = expandedProducers[key] ?? supplementalProducers[key] ?? [];
  const zones: DeepDiveZone[] = producers.length
    ? producers.map((producer) => {
        const [, name, place, , longitude, latitude, descriptor, ...rest] = producer;
        const [tagOne, tagTwo, tagThree, sourceUrl] = rest;
        return {
          name: place,
          point: [longitude, latitude],
          kind: subtype.region?.kind ?? "traditional",
          character: `${tagOne} · ${tagTwo} · ${tagThree}`,
          detail: `${descriptor}. This documented site shows one producer expression of ${subtype.name}; it is an example, not a boundary for the style.`,
          distillery: { name, point: [longitude, latitude] },
          source: { label: `Official ${name} site`, url: sourceUrl },
        };
      })
    : subtype.region
      ? [{ ...subtype.region, character: subtype.style, detail: subtype.law }]
      : [];
  const countries = [...new Set(producers.map((producer) => producer[3]))];
  const methodLens = methodLenses[categoryId] ?? methodLenses.flavoured;

  return {
    introduction: `${subtype.name} is a ${subtype.lawStatus.toLocaleLowerCase()} whose identity comes from the interaction of raw material, method, place and any maturation rules—not from one flavor stereotype. ${subtype.style}`,
    ingredient,
    mapTitle: producers.length ? `${subtype.name} production examples` : zones.length ? "Where this identity is rooted" : "Method-led rather than map-led",
    mapNote: producers.length
      ? `These ${producers.length} documented production sites give the atlas concrete geographic anchors${countries.length ? ` across ${countries.join(", ")}` : ""}. Markers identify producers, not legal boundaries or a complete directory.`
      : zones.length
        ? "This marker shows the named production origin or tradition. It is an orientation point, not a claim that one place produces only one flavor."
      : "This subtype has no single truthful internal regional map. Its most useful subdivisions come from recipe, extraction, distillation or maturation rather than geography.",
    mapFocus: categoryId === "agave" && agaveDenominationFocus[subtype.name]
      ? agaveDenominationFocus[subtype.name]
      : countries.length ? countries : undefined,
    zones,
    styles: [
      { name: "Legal identity", character: subtype.lawStatus, detail: subtype.law },
      methodLens,
      { name: "In the glass", character: "A tendency, never a guarantee", detail: subtype.style },
    ],
    source: studySource,
  };
}
