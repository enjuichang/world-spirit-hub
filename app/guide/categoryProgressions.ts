export type ProgressionStep = {
  level: string;
  spirit: string;
  serve: string;
  lesson: string;
  lookFor: string;
};

export const categoryProgressions: Record<string, ProgressionStep[]> = {
  whisky: [
    { level: "Start", spirit: "Blended Irish whiskey", serve: "Neat or with a little water", lesson: "A gentle bridge into grain, light fruit and oak without heavy smoke or cask intensity.", lookFor: "Cereal · apple · vanilla" },
    { level: "Build", spirit: "Straight bourbon", serve: "Neat, then over one large cube", lesson: "New charred oak makes the relationship between corn sweetness, vanilla, caramel and char easy to read.", lookFor: "Corn · caramel · baking spice" },
    { level: "Explore", spirit: "Peated single malt Scotch", serve: "Neat with water on the side", lesson: "Peat introduces smoke, earth and maritime savor while malt, fermentation and cask character remain underneath.", lookFor: "Smoke · citrus · malt" },
    { level: "Advanced", spirit: "Cask-strength or single-cask whisky", serve: "Small pour; dilute gradually", lesson: "Higher concentration rewards careful dilution and comparison of spirit weight, cask influence and texture.", lookFor: "Concentration · texture · cask detail" },
  ],
  brandy: [
    { level: "Start", spirit: "VS Cognac", serve: "Neat or in a Sidecar", lesson: "A youthful blend makes fresh grape, floral lift and early oak influence easy to recognize.", lookFor: "Grape · flowers · vanilla" },
    { level: "Build", spirit: "Calvados", serve: "Neat in a small tulip glass", lesson: "Moving from grapes to cider fruit reveals how clearly the raw material can survive fermentation, distillation and oak.", lookFor: "Apple peel · pear · warm spice" },
    { level: "Explore", spirit: "Armagnac", serve: "Neat; allow time in the glass", lesson: "Single distillation and varied grapes often produce a broader, earthier and more textural reading of wine spirit.", lookFor: "Prune · spice · earth" },
    { level: "Advanced", spirit: "Vintage or long-aged Armagnac", serve: "Small neat pour", lesson: "A mature example invites attention to grape identity, oxidation, oak integration, rancio and vintage variation.", lookFor: "Dried fruit · walnut · rancio" },
  ],
  rum: [
    { level: "Start", spirit: "Lightly aged blended rum", serve: "Daiquiri, then neat", lesson: "A clean blend introduces molasses-derived sweetness, gentle fruit and oak without overwhelming fermentation character.", lookFor: "Vanilla · banana · caramel" },
    { level: "Build", spirit: "Mature Barbados-style rum", serve: "Neat or over one cube", lesson: "Pot-and-column blending shows how body, fruit and oak can be balanced within one origin tradition.", lookFor: "Toffee · tropical fruit · spice" },
    { level: "Explore", spirit: "High-ester Jamaican rum", serve: "Small neat pour or split-base cocktail", lesson: "Long fermentation and pot distillation push fruit esters and savory congeners into a more expressive register.", lookFor: "Pineapple · olive · overripe fruit" },
    { level: "Advanced", spirit: "Clairin or unaged cane-juice spirit", serve: "Small neat pour", lesson: "Fresh cane, local fermentation and minimal smoothing expose raw-material and microbial character with unusual clarity.", lookFor: "Fresh cane · brine · wild herbs" },
  ],
  agave: [
    { level: "Start", spirit: "100% agave blanco tequila", serve: "Neat, or in a simple Margarita", lesson: "Unaged tequila keeps cooked blue agave, citrus and pepper ahead of oak.", lookFor: "Cooked agave · lime · pepper" },
    { level: "Build", spirit: "Reposado tequila", serve: "Neat", lesson: "Short oak maturation makes it easy to compare plant character with vanilla, toast and softened texture.", lookFor: "Agave · vanilla · gentle spice" },
    { level: "Explore", spirit: "Espadín mezcal", serve: "Small neat pour", lesson: "Pit cooking, open fermentation and small-scale distillation add smoke, earth and savory plant detail.", lookFor: "Roast agave · smoke · mineral" },
    { level: "Advanced", spirit: "Ancestral mezcal or traditional sotol", serve: "Small neat pour at room temperature", lesson: "Variable plants, vessels and distillation materials reward slow tasting and attention to producer-level method.", lookFor: "Species · fermentation · vessel character" },
  ],
  gin: [
    { level: "Start", spirit: "Classic London Dry gin", serve: "Gin & tonic, then neat", lesson: "A juniper-led recipe establishes the category's central reference point with citrus and coriander support.", lookFor: "Juniper · lemon peel · coriander" },
    { level: "Build", spirit: "Contemporary botanical gin", serve: "Highball or neat", lesson: "A softer juniper frame reveals how flowers, tea, local herbs or unusual citrus reshape the architecture.", lookFor: "Recipe balance · aroma layering" },
    { level: "Explore", spirit: "Oude genever", serve: "Neat at cool room temperature", lesson: "Malt wine introduces cereal weight and connects botanical spirit to whisky-like fermentation and distillation cues.", lookFor: "Malt · juniper · soft spice" },
    { level: "Advanced", spirit: "Barrel-aged gin or genever", serve: "Small neat pour", lesson: "Oak creates a three-way negotiation between base spirit, botanical extraction and maturation.", lookFor: "Botanicals · grain · integrated oak" },
  ],
  vodka: [
    { level: "Start", spirit: "Wheat vodka", serve: "Chilled, then tasted warmer", lesson: "A clean, soft cereal example establishes alcohol, water and texture as things to taste rather than hide.", lookFor: "Soft grain · citrus · clean finish" },
    { level: "Build", spirit: "Potato vodka", serve: "Cool, not frozen", lesson: "A fuller, creamier texture makes the influence of base material and distillation choices easier to compare.", lookFor: "Creamy texture · earth · pepper" },
    { level: "Explore", spirit: "Rye vodka", serve: "Neat at cellar temperature", lesson: "Rye often retains a firmer, spicier cereal signature even after high rectification.", lookFor: "Rye bread · pepper · dry finish" },
    { level: "Advanced", spirit: "Single-estate or minimally filtered vodka", serve: "Side-by-side at room temperature", lesson: "A transparent production story invites close comparison of crop, fermentation, filtration, water and proofing.", lookFor: "Raw material · texture · finish length" },
  ],
  asian: [
    { level: "Start", spirit: "Clean modern soju", serve: "Lightly chilled with food", lesson: "A lower-strength, restrained style introduces the social and culinary role of Korean spirits.", lookFor: "Soft cereal · pear · clean finish" },
    { level: "Build", spirit: "Barley honkaku shochu", serve: "Neat, on ice or with warm water", lesson: "Single distillation and kōji make grain and fermentation character more visible without extreme aroma intensity.", lookFor: "Toasted barley · nuts · umami" },
    { level: "Explore", spirit: "Light-aroma baijiu", serve: "Small room-temperature pour", lesson: "Solid fermentation and qu introduce a new aroma system in a relatively crisp, restrained baijiu style.", lookFor: "Pear · grain · floral lift" },
    { level: "Advanced", spirit: "Sauce-aroma baijiu", serve: "Very small pour; revisit slowly", lesson: "Layered fermentations and high congener intensity demand patience, comparison and a broader savory vocabulary.", lookFor: "Fermented bean · herbs · roasted savor" },
  ],
  flavoured: [
    { level: "Start", spirit: "Orange liqueur", serve: "Small neat taste, then in a classic cocktail", lesson: "A familiar ingredient makes sweetness, citrus extraction, base spirit and proof easy to separate.", lookFor: "Orange peel · sugar · spirit heat" },
    { level: "Build", spirit: "Nut or coffee liqueur", serve: "Neat or over ice", lesson: "A richer flavor base shows how roast, fat-like texture and sugar change aroma release and balance.", lookFor: "Roast · sweetness · texture" },
    { level: "Explore", spirit: "Amaro", serve: "Neat after a meal or with soda", lesson: "Bitterness adds roots, bark, herbs and citrus to the balancing act rather than simply increasing intensity.", lookFor: "Bitter herbs · citrus · caramel" },
    { level: "Advanced", spirit: "Absinthe or alpine herbal elixir", serve: "Diluted with water when traditional", lesson: "Dense botanicals and high proof reward dilution, aroma mapping and attention to extraction rather than sweetness alone.", lookFor: "Anise · wormwood · layered herbs" },
  ],
};
