export type MapRegion = {
  name: string;
  point: [number, number];
  kind?: "protected" | "traditional" | "global";
  distillery?: {
    name: string;
    point: [number, number];
    image?: string;
  };
};

export type LabelTerm = {
  term: string;
  place: string;
  meaning: string;
  region?: MapRegion;
};

export type SubtypeGuide = {
  name: string;
  lawStatus: "Protected origin" | "Defined style" | "Traditional term" | "Broad style";
  law: string;
  style: string;
  region?: MapRegion;
};

export type BrandingTerm = {
  term: string;
  contrast: string;
  meaning: string;
  labelCue: string;
};

export type CategoryGuide = {
  categoryId: string;
  detail: string;
  process: string[];
  brandingTerms: BrandingTerm[];
  labelTerms: LabelTerm[];
  subtypes: SubtypeGuide[];
};

export const categoryGuides: CategoryGuide[] = [
  {
    categoryId: "whisky",
    detail:
      "Whisky starts with grain, but the name on the bottle may also encode a country, grain recipe, still type, cask rule or minimum age. Malted barley brings cereal and fruit; corn often reads round and sweet; rye brings spice. Fermentation builds aroma before the still concentrates it, while oak and climate reshape the spirit over years.",
    process: ["Mill & cook grain", "Convert starch", "Ferment wash", "Distill", "Mature & blend"],
    brandingTerms: [
      { term: "Single malt Scotch", contrast: "Blended Scotch", meaning: "Single malt comes from malted barley at one Scottish distillery. Blended Scotch combines one or more single malt whiskies with one or more single grain whiskies.", labelCue: "Single describes one distillery—not one cask. Blended describes the whisky categories brought together, not inferior quality." },
      { term: "Single cask", contrast: "Small batch", meaning: "Single-cask whisky is drawn from one identified cask. Small batch signals a limited vatting, but the phrase has no single universal batch-size definition.", labelCue: "Look for a cask number and bottle count when specificity matters." },
      { term: "Cask strength", contrast: "Standard strength", meaning: "Cask strength is bottled at or near the strength at which it leaves the cask; standard bottlings are normally reduced with water to a target ABV.", labelCue: "Cask strength does not automatically mean older, rarer or better—only less diluted." },
      { term: "Age statement", contrast: "No age statement", meaning: "A stated age generally refers to the youngest whisky in the bottle. No age statement, often shortened to NAS, gives the blender more freedom across mature stocks.", labelCue: "Age measures time, not quality; cask history and spirit character still matter." },
    ],
    labelTerms: [
      { term: "Scotch Whisky", place: "Scotland", meaning: "Made and matured in Scotland under the Scotch Whisky rules.", region: { name: "Scotland", point: [-4.2, 56.5], kind: "protected" } },
      { term: "Irish Whiskey", place: "Ireland", meaning: "Irish GI; normally matured at least three years on the island.", region: { name: "Ireland", point: [-8, 53.4], kind: "protected" } },
      { term: "Bourbon Whiskey", place: "United States", meaning: "At least 51% corn and aged in new charred oak; not limited to Kentucky.", region: { name: "United States", point: [-89, 38], kind: "traditional" } },
      { term: "Tennessee Whiskey", place: "Tennessee, USA", meaning: "State-linked American whiskey, commonly charcoal mellowed before maturation.", region: { name: "Tennessee", point: [-86, 35.7], kind: "protected" } },
      { term: "Japanese Whisky", place: "Japan", meaning: "Industry labeling standard ties qualifying whisky to Japanese water, distillation and maturation.", region: { name: "Japan", point: [138, 37], kind: "traditional" } },
      { term: "Taiwanese Single Malt", place: "Taiwan", meaning: "Single-distillery malt whisky shaped by Taiwan’s warm, humid maturation climate.", region: { name: "Taiwan", point: [121, 23.7], kind: "traditional" } },
      { term: "Indian Single Malt", place: "India", meaning: "Indian-made malt whisky whose regional grain and hot-climate maturation can be highly expressive.", region: { name: "India", point: [78, 20.6], kind: "traditional" } },
    ],
    subtypes: [
      { name: "Scotch whisky", lawStatus: "Protected origin", law: "The GI covers whisky made in Scotland, matured there for at least three years in oak casks no larger than 700 L and bottled at 40% ABV or more.", style: "Ranges from light grain whisky to fruity malt and heavily peated island styles; cask blending is central.", region: { name: "Scotland", point: [-4.2, 56.5], kind: "protected" } },
      { name: "Bourbon", lawStatus: "Defined style", law: "US whiskey from at least 51% corn, distilled to no more than 80% ABV, entered into new charred oak at no more than 62.5% ABV, without added flavor or color.", style: "Sweet corn, vanilla, caramel and char; rye or wheat in the remaining mash bill changes the spice/softness balance.", region: { name: "United States", point: [-89, 38], kind: "traditional" } },
      { name: "Rye whiskey", lawStatus: "Defined style", law: "US rye whiskey mirrors bourbon's key limits but requires at least 51% rye in the mash. “Straight” adds a minimum two-year maturation rule.", style: "Peppery, herbal and dry-edged, with new-oak vanilla and toast.", region: { name: "United States", point: [-98, 39], kind: "traditional" } },
      { name: "Tennessee whiskey", lawStatus: "Protected origin", law: "Must be made in Tennessee and meet applicable state and federal requirements; the Lincoln County Process is characteristic, with limited exceptions.", style: "Bourbon-like sweetness with a polished, charcoal-mellowed profile.", region: { name: "Tennessee", point: [-86, 35.7], kind: "protected" } },
      { name: "Irish whiskey", lawStatus: "Protected origin", law: "An Irish GI made on the island of Ireland and matured at least three years; categories include malt, grain, pot still and blended.", style: "Often fruit-forward and approachable; single pot still combines malted and unmalted barley for spice and texture.", region: { name: "Ireland", point: [-8, 53.4], kind: "protected" } },
      { name: "Canadian whisky", lawStatus: "Protected origin", law: "Canadian whisky must be mashed, distilled and aged in Canada in small wood for at least three years and bottled at 40% ABV or more.", style: "Frequently blended from separately distilled flavoring and base whiskies; light texture with rye-led spice.", region: { name: "Canada", point: [-106, 55], kind: "protected" } },
      { name: "Japanese whisky", lawStatus: "Traditional term", law: "The Japan Spirits & Liqueurs Makers Association standard is an industry labeling standard, not a national GI; members qualifying for the term follow Japanese production and maturation criteria.", style: "Precise, layered blends and malt whiskies, often balancing orchard fruit, incense-like oak and restrained smoke.", region: { name: "Japan", point: [138, 37], kind: "traditional" } },
      { name: "Taiwanese single malt whisky", lawStatus: "Broad style", law: "A country-and-production description rather than a protected global style: malt whisky is made at one Taiwanese distillery, while exact maturation and label rules depend on the market.", style: "Warm, humid warehouses accelerate extraction and evaporation, often emphasizing tropical fruit, vanilla, spice and active cask character.", region: { name: "Taiwan", point: [121, 23.7], kind: "traditional" } },
      { name: "Indian single malt whisky", lawStatus: "Broad style", law: "A country-and-production description for malt whisky from one Indian distillery; it is not governed by Scotch rules, and qualifying details should be checked on the label.", style: "Indian barley and hot maturation commonly produce concentrated malt, tropical fruit, spice and fast-developing oak character.", region: { name: "India", point: [78, 20.6], kind: "traditional" } },
      { name: "American single malt whiskey", lawStatus: "Defined style", law: "The U.S. standard requires 100% malted barley, mashing, distillation and maturation in the United States, production at one U.S. distillery, distillation to no more than 80% ABV, oak casks no larger than 700 L and bottling at 40% ABV or more.", style: "Malt-led American whiskey ranging from cereal and chocolate to fruit and smoke, with climate, specialty malt and new or used oak creating broad regional variation.", region: { name: "United States", point: [-98, 39], kind: "traditional" } },
    ],
  },
  {
    categoryId: "brandy",
    detail:
      "Brandy preserves fruit through fermentation and distillation. The fruit, whether whole, pressed wine or pomace, determines the aromatic starting point. A label may identify a broad category such as grape brandy, a protected place such as Cognac, or a raw-material tradition such as grappa. Still choice and oak decide whether fruit stays vivid or develops spice, nuts and rancio.",
    process: ["Harvest fruit", "Press or crush", "Ferment", "Distill", "Rest, age or blend"],
    brandingTerms: [
      { term: "VS", contrast: "VSOP / XO", meaning: "On Cognac, these are regulated age categories based on the youngest eau-de-vie in the blend. VSOP requires older stock than VS, and XO older stock than VSOP.", labelCue: "The letters are category shorthand, not a vintage or a tasting score." },
      { term: "Fine Champagne", contrast: "Champagne", meaning: "Fine Champagne Cognac is a blend from Grande Champagne and Petite Champagne crus, with at least half from Grande Champagne. It is unrelated to sparkling wine.", labelCue: "On a Cognac label, Champagne names chalky growing crus within the Cognac region." },
      { term: "Brandy", contrast: "Pomace spirit", meaning: "Brandy is generally distilled from wine or fermented fruit. Pomace spirits such as grappa distill the skins, seeds and stems left after pressing.", labelCue: "Read the raw material: wine, fruit or marc/pomace points to a different aromatic base." },
      { term: "Vintage", contrast: "Age designation", meaning: "Vintage names a harvest year where the category permits it. An age designation communicates maturation class or minimum age without tying the contents to one harvest.", labelCue: "Rules differ sharply by origin, so pair the term with the protected place on the label." },
    ],
    labelTerms: [
      { term: "Cognac", place: "Charente, France", meaning: "Protected grape brandy from the Cognac delimited region.", region: { name: "Cognac", point: [-0.3, 45.7], kind: "protected" } },
      { term: "Armagnac", place: "Gascony, France", meaning: "Protected brandy commonly associated with continuous Armagnac stills.", region: { name: "Armagnac", point: [0.1, 43.8], kind: "protected" } },
      { term: "Calvados", place: "Normandy, France", meaning: "Protected cider or perry spirit from defined Norman areas.", region: { name: "Normandy", point: [0, 49.1], kind: "protected" } },
      { term: "Grappa", place: "Italy", meaning: "Italian grape-marc spirit: the raw material is pomace, not wine.", region: { name: "Italy", point: [12.5, 42.8], kind: "protected" } },
      { term: "Pisco", place: "Peru / Chile", meaning: "Two distinct national denominations with different permitted methods.", region: { name: "Pacific South America", point: [-73, -23], kind: "protected" } },
      { term: "Singani", place: "Bolivia", meaning: "Bolivian denomination for grape spirit from authorized high valleys, made from Moscatel of Alexandria.", region: { name: "Bolivian high valleys", point: [-64.7, -21.5], kind: "protected" } },
      { term: "Potstill Brandy", place: "South Africa", meaning: "South African class made entirely from pot-still distillate and matured in oak.", region: { name: "Western Cape", point: [19, -33.5], kind: "traditional" } },
    ],
    subtypes: [
      { name: "Cognac", lawStatus: "Protected origin", law: "French GI for wine spirit from the Cognac area, using permitted grapes and prescribed distillation and aging; label age categories refer to the youngest eau-de-vie in the blend.", style: "Double pot distillation gives floral fruit and fine texture; long oak aging brings vanilla, spice and rancio.", region: { name: "Cognac", point: [-0.3, 45.7], kind: "protected" } },
      { name: "Armagnac", lawStatus: "Protected origin", law: "French GI from defined Gascon zones with permitted grapes, production methods and aging/label terms.", style: "Often single-distilled in a continuous Armagnac still: robust fruit, prune, spice and earthy complexity.", region: { name: "Armagnac", point: [0.1, 43.8], kind: "protected" } },
      { name: "Brandy de Jerez", lawStatus: "Protected origin", law: "Spanish GI requiring production and aging in the Jerez area under its specification, typically using a criaderas y solera system.", style: "Rich, rounded and cask-led, with dried fruit, walnut and sweet spice from seasoned Sherry casks.", region: { name: "Jerez", point: [-6.1, 36.7], kind: "protected" } },
      { name: "Pisco", lawStatus: "Protected origin", law: "Peru and Chile regulate separate pisco denominations; grapes, geographic zones, distillation strength and maturation permissions differ, so check country of origin.", style: "Aromatic and grape-driven; Peruvian styles are unaged, while Chilean rules permit resting or wood aging.", region: { name: "Peru & Chile", point: [-73, -23], kind: "protected" } },
      { name: "Grappa", lawStatus: "Protected origin", law: "EU GI for grape-marc spirit produced in Italy, San Marino or Ticino under the registered requirements.", style: "Pomace gives concentrated skins, seeds and floral notes; can be young and crystalline or oak-aged.", region: { name: "Italy", point: [12.5, 42.8], kind: "protected" } },
      { name: "Calvados", lawStatus: "Protected origin", law: "A family of Normandy appellations for cider/perry spirit, with rules varying by appellation for fruit origin, distillation and maturation.", style: "Apple and pear move from fresh peel and blossom toward baked fruit, spice and leather with age.", region: { name: "Normandy", point: [0, 49.1], kind: "protected" } },
      { name: "Fruit eaux-de-vie", lawStatus: "Broad style", law: "Usually an unsweetened fruit spirit; EU law defines fruit spirit categories, but the phrase eau-de-vie itself does not always signal one protected place.", style: "Unaged, intensely aromatic expressions of pear, cherry, plum, raspberry or other fruit.", region: { name: "Central Europe", point: [8, 47], kind: "traditional" } },
      { name: "Singani", lawStatus: "Protected origin", law: "Bolivia reserves the denomination for spirit distilled from fresh-grape wine, produced and bottled in authorized zones; implementing rules require Moscatel of Alexandria for the denomination.", style: "Unaged and highly aromatic, with orange blossom, fresh grape, citrus peel and peppery floral lift.", region: { name: "Bolivian high valleys", point: [-64.7, -21.5], kind: "protected" } },
      { name: "South African pot-still brandy", lawStatus: "Defined style", law: "South African potstill brandy is made entirely from pot-still wine distillate, double-distilled in copper and matured in oak for at least three years under national rules.", style: "Chenin Blanc or Colombard fruit meets vanilla, dried apricot, baking spice and polished oak, usually with a fuller texture than blended brandy.", region: { name: "Western Cape", point: [19, -33.5], kind: "traditional" } },
    ],
  },
  {
    categoryId: "rum",
    detail:
      "Rum can begin with molasses, cane syrup or fresh juice. Long, microbially diverse fermentations create pungent esters; cleaner fermentations and tall columns make lighter spirit. Pot and column distillates are frequently blended, then matured in tropical or continental climates. Regional words such as rhum, ron and rum are clues to language and tradition, not universal style guarantees.",
    process: ["Mill sugar cane", "Select juice/molasses", "Ferment", "Pot or column distill", "Blend, rest or age"],
    brandingTerms: [
      { term: "Rhum agricole", contrast: "Molasses rum", meaning: "Agricole is made from fresh cane juice, while most rum begins with molasses. The tightly defined Martinique AOC is more specific than the broad agricole style.", labelCue: "Rhum is French spelling; agricole and a qualifying origin tell you more about the raw material and rules." },
      { term: "White", contrast: "Dark", meaning: "Color does not map neatly to age. White rum may be unaged or charcoal-filtered after aging; dark color can come from cask maturation, blending or permitted coloring.", labelCue: "Seek an age statement, origin and production details before treating color as a maturity scale." },
      { term: "Overproof", contrast: "Navy strength", meaning: "Overproof broadly means bottled above a market's standard proof. Navy strength is a historic-style strength claim, commonly around 57% ABV, but not one globally harmonized rum category.", labelCue: "The printed ABV is the precise information; the branding phrase supplies context." },
      { term: "Solera", contrast: "Age statement", meaning: "Solera describes a fractional blending system containing stocks of different ages. A large solera number may not mean every drop spent that many years in wood.", labelCue: "Check whether the number is explicitly presented as a regulated age statement in the sales market." },
    ],
    labelTerms: [
      { term: "Rhum Agricole Martinique AOC", place: "Martinique", meaning: "Fresh-cane-juice rum under a detailed French appellation.", region: { name: "Martinique", point: [-61, 14.6], kind: "protected" } },
      { term: "Jamaica Rum", place: "Jamaica", meaning: "Geographical indication associated with Jamaican fermentation and distilling practice.", region: { name: "Jamaica", point: [-77.3, 18.1], kind: "protected" } },
      { term: "Cachaça", place: "Brazil", meaning: "Brazilian cane spirit with its own national identity and strength rules.", region: { name: "Brazil", point: [-51, -14], kind: "protected" } },
      { term: "Ron de Guatemala", place: "Guatemala", meaning: "Protected Central American origin with local production specifications.", region: { name: "Guatemala", point: [-90.2, 15.7], kind: "protected" } },
      { term: "Barbados Rum", place: "Barbados", meaning: "A place claim tied to Barbadian production; consult the current market specification.", region: { name: "Barbados", point: [-59.5, 13.2], kind: "traditional" } },
      { term: "Clairin", place: "Haiti", meaning: "Traditional Haitian cane spirit, usually tied closely to a village, cane variety and small distillery.", region: { name: "Haiti", point: [-72.3, 19], kind: "traditional" } },
    ],
    subtypes: [
      { name: "Molasses-based rum", lawStatus: "Broad style", law: "Rum definitions vary by market; EU and US standards both recognize fermented sugar-cane products, but additives and labeling treatment differ.", style: "From light column rum to dense pot-still spirit, depending on fermentation, still and blending.", region: { name: "Caribbean & Americas", point: [-70, 18], kind: "traditional" } },
      { name: "Cane-juice rum", lawStatus: "Broad style", law: "Fresh cane juice is a raw-material description; legal protection comes only when paired with a qualifying GI or national category.", style: "Grassy, vegetal and vivid, often showing olive, citrus and pepper.", region: { name: "French Caribbean", point: [-61, 15], kind: "traditional" } },
      { name: "Rhum agricole", lawStatus: "Traditional term", law: "Agricole denotes cane-juice production; “Rhum Agricole Martinique” is the tightly defined AOC, while other origins follow their own rules.", style: "Fresh cane, herbs, flowers and mineral/earthy tones; white and oak-aged forms are common.", region: { name: "Martinique & Guadeloupe", point: [-61, 15.5], kind: "protected" } },
      { name: "Jamaican rum", lawStatus: "Protected origin", law: "Jamaica Rum is a protected geographical indication with a production specification; genuine origin matters more than a generic 'Jamaican style' claim.", style: "High-ester fruit, overripe banana, pineapple and savory funk, often built through long fermentation and pot distillation.", region: { name: "Jamaica", point: [-77.3, 18.1], kind: "protected" } },
      { name: "Cuban-style rum", lawStatus: "Broad style", law: "“Cuban style” is a trade/style phrase outside qualifying Cuban origin; it is not a universal production standard.", style: "Light-bodied, clean column distillate shaped by charcoal filtration, blending and restrained oak.", region: { name: "Cuba", point: [-79.5, 22], kind: "traditional" } },
      { name: "Cachaça", lawStatus: "Protected origin", law: "Brazilian geographical indication/national category distilled from fermented fresh cane juice within prescribed alcoholic-strength parameters.", style: "Cane, banana and pepper; native Brazilian woods can give distinctive herbal, resinous or spice notes.", region: { name: "Brazil", point: [-51, -14], kind: "protected" } },
      { name: "Clairin", lawStatus: "Traditional term", law: "Clairin is a Haitian cane-spirit tradition rather than one harmonized international category; producer and village names are crucial guides to raw material and method.", style: "Wildly expressive fresh cane or cane-syrup spirit, with olive, brine, grass, ripe fruit and fermentation-derived savor from long local fermentations.", region: { name: "Haiti", point: [-72.3, 19], kind: "traditional" } },
    ],
  },
  {
    categoryId: "agave",
    detail:
      "These spirits begin in the field. Agave may take six years or several decades to mature, concentrating sugars in its heart. Cooking converts stored fructans, crushing releases juice and fibers, and open or closed fermentations add local microbial character. Species, village, roasting method, fibers in the still and proofing choices can be as expressive as oak.",
    process: ["Grow & select plants", "Harvest hearts", "Cook & crush", "Ferment", "Distill & rest"],
    brandingTerms: [
      { term: "100% agave tequila", contrast: "Tequila", meaning: "Both are genuine tequila. The 100% agave category uses only blue-agave sugars; the other category may include permitted non-agave sugars and is often called mixto in conversation.", labelCue: "If the bottle does not say 100% de agave, do not assume all fermentable sugar came from agave." },
      { term: "Blanco", contrast: "Reposado / Añejo", meaning: "Blanco is unaged or briefly rested; reposado spends at least two months in oak; añejo matures at least one year in smaller oak vessels under tequila rules.", labelCue: "These are maturation classes, not sweetness or quality rankings." },
      { term: "Mezcal artesanal", contrast: "Mezcal ancestral", meaning: "These regulated production classes differ in permitted cooking, crushing, fermentation and distillation tools. Ancestral is the narrower, more traditional equipment set.", labelCue: "The class explains method; the agave species, village and producer explain much of the individual spirit." },
      { term: "Joven", contrast: "Madurado en vidrio", meaning: "Joven mezcal is unaged. Madurado en vidrio rests in glass for at least the specified period under the denomination rather than taking flavor from wood.", labelCue: "Joven means young, not automatically smoky; glass maturation changes integration more than color." },
    ],
    labelTerms: [
      { term: "Tequila", place: "Jalisco + authorized areas", meaning: "Protected Mexican denomination, principally made from blue agave.", region: { name: "Tequila DO", point: [-103.7, 20.7], kind: "protected" } },
      { term: "Mezcal", place: "Authorized Mexican states", meaning: "Protected denomination covering permitted agaves and certified methods.", region: { name: "Mezcal DO", point: [-96.7, 17], kind: "protected" } },
      { term: "Mezcal Ancestral", place: "Authorized Mexican states", meaning: "A regulated mezcal production class using ancestral tools and direct-fire still traditions.", region: { name: "Mezcal DO", point: [-96.7, 17], kind: "protected" } },
      { term: "Bacanora", place: "Sonora", meaning: "Sonoran agave-spirit denomination.", region: { name: "Sonora", point: [-110.8, 29.3], kind: "protected" } },
      { term: "Raicilla", place: "Jalisco / Nayarit", meaning: "Protected western-Mexican agave-spirit denomination.", region: { name: "Raicilla DO", point: [-105, 20.5], kind: "protected" } },
      { term: "Sotol", place: "Northern Mexico", meaning: "Denomination made from Dasylirion, a different plant family from agave.", region: { name: "Sotol DO", point: [-106.5, 28], kind: "protected" } },
    ],
    subtypes: [
      { name: "Tequila", lawStatus: "Protected origin", law: "Mexican denomination made in authorized territory from Agave tequilana Weber blue variety. “100% agave” and tequila made with permitted non-agave sugars are distinct label categories.", style: "Steam/oven cooking often gives clean cooked-agave, citrus and pepper; diffuser, tahona and fermentation choices broaden the range.", region: { name: "Jalisco + authorized areas", point: [-103.7, 20.7], kind: "protected" } },
      { name: "Mezcal", lawStatus: "Protected origin", law: "Mexican denomination made in certified municipalities from permitted agave species. Category and class terms on label describe methods and maturation.", style: "Often earth-roasted and small-scale, but smoke is only one note among agave, fruit, herbs, clay and minerals.", region: { name: "Authorized Mexican states", point: [-96.7, 17], kind: "protected" } },
      { name: "Ancestral mezcal", lawStatus: "Defined style", law: "Within the Mezcal denomination, ‘Ancestral’ is a regulated production class built around pit cooking, manual or animal-powered crushing, natural-material fermentation vessels and direct-fire clay or wood stills.", style: "Clay, fruit, roasted agave, earth and smoke often meet a soft, textured palate; village, agave species and maker remain more informative than smoke level alone.", region: { name: "Authorized Mexican states", point: [-96.7, 17], kind: "protected" } },
      { name: "Bacanora", lawStatus: "Protected origin", law: "Sonoran denomination with a defined production territory and Mexican standard; commonly based on Agave angustifolia.", style: "Dry, herbal and mineral with roasted agave and desert scrub notes.", region: { name: "Sonora", point: [-110.8, 29.3], kind: "protected" } },
      { name: "Raicilla", lawStatus: "Protected origin", law: "Mexican denomination covering specified municipalities in Jalisco and Nayarit, with permitted agaves and methods.", style: "Coastal versions can be lush and fruity; mountain versions often read herbal, peppery and mineral.", region: { name: "Jalisco & Nayarit", point: [-105, 20.5], kind: "protected" } },
      { name: "Sotol", lawStatus: "Protected origin", law: "Mexican denomination for spirit made from Dasylirion in Chihuahua, Coahuila and Durango; botanically it is not agave.", style: "Grassy, resinous and earthy, sometimes with smoke and lactic fermentation character.", region: { name: "Northern Mexico", point: [-106.5, 28], kind: "protected" } },
      { name: "Texas sotol-style spirit", lawStatus: "Broad style", law: "A U.S.-made spirit distilled from Dasylirion. It sits outside Mexico’s protected Sotol denomination, so its identity comes from raw material and production method rather than that geographic name.", style: "Fresh desert herbs, grass, cucumber, earth and pepper, often cleaner and less smoke-led than pit-roasted northern Mexican Sotol.", region: { name: "Texas", point: [-102, 31], kind: "traditional" } },
    ],
  },
  {
    categoryId: "gin",
    detail:
      "Gin is defined by juniper, then differentiated by how botanicals meet the spirit. Distillers may steep botanicals in neutral spirit, suspend them in vapor, distill components separately or combine techniques. Citrus, coriander, roots, flowers and local plants shape the architecture, but a regional-looking phrase is not automatically a geographic protection.",
    process: ["Choose base spirit", "Build botanical recipe", "Macerate or vapor-infuse", "Redistill", "Blend & dilute"],
    brandingTerms: [
      { term: "London Dry", contrast: "Distilled gin", meaning: "London Dry is a stricter production standard within distilled gin, with tight limits on sweetening and additions after distillation. Neither phrase requires production in London.", labelCue: "London Dry communicates method and dryness; a place claim needs separate evidence." },
      { term: "Old Tom", contrast: "Dry gin", meaning: "Old Tom is a historical style commonly rounder or sweeter than dry gin, but it has no single global recipe and may be rested in wood.", labelCue: "Treat Old Tom as a style signal, then check sweetness, cask and producer notes." },
      { term: "Navy strength", contrast: "Standard strength", meaning: "Navy strength is a high-proof style claim commonly bottled around 57% ABV. Standard-strength gin is diluted further for a lighter concentration.", labelCue: "Use the ABV for certainty; navy strength is not one harmonized worldwide category." },
      { term: "Compound gin", contrast: "Distilled gin", meaning: "Compound gin flavors spirit without redistilling all the botanicals with it. Distilled gin creates its defining botanical character through redistillation.", labelCue: "Both can be legitimate; the distinction is extraction method, not an automatic quality grade." },
    ],
    labelTerms: [
      { term: "London Dry Gin", place: "Method, not London", meaning: "A production standard: dry and distilled, without requiring London origin." },
      { term: "Plymouth Gin", place: "Plymouth, England", meaning: "Geographic name tied to production in Plymouth.", region: { name: "Plymouth", point: [-4.1, 50.4], kind: "protected" } },
      { term: "Genever / Jenever", place: "Benelux + defined areas", meaning: "Protected juniper-spirit traditions centered on malt wine.", region: { name: "Benelux", point: [4.8, 51.2], kind: "protected" } },
      { term: "Old Tom Gin", place: "Style term", meaning: "A historical style name; sweetness and aging are producer choices." },
      { term: "Barrel-aged Gin", place: "Style term", meaning: "Gin matured in wood; cask type and time are producer choices rather than one global standard." },
    ],
    subtypes: [
      { name: "London Dry Gin", lawStatus: "Defined style", law: "Under EU/UK-style definitions it is a distilled gin meeting strict limits on sweetening and post-distillation additions. It does not have to be made in London.", style: "Crisp, dry and juniper-forward, typically layered with citrus peel, coriander and roots." },
      { name: "Distilled gin", lawStatus: "Defined style", law: "Gin whose flavor is created by redistilling agricultural ethyl alcohol with juniper and other botanicals; rules vary by sales market.", style: "Broad spectrum from classic juniper-led to floral, citrus or spice-led recipes." },
      { name: "Contemporary gin", lawStatus: "Broad style", law: "A market/style term rather than a separate legal class; the product must still satisfy the applicable gin definition.", style: "Juniper remains present but cucumber, tea, flowers, local citrus or savory botanicals may lead." },
      { name: "Old Tom gin", lawStatus: "Traditional term", law: "Historical style term without one global legal recipe; sweetness, color and cask aging vary by producer and market.", style: "Rounder and often sweeter than London Dry, bridging malty genever and crisp dry gin." },
      { name: "Genever", lawStatus: "Protected origin", law: "Jenever/genever is protected in the EU for specified countries/regions and uses category-specific rules including malt-wine terminology.", style: "Maltier and more cereal-driven than most gin, with juniper integrated into a whiskey-like base.", region: { name: "Netherlands & Belgium", point: [4.8, 51.2], kind: "protected" } },
      { name: "Barrel-aged gin", lawStatus: "Broad style", law: "Wood maturation is a technique rather than a separate universal gin class. The spirit must still meet the applicable gin definition, while age statements and cask claims follow local labeling rules.", style: "Juniper and citrus gain vanilla, toast, tannin and spice; new oak can be forceful, while used or mixed woods preserve more botanical detail." },
    ],
  },
  {
    categoryId: "vodka",
    detail:
      "Vodka is more than absence. Highly rectified spirit can retain quiet signals of wheat, rye, potato, grape or other agricultural materials, while filtration, proofing water and mouthfeel become especially visible in a restrained profile. Labels that name a country or protected indication say more than a generic claim of purity or repeated distillation.",
    process: ["Prepare raw material", "Ferment", "Rectify", "Filter or rest", "Proof with water"],
    brandingTerms: [
      { term: "Potato vodka", contrast: "Grain vodka", meaning: "The terms identify fermentable raw material, not a guaranteed texture. Potato is often marketed as creamy and grain as crisp, but rectification, filtration and proofing can outweigh the base.", labelCue: "Raw material is a useful clue—never a complete tasting note." },
      { term: "Distilled multiple times", contrast: "Continuous rectification", meaning: "A stated number of distillations can reflect passes, still sections or marketing conventions. A modern column can perform many separation stages in one continuous run.", labelCue: "A larger number is not a universal purity or quality scale." },
      { term: "Filtered", contrast: "Unfiltered", meaning: "Filtration may use charcoal or other media to soften aroma and texture. Unfiltered or lightly filtered vodka aims to retain more raw-material character.", labelCue: "Repeated filtration describes process, but does not by itself predict smoothness." },
      { term: "Flavored", contrast: "Infused", meaning: "Flavored vodka is a regulated market category in many places. Infused describes steeping ingredients, but the final legal designation can still require flavor or composition wording.", labelCue: "Check for added sugar, flavor declarations and a statement of composition where required." },
    ],
    labelTerms: [
      { term: "Polska Wódka / Polish Vodka", place: "Poland", meaning: "Protected GI using specified Polish-grown raw materials and Polish production.", region: { name: "Poland", point: [19.2, 52.1], kind: "protected" } },
      { term: "Svensk Vodka", place: "Sweden", meaning: "Registered geographic indication for Swedish vodka.", region: { name: "Sweden", point: [15, 62], kind: "protected" } },
      { term: "Suomalainen Vodka", place: "Finland", meaning: "Registered geographic indication for Finnish vodka.", region: { name: "Finland", point: [26, 64], kind: "protected" } },
      { term: "Flavored Vodka", place: "Market-defined", meaning: "A flavored category; labeling and formula rules depend on jurisdiction." },
      { term: "Potato Vodka", place: "Raw-material term", meaning: "Vodka distilled from potatoes; a useful production clue, not a single protected origin." },
    ],
    subtypes: [
      { name: "Neutral vodka", lawStatus: "Defined style", law: "Definitions differ: US rules no longer rely on the old 'without distinctive character' phrase, while EU law sets its own raw-material and labeling framework.", style: "Very clean aroma with texture, proofing water and a faint pepper, cereal or citrus impression doing the work." },
      { name: "Characterful vodka", lawStatus: "Broad style", law: "A descriptive tasting phrase, not a universal legal category. Raw material may need disclosure in some markets when it is not cereal or potato.", style: "Preserves more grain, potato, fruit or creamy texture through distillation and lighter filtration." },
      { name: "Flavored vodka", lawStatus: "Defined style", law: "A recognized flavored type in major markets, subject to formula, designation and disclosure rules for added flavors or materials.", style: "From citrus and pepper to confectionery; sweetness and flavor intensity vary widely." },
      { name: "Infused vodka", lawStatus: "Broad style", law: "“Infused” describes a technique, not a single legal class; the final label may require a statement of composition depending on market.", style: "Fruit, herbs, tea or spice macerated into vodka, often giving natural color and a less uniform profile." },
      { name: "Potato vodka", lawStatus: "Broad style", law: "Potato identifies the agricultural raw material, not one universal production class. In the EU, vodka not made exclusively from cereals or potatoes must identify its other raw material, making potato a particularly meaningful label cue.", style: "Often broad, creamy and earthy with a weightier mid-palate than very neutral wheat or corn vodkas, though rectification and filtration can reduce those differences." },
    ],
  },
  {
    categoryId: "asian",
    detail:
      "Many East Asian grain spirits use mold cultures—qu, kōji or nuruk—to unlock starch while yeast makes alcohol. That single distinction opens radically different systems: solid-state pit fermentation and repeated batches for baijiu, single distillation for honkaku shōchū, black kōji and long-grain rice for awamori, and both traditional pot-distilled and modern diluted forms of soju.",
    process: ["Prepare grain/starch", "Inoculate culture", "Saccharify & ferment", "Distill", "Rest, age or dilute"],
    brandingTerms: [
      { term: "Strong aroma", contrast: "Sauce aroma", meaning: "These baijiu terms are regulated aroma families, not intensity scores. Strong aroma often emphasizes ester-rich fermented fruit; sauce aroma leans roasted, savory and layered.", labelCue: "Aroma family is the first decoding key; producer, region and age add the next layers." },
      { term: "Honkaku shōchū", contrast: "Kōrui shōchū", meaning: "Honkaku is single-distilled and preserves raw-material character. Kōrui is multiply distilled to a lighter, more neutral profile often used in mixed drinks.", labelCue: "Look for the Japanese category wording and the named base—barley, sweet potato, rice or another permitted material." },
      { term: "Distilled soju", contrast: "Diluted soju", meaning: "Distilled soju comes directly from a flavorful fermented base and still. Diluted soju blends highly rectified spirit with water and may include sweetening or flavor adjustments.", labelCue: "Bottle strength and price can hint at the style, but the production category is the reliable distinction." },
      { term: "Kusu", contrast: "Unaged awamori", meaning: "Kusu is aged awamori meeting defined age presentation rules, traditionally matured in ceramic. Younger awamori shows fresher rice, floral and earthy character.", labelCue: "An age claim on awamori speaks to time in storage, not wood-derived color." },
    ],
    labelTerms: [
      { term: "白酒 · Báijiǔ", place: "China", meaning: "Chinese grain spirit; aroma category words often appear alongside the name.", region: { name: "China", point: [104, 35], kind: "traditional" } },
      { term: "本格焼酎 · Honkaku Shōchū", place: "Japan", meaning: "Single-distilled shōchū made from permitted materials and processes.", region: { name: "Kyushu", point: [130.5, 32.3], kind: "traditional" } },
      { term: "琉球泡盛 · Ryūkyū Awamori", place: "Okinawa", meaning: "Okinawan GI/tradition using black kōji and indica rice.", region: { name: "Okinawa", point: [127.7, 26.3], kind: "protected" } },
      { term: "소주 · Soju", place: "Korea", meaning: "Covers both diluted modern products and traditional distilled expressions.", region: { name: "Korea", point: [127.8, 36], kind: "traditional" } },
      { term: "高粱酒 · Kaoliang", place: "Taiwan", meaning: "Sorghum spirit tradition especially associated with Kinmen and Matsu.", region: { name: "Taiwan’s offshore islands", point: [119.9, 25], kind: "traditional" } },
    ],
    subtypes: [
      { name: "Strong-aroma baijiu", lawStatus: "Defined style", law: "Chinese national/industry standards define baijiu and aroma categories; region-specific names may carry additional protection.", style: "Powerful pineapple, fermented fruit and savory notes from mud-pit fermentation and mixed-grain cycles.", region: { name: "Sichuan basin", point: [104.1, 30.7], kind: "traditional" } },
      { name: "Sauce-aroma baijiu", lawStatus: "Defined style", law: "A regulated Chinese aroma category; famous regional indications such as Kweichow Moutai add place-specific specifications.", style: "Layered umami, roasted grain, soy-like savor and dried fruit from repeated high-temperature cycles.", region: { name: "Guizhou", point: [106.7, 26.6], kind: "traditional" } },
      { name: "Light-aroma baijiu", lawStatus: "Defined style", law: "A Chinese aroma classification rather than one universal place name.", style: "Clean, floral and cereal-led, often from sorghum fermented in stone jars.", region: { name: "Northern China", point: [112, 37], kind: "traditional" } },
      { name: "Rice-aroma baijiu", lawStatus: "Defined style", law: "Chinese aroma category based around rice-spirit character; geographic claims require separate qualification.", style: "Soft, floral and gently sweet with rice, honey and yogurt-like notes.", region: { name: "Southern China", point: [110, 24], kind: "traditional" } },
      { name: "Honkaku shōchū", lawStatus: "Defined style", law: "Japan's single-distilled shōchū category restricts materials and process; several regional shōchū names are protected GIs.", style: "Raw-material expressive—sweet potato, barley, rice, buckwheat or brown sugar—with kōji-driven umami.", region: { name: "Kyushu", point: [130.5, 32.3], kind: "traditional" } },
      { name: "Awamori", lawStatus: "Protected origin", law: "Ryūkyū Awamori is an Okinawan geographical indication, traditionally using indica rice, black kōji and single fermentation.", style: "Earthy, floral and rich; aged kusu can develop vanilla, mushroom and deep savory complexity.", region: { name: "Okinawa", point: [127.7, 26.3], kind: "protected" } },
      { name: "Diluted soju", lawStatus: "Broad style", law: "A Korean tax/market category made by diluting highly rectified spirit; it is distinct from traditional pot-distilled soju.", style: "Light, clean and softly sweet, typically bottled at approachable strength.", region: { name: "South Korea", point: [127.8, 36], kind: "traditional" } },
      { name: "Distilled soju", lawStatus: "Traditional term", law: "Traditional distilled soju follows Korean standards; regional examples such as Andong Soju may have additional geographic recognition.", style: "Grain, nuts and fermentation character with more weight and higher strength than diluted soju.", region: { name: "Korea", point: [128.7, 36.6], kind: "traditional" } },
      { name: "Kaoliang", lawStatus: "Traditional term", law: "Kaoliang is a Chinese-language sorghum-spirit term rather than one globally protected recipe. Taiwan’s best-known examples are place-specific traditions from Kinmen and Matsu.", style: "Dry, high-strength and aromatic, with sorghum, white pepper, flowers and fermented fruit shaped by wheat starter, solid-state fermentation and maturation vessels.", region: { name: "Kinmen & Matsu", point: [119.9, 25], kind: "traditional" } },
    ],
  },
  {
    categoryId: "flavoured",
    detail:
      "Flavored spirits layer extraction and blending onto a spirit base. Producers macerate, percolate, redistill or directly add extracts, then balance bitterness, sugar, color and alcohol. Some names describe a legal category, some a protected regional tradition, and others only a broad style—making the exact wording on the label especially important.",
    process: ["Choose spirit base", "Select flavor materials", "Extract or redistill", "Sweeten & blend", "Rest & bottle"],
    brandingTerms: [
      { term: "Liqueur", contrast: "Flavored spirit", meaning: "Liqueur normally signals a sweetened spirit category with a minimum sugar level. A flavored spirit may carry added flavor without meeting the same sweetness threshold.", labelCue: "Category rules vary by market, so sweetness and designation should be read together." },
      { term: "Crème de…", contrast: "Cream liqueur", meaning: "Crème de cassis and similar names indicate a high sugar level, not dairy. Cream liqueur contains dairy cream or a cream-like emulsion.", labelCue: "In crème de…, the ingredient after de names the defining flavor." },
      { term: "Amaro", contrast: "Aperitivo", meaning: "Amaro is a broad Italian bittersweet herbal style. Aperitivo describes a pre-meal role and often a lighter, brighter profile; the terms can overlap.", labelCue: "Neither word alone tells you exact sugar, bitterness or alcohol—check the bottle and intended serve." },
      { term: "Cocktail bitters", contrast: "Bitter liqueur", meaning: "Cocktail bitters are highly concentrated and dosed by dashes. Bitter liqueurs and potable bitters are designed for full pours or mixed-drink measures.", labelCue: "Bottle size, dropper or dasher top, and serving guidance reveal the intended use." },
    ],
    labelTerms: [
      { term: "Amaro / Amari", place: "Italian tradition", meaning: "Bitter-sweet herbal liqueur style; not one protected recipe.", region: { name: "Italy", point: [12.5, 42.8], kind: "traditional" } },
      { term: "Ouzo", place: "Greece / Cyprus", meaning: "Protected aniseed spirit designation.", region: { name: "Greece", point: [22, 39], kind: "protected" } },
      { term: "Pastis de Marseille", place: "France", meaning: "Defined aniseed-spirit designation with composition criteria.", region: { name: "Marseille", point: [5.4, 43.3], kind: "traditional" } },
      { term: "Akvavit / Aquavit", place: "Nordic tradition", meaning: "Caraway and/or dill-led spirit category; some national names are GIs.", region: { name: "Scandinavia", point: [15, 62], kind: "traditional" } },
      { term: "Crème de…", place: "EU category term", meaning: "Signals a liqueur meeting a higher minimum sugar threshold, not dairy cream." },
      { term: "Absinthe de Pontarlier", place: "Pontarlier, France", meaning: "EU geographical indication for an anise-and-wormwood spirit made in the Pontarlier area.", region: { name: "Pontarlier", point: [6.36, 46.9], kind: "protected" } },
    ],
    subtypes: [
      { name: "Liqueurs", lawStatus: "Defined style", law: "A sweetened spirit category with minimum sugar rules that vary by jurisdiction; protected names may impose extra requirements.", style: "Fruit, nuts, herbs, cream, coffee or spice, ranging from bright and simple to aged and layered." },
      { name: "Amari", lawStatus: "Broad style", law: "Amaro is an Italian style word rather than one protected universal recipe; the product is generally labeled within the liqueur/bitter framework of its market.", style: "Bittersweet roots, bark, citrus and herbs, from light aperitivo profiles to dark, mentholated digestivi.", region: { name: "Italy", point: [12.5, 42.8], kind: "traditional" } },
      { name: "Aniseed spirits", lawStatus: "Defined style", law: "EU law defines aniseed-flavored spirit categories and protected terms including ouzo; each named category has composition and origin conditions.", style: "Licorice and fennel aromas; many louche cloudy when water releases dissolved anise oils.", region: { name: "Mediterranean", point: [22, 38], kind: "traditional" } },
      { name: "Aquavit", lawStatus: "Defined style", law: "EU category requires caraway and/or dill as the defining flavor; certain national/regional names are protected GIs.", style: "Dry, savory and caraway/dill-led, sometimes cask-aged with citrus, fennel and warm spice.", region: { name: "Scandinavia", point: [15, 62], kind: "traditional" } },
      { name: "Cocktail bitters", lawStatus: "Broad style", law: "Often treated as non-beverage or specialty products depending on market; 'bitters' alone does not describe one universal legal category.", style: "Highly concentrated bitter, aromatic extracts used by dashes rather than as a full pour." },
      { name: "Flavored vodka", lawStatus: "Defined style", law: "A recognized flavored vodka designation in major markets, normally requiring truthful flavor naming and sometimes a formula or statement of composition.", style: "Neutral or characterful vodka carrying fruit, spice, herb or confectionery flavors." },
      { name: "Infused vodka", lawStatus: "Broad style", law: "‘Infused’ describes macerating whole fruit, herbs, roots or spices into vodka rather than one harmonized legal category; final designation depends on the market and formula.", style: "Often drier and more ingredient-specific than extract-led flavored vodka, with natural oils, color and seasonal variation." },
      { name: "Absinthe", lawStatus: "Traditional term", law: "Absinthe is not one globally harmonized recipe. The protected ‘Absinthe de Pontarlier’ GI requires local production and a macerate containing common wormwood and anise; other origins follow their market’s spirit and ingredient rules.", style: "Anise, fennel and wormwood dominate, supported by herbs such as hyssop or lemon balm; dilution releases oils and creates the characteristic opaque louche." },
    ],
  },
];

export function getCategoryGuide(categoryId: string) {
  return categoryGuides.find((guide) => guide.categoryId === categoryId);
}

export const guideSources = [
  { label: "EU spirit drinks regulation", url: "https://eur-lex.europa.eu/eli/reg/2019/787/oj/eng" },
  { label: "US American single malt whisky standard", url: "https://www.ttb.gov/public-information/featured-stories/ttb-establishes-american-single-malt-whisky-standard-identity" },
  { label: "Mexican Sotol denomination standard", url: "https://dof.gob.mx/nota_detalle_popup.php?codigo=669378" },
  { label: "Bolivian Singani denomination law", url: "https://www.senapi.gob.bo/normativas/leyes/ley-de-denominacion-de-origen" },
  { label: "Absinthe de Pontarlier GI specification", url: "https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=uriserv%3AOJ.C_.2018.110.01.0035.01.ENG" },
  { label: "US TTB label anatomy", url: "https://www.ttb.gov/regulated-commodities/beverage-alcohol/distilled-spirits/ds-labeling-home/anatomy-of-a-distilled-spirits-label-tool" },
  { label: "WSET Level 3 Spirits specification", url: "https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf" },
];
