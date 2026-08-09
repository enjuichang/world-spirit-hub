# World Spirit Hub — Product and Build Plan

## 1. Product vision

World Spirit Hub is a static, map-first educational website for exploring how spirits are made, classified, regulated, and shaped by place. A visitor can start with a broad category, move into a subcategory, region, or producer, and then inspect individual distilleries and representative spirits.

The product should be educational and brand-neutral. It may use commercial brands as factual examples, but should not rank them or imply endorsement.

## 2. Release roadmap

| Release | Goal | Included |
| --- | --- | --- |
| V1 | Explore the world of spirits | Interactive map, filters, search, “show all,” subcategory and distillery markers, accessible list, cited detail pages, glossary, and shareable URLs |
| V1.1 | Deepen the reference | Comparisons, timelines, expanded dataset, learning collections, localization pilot, and editorial workflow refinements |
| V2 | Help users discover their preferences | Taste and cocktail questionnaire, explainable recommendations, saved/shareable results |
| V3 | Connect preferences to nearby places | Permission-based location, nearby cocktail bar discovery, filters, map/list results, third-party place data |

Current V1 implementation snapshot: 57 curated landmarks across all eight families, official producer links for every marker, clustering and search, and a user-controlled 2D Mercator / 3D terrain-globe view. The website now reads those records from a canonical `data/distilleries.json` inventory; a validated, generated `DISTILLERIES.md` gives editors a grouped overview without duplicating the source of truth.

## 3. Audience and core journeys

### Primary audiences

- Curious beginners who want a visual introduction to world spirits.
- WSET learners who want a geographic companion to structured study.
- Bartenders and hospitality staff who want a quick category and terminology reference.
- Enthusiasts who want to connect production, place, and flavor.

### V1 journeys

1. **Browse by category:** Choose “Whisky,” see its main regions, open “Scotch whisky,” and inspect its laws, styles, history, producers, and distilleries.
2. **Browse by place:** Pan to Japan, inspect clustered markers, and discover Japanese whisky and shōchū.
3. **Browse everything:** Select “Show all spirits,” use marker clustering, then narrow by category or region.
4. **Learn from a marker:** Open a distillery, see what it makes, its location and history, then follow links to the relevant category and representative spirit styles.
5. **Share a discovery:** Copy a URL that preserves the selected category, entity, and map position.

## 4. Information architecture

### Main navigation

- **Explore map** — primary product experience and first navigation item.
- **Spirit guide** — browsable category index for users who prefer cards or lists.
- **How spirits are made** — raw materials, fermentation, distillation, maturation, and flavoring.
- **Glossary** — legal and production terminology.
- **About and sources** — editorial policy, methodology, credits, corrections, and responsible-drinking notice.

### Entity hierarchy

```text
Category
└── Subcategory or legally defined type
    ├── Producing regions
    ├── Styles and labeling terms
    ├── Distilleries/producers
    │   └── Representative products (optional in early V1)
    └── Educational content
        ├── Raw materials and production
        ├── Taste profile
        ├── Quality and price factors
        ├── Laws and geographic indications
        └── History
```

“Brand,” “producer,” “distillery,” and “product” must be separate data concepts. A company can own several brands or distilleries, and a brand is not necessarily a physical map location.

## 5. Spirit taxonomy

Use the current WSET Level 3 Award in Spirits as an editorial reference, not as a claim that this site is an official WSET product. The current specification gives detailed treatment to 11 core categories—Scotch whisky, Bourbon, rye whiskey, Tennessee whiskey, Cognac, Armagnac, Caribbean rum, Tequila, Mezcal, vodka, and gin—and broader treatment to additional global categories.

### Recommended top-level map filters

1. **Whisky/whiskey**
   - Scotch whisky: single malt, single grain, blended malt, blended grain, blended Scotch.
   - American whiskey: Bourbon, rye, Tennessee, and other legally defined types.
   - Irish whiskey, Canadian whisky, and Japanese whisky.
   - Later expansion: other world whiskies.
2. **Brandy and other fruit spirits**
   - Cognac, Armagnac, Brandy de Jerez, South African brandy.
   - Pisco, grappa, Calvados, and other fruit eaux-de-vie.
3. **Rum and other sugar-cane spirits**
   - Molasses-based rum, cane-juice rum/rhum agricole, Caribbean regional traditions.
   - Cachaça.
4. **Agave and related spirits**
   - Tequila, Mezcal, Bacanora, Raicilla.
   - Sotol should be explained as a separate dasylirion spirit rather than agave spirit.
5. **Gin and genever**
   - Juniper-forward and contemporary gin styles; legally relevant terms by jurisdiction.
   - Genever as a related but distinct category.
6. **Vodka**
   - Neutral and characterful styles; unflavored and flavored vodka.
7. **Asian grain spirits**
   - Baijiu: strong-, sauce-, light-, and rice-aroma styles.
   - Shōchū: column-distilled and pot-distilled, including honkaku shōchū and awamori.
   - Soju: diluted and distilled styles.
8. **Flavored spirits, bitters, and liqueurs**
   - Aniseed spirits, aquavit, amari, cocktail bitters, liqueurs, and other flavored spirits.
   - Consider hiding this filter until the core map content is complete.

### Taxonomy rules

- Do not combine baijiu, shōchū, and soju into one subcategory; they have different raw materials, methods, laws, and traditions.
- Treat “whisky” and “whiskey” as spelling variants driven by producer convention and legal context.
- Distinguish broad families from protected names and legally defined categories.
- Store laws and labeling rules with a jurisdiction and an “as of” date.
- Separate objective classification from subjective flavor and price guidance.
- Add aliases and localized spellings to support search without changing canonical names.

## 6. V1 experience and interaction design

### Map layout

- Full-width interactive world map with a compact header.
- Desktop: filter rail on the left, map in the center, detail drawer on the right.
- Mobile: map first, horizontally scrollable filter chips, details in a bottom sheet.
- Use category-specific colors plus distinct marker shapes/icons; never rely on color alone.
- Cluster dense markers at lower zoom levels and show a count in each cluster.
- Provide zoom controls, reset-view control, keyboard focus, and a synchronized list alternative.

Recommended responsive behavior:

| Viewport | Filter treatment | Detail treatment | Map/list treatment |
| --- | --- | --- | --- |
| `≥ 1280px` | Persistent 288–320px rail | Persistent or overlay 400–440px drawer | Map and result-list toggle; optional split list |
| `768–1279px` | Collapsible 280px overlay rail | 380–420px overlay drawer | Map remains full available width |
| `< 768px` | Top filter button plus scrollable active chips | Bottom sheet at compact and expanded snap points | Map/list segmented control; never show an unusably small split view |

- Keep the global header near 64–72px on desktop and 56–64px on mobile.
- Reserve space for attribution, scale, zoom, and reset controls so they never sit beneath the mobile sheet or cookie/privacy UI.
- Make the result count visible without opening the filter panel.
- When a mobile bottom sheet expands, preserve the selected marker and avoid changing map zoom unexpectedly.

### Filter behavior

- Default to a curated overview rather than thousands of markers at once.
- “Show all spirits” activates all published categories and clustering.
- A top-level filter reveals its subcategories and regions.
- Selecting a subcategory updates the map, results count, URL, legend, and list.
- Allow multiple category filters only if the interface remains understandable; otherwise use one category plus region and feature filters.
- Include “Clear filters” and preserve selections when a detail drawer is closed.

### Detail views

**Category/subcategory panel**

- Plain-language definition.
- Raw materials and production summary.
- Main styles and flavor spectrum.
- Factors affecting style, quality, and price.
- Key laws, protected regions, and labeling terms.
- Short history and timeline.
- Main producing regions and representative producers.
- Linked sources and “last reviewed” date.

**Distillery/producer panel**

- Name, type, latitude/longitude, country, and region.
- Operating status and founding date where verified.
- Spirits/categories made there.
- Short history and notable production facts.
- Official website and source links.
- Accessibility note if public tours are mentioned; do not imply visitor access without a current source.

**Representative spirit/product panel**

- Producer, category, origin, ABV, age or labeling terms where relevant.
- Expected flavor profile, not a guaranteed tasting outcome.
- Style, quality, and price drivers.
- Use price bands rather than volatile exact prices in V1.

### Search and deep linking

- Search categories, subcategories, regions, distilleries, producers, and aliases.
- Every entity gets a stable slug and shareable URL, such as `/explore?category=whisky&entity=yamazaki-distillery`.
- Browser back/forward must restore selection and map state.
- Static category pages should be generated for discoverability and search-engine indexing.

### Visual direction — Midnight Bar Atlas

The visual identity should feel like a chic, low-lit cocktail bar crossed with an old world atlas: intimate, precise, warm, and quietly luxurious. It should not feel like a liquor advertisement, nightclub, sports bar, or novelty “speakeasy.” Educational clarity remains more important than atmosphere.

#### Design principles

- **Dark, not muddy:** near-black brown backgrounds with visibly separated surfaces and crisp warm text.
- **Warm metal, not yellow:** aged-brass accents used selectively for active controls, fine rules, and important wayfinding.
- **Editorial, not ornamental:** high-contrast serif display type paired with a highly readable sans-serif for everything functional.
- **Tactile, not skeuomorphic:** subtle grain, engraved lines, and map contours are acceptable; fake leather, wood panels, bottle-glow effects, and heavy gradients are not.
- **Data remains primary:** map markers, filters, labels, legal terms, citations, and focus states must be clearer than decorative elements.
- **Luxury through restraint:** generous spacing, limited accent usage, thin rules, and controlled motion instead of excessive shine or animation.

#### Core color tokens

Use semantic tokens in components; raw hex values should live only in the central theme file.

| Token | Value | Intended use | Accessibility note |
| --- | --- | --- | --- |
| `--color-bg` | `#100F0E` | Main page background; espresso-black | Base for the dark theme |
| `--color-surface` | `#1B1917` | Navigation, filter rail, cards | Must remain distinct through border/elevation |
| `--color-surface-raised` | `#25211E` | Drawer, modal, selected cards | Use sparingly to preserve hierarchy |
| `--color-border` | `#776A5F` | Rules, inputs, inactive controls | At least 3:1 against raised and base surfaces |
| `--color-text` | `#F4EBDD` | Primary text | Approximately 16.2:1 on the main background |
| `--color-text-muted` | `#B8AA98` | Secondary metadata | Approximately 8.4:1 on the main background |
| `--color-accent` | `#D4A95F` | Brass active states, links, key metrics | Approximately 8.8:1 on the main background |
| `--color-accent-strong` | `#E2BC78` | Primary button fill and selected chip | Pair with `#100F0E` text |
| `--color-oxblood` | `#9E3F4F` | Editorial highlight, history/timeline accent | Do not use as small text on dark backgrounds |
| `--color-emerald` | `#356F5E` | Botanical/supporting accent | Passes 3:1 as a large shape on the base and 4.5:1 with warm ivory text |
| `--color-focus` | `#FFD37A` | Keyboard focus ring | Never replace with a subtle brass border |
| `--color-error` | `#F08A82` | Errors and destructive warnings | Pair icon and text; do not rely on color alone |
| `--color-success` | `#78B99A` | Verified/current status | Pair with a status label or icon |

Target at least 4.5:1 for normal text, 3:1 for large text and meaningful UI boundaries, and a visible focus indicator with at least 3:1 contrast against adjacent colors. Recalculate contrast whenever tokens change; the approximate ratios above assume `#100F0E` as the background.

#### Spirit-category map palette

Category colors are data colors, not general UI accents. Each category also receives a distinct marker glyph or shape and a text abbreviation in the legend.

| Category | Color | Marker concept | Dark-background contrast |
| --- | --- | --- | --- |
| Whisky/whiskey | `#D4A15D` | Circle with barrel line | ~8.3:1 |
| Brandy and fruit spirits | `#BC6F55` | Diamond with fruit pip | ~5.1:1 |
| Rum and sugar-cane spirits | `#9B7653` | Square with cane slash | ~4.7:1 |
| Agave and related spirits | `#63A876` | Upward triangle/agave leaf | ~6.7:1 |
| Gin and genever | `#5EA6A6` | Hexagon/botanical sprig | ~6.8:1 |
| Vodka | `#83A8C9` | Ring/drop | ~7.7:1 |
| Asian grain spirits | `#B482C4` | Four-point grain mark | ~6.3:1 |
| Flavored spirits and liqueurs | `#C95F83` | Capsule/spice star | ~5.0:1 |

- Use the colors at full strength for marker fills and active legend samples, not for large text blocks.
- Add a dark outer stroke and light selected halo so markers remain visible over both land and water.
- Selected markers use a double outline plus scale/shape change; hover alone is insufficient.
- Cluster fill should be neutral brass/charcoal, with a segmented or miniature category treatment only if it remains legible.
- Test the complete set with common color-vision-deficiency simulations and in grayscale.

#### Basemap styling

- Use a dark, desaturated vector style with charcoal-brown land, blue-black water, muted warm-gray boundaries, and warm-gray labels.
- Reduce road, retail, transit, and generic point-of-interest prominence; the spirits data must remain the visual foreground.
- Keep country, region, and city labels visible at appropriate zooms. Avoid decorative handwritten map labels.
- Use a subtle vignette or paper grain only as a nonessential overlay under 3% opacity; disable it in high-contrast/forced-colors modes.
- Do not bake category colors into the basemap, because that reduces marker distinction.

#### Typography

- **Display:** a refined serif such as Cormorant Garamond or Fraunces for the wordmark, page titles, and major section headings only.
- **Interface/body:** Inter or Source Sans 3 for navigation, filters, paragraphs, labels, tables, and citations.
- Self-host licensed WOFF2 subsets when practical and use robust system fallbacks.
- Body copy starts at 16px with approximately 1.55–1.7 line height and a readable 60–75 character measure.
- Use tabular numerals for prices, years, map counts, rankings, distances, and tasting scales.
- Small caps or uppercase may appear in short eyebrow labels with increased tracking; never use it for paragraphs, long filters, or legal text.

#### Surfaces and components

- Cards and drawers use matte surfaces, a one-pixel warm border, and soft shadow; avoid translucent glass effects over text-heavy content.
- Primary buttons use brass fill with espresso text. Secondary buttons use a visible warm border and ivory text.
- Active filter chips use brass fill or an ivory inset mark; inactive chips remain clearly interactive against the dark surface.
- Links use brass plus an underline on hover/focus and in body copy. Color alone must not identify links.
- Citation blocks are quieter but never dimmer than the minimum accessible text contrast.
- Taste profiles use labeled bars or a compact radar only when the same values are available as text; decorative “flavor clouds” are not sufficient.
- Legal terms and protected designations use a consistent framed label, not a fake government seal.

#### Imagery and iconography

- Favor original editorial photography of landscapes, raw materials, stills, barrels, glassware, and production details over bottle pack shots.
- Apply a consistent warm, low-saturation grade while preserving accurate product and ingredient colors.
- Use line icons inspired by engraving and cartography, with consistent stroke weight and simple silhouettes at small sizes.
- Never reproduce a brand label, award logo, seal, or map artwork without appropriate rights.
- Every meaningful image requires descriptive alt text; decorative grain and flourishes use empty alt text or CSS backgrounds.

#### Motion and atmosphere

- Use 120–200ms transitions for controls and 200–320ms for drawers/map selections.
- Prefer opacity and transform; avoid full-screen parallax, liquid simulations, flickering neon, or auto-playing video.
- Honor `prefers-reduced-motion` by removing nonessential movement and using immediate cluster/viewport transitions.
- The homepage may use one restrained reveal sequence, but all information must be present without waiting for animation.

#### Responsive visual hierarchy

- Desktop prioritizes map and detail drawer; the filter rail should resemble a concise menu, not a dense admin panel.
- Mobile uses a persistent result count and a bottom sheet with clear snap points, a visible close control, and safe-area padding.
- Do not place light text directly over photography without an opaque overlay that guarantees contrast.
- Keep tap targets at least 44 by 44 CSS pixels and prevent dense marker legends from becoming horizontal micro-text.

#### Visual acceptance criteria

- A representative homepage, explore view, category page, detail drawer, empty state, and error state are designed before component implementation.
- All semantic and category tokens have contrast and color-vision checks recorded.
- The map remains readable in grayscale and at 200% zoom.
- The design is recognizable without bottle photography, gradients, or brand logos.
- A five-second test should communicate “premium global spirits education,” not ecommerce, nightlife promotion, or a single-brand campaign.

## 7. Content and data model

Store editorial content in version-controlled JSON, YAML, or Markdown with validated front matter. Keep geographic data as GeoJSON or generate GeoJSON from the canonical entity files during the build.

For the current implementation, `data/distilleries.json` is the canonical location dataset and is imported directly by the site. `scripts/generate-distillery-index.mjs` validates the records and generates the human-readable `DISTILLERIES.md`. Editors change only the JSON, run `npm run data:sync`, and commit both files; `npm run data:check` is part of the test gate and fails if the generated index drifts.

### Suggested content structure

```text
content/
├── categories/
├── subcategories/
├── regions/
├── producers/
├── distilleries/
├── products/
├── glossary/
└── sources/
```

### Core entity fields

```yaml
id: scotch-whisky
name: Scotch whisky
entityType: subcategory
parentCategoryId: whisky
aliases: [Scotch]
summary: "..."
rawMaterials: [cereals]
productionMethods: [fermentation, distillation, maturation]
styles: []
flavorTags: [cereal, fruity, smoky, oak]
qualityFactors: []
priceFactors: []
regions: []
legalFrameworks:
  - jurisdiction: United Kingdom
    summary: "..."
    effectiveOrReviewedDate: YYYY-MM-DD
    sourceIds: []
history: []
producerIds: []
distilleryIds: []
sourceIds: []
reviewStatus: draft
lastReviewed: YYYY-MM-DD
```

### Geographic entity fields

```yaml
id: example-distillery
name: Example Distillery
entityType: distillery
coordinates: { latitude: 0.0, longitude: 0.0 }
precision: exact # exact | approximate | region-centroid
countryCode: XX
regionId: example-region
producerId: example-producer
subcategoryIds: []
status: operating # operating | closed | historic | uncertain
officialUrl: "https://..."
sourceIds: []
lastVerified: YYYY-MM-DD
```

### Source, legal, and media fields

Sources should be first-class records so one source can support many entities and can be reviewed or replaced centrally.

```yaml
id: source-scotch-regulations-2009
title: The Scotch Whisky Regulations 2009
publisher: UK Government
sourceType: law # law | regulator | trade-body | education | producer | archive | journalism
url: "https://..."
publishedDate: YYYY-MM-DD
retrievedDate: YYYY-MM-DD
language: en
jurisdiction: GB
supportsClaims: [definition, production-law, labelling]
archivedUrl: "https://..." # optional and only when permitted
reviewStatus: published
```

Do not store only a source URL on a prose page. Link individual legal/historical claims to source IDs so editors can see exactly what becomes unsupported when a source changes.

```yaml
id: scotch-whisky-legal-framework
name: Scotch whisky legal framework
jurisdiction: GB
effectiveDate: YYYY-MM-DD
lastChecked: YYYY-MM-DD
summary: "..."
requirements:
  - topic: geographic-origin
    statement: "..."
    sourceIds: [source-scotch-regulations-2009]
labellingTerms: []
supersedesId: null
```

Media records should carry rights and focal-point metadata rather than embedding arbitrary image URLs in content.

```yaml
id: media-example-pot-still
type: image
src: /media/example-pot-still.webp
width: 1600
height: 1067
alt: Copper pot stills inside a stone stillhouse
credit: Example Photographer
license: Licensed for World Spirit Hub web use
sourceUrl: "https://..."
focalPoint: { x: 0.55, y: 0.42 }
```

### Minimum content completeness

| Entity | Required before publication |
| --- | --- |
| Category/subcategory | Definition, parent, raw material, production summary, style/taste, quality and price drivers, laws where applicable, history, regions, citations, last review |
| Region | Country/jurisdiction, geographic scope, relevant categories, production context, representative producers/distilleries, citations |
| Producer/brand | Clear entity type, ownership where verifiable, associated locations/categories, neutral history, official link, citations |
| Distillery | Coordinates and precision, operating status, region, categories made, ownership/producer link where known, verification source and date |
| Product | Producer, category, origin, ABV/source date, labeling terms, representative style notes, no unsupported live price |
| Glossary term | Plain definition, technical definition where useful, related entities, jurisdiction warning when meaning varies, citations |

- Mark optional fields as optional in both editorial guidance and schema; do not invent placeholder facts to satisfy a visual layout.
- Show “information not yet verified” only when that absence itself is useful. Otherwise omit the empty section.
- Require a completeness report in content pull requests so reviewers can distinguish intentional omissions from mistakes.

### Taste and price representation

- Use a controlled flavor vocabulary with optional intensity values: fruity, floral, cereal, grassy, vegetal, herbal, spice, smoke, oak, caramel, savory, and other carefully defined terms.
- Separate aroma/flavor, sweetness, body, alcohol impression, and finish.
- Describe quality through observable drivers and production choices; avoid asserting a universal score.
- Model price as broad market bands and explain the drivers—age, yield, maturation, scarcity, taxes, distribution, and brand positioning.
- Add country/currency context and review dates to any price examples.

## 8. Sources and editorial standards

### Source priority

1. Laws, regulations, geographic-indication specifications, and government agencies.
2. Official trade bodies and appellation organizations.
3. WSET’s current public qualification specification and other recognized educational references.
4. Distillery or producer websites for their own location, products, and history.
5. Reputable books, museums, archives, and specialist publications for context.

### Editorial requirements

- Every legal, historical, and geographic claim must have a source ID.
- Show citations on detail pages and store the retrieval/review date.
- Flag disputed origin stories and avoid turning brand marketing into fact.
- Require a second-source check for founding dates, “first” claims, and historic superlatives.
- Use brand assets only with permission; V1 can use text and original category artwork instead.
- Include a correction/contact process.
- State clearly that the project is independent and not affiliated with or endorsed by WSET.

## 9. Technical plan for a static site

### Recommended stack

- **Framework:** Vinext/Next-compatible React with strict TypeScript and Cloudflare-compatible output.
- **Interactive UI:** React client components for the coordinated explorer, taste quiz, and location-based bar sorting; keep editorial pages server-rendered with minimal JavaScript.
- **Styling:** Tailwind CSS v4 plus global CSS custom properties for the approved design tokens and focused component styles.
- **Map:** Mapbox GL JS with a customized Mapbox Dark style, a public URL-restricted browser token, and an accessible list fallback when the map is unavailable.
- **Basemap:** a licensed hosted tile provider with clear attribution; do not expose a secret server key in the client.
- **Data validation:** typed content modules initially, followed by Zod schemas and a custom cross-reference validation pass as the editorial dataset moves into files.
- **Search:** a compact client-side entity index for instant search inside the explorer; add generated site-wide search when the static page collection expands.
- **Testing:** Vitest for data/logic, Playwright for core journeys, axe checks for accessibility.
- **Hosting:** any static host with CDN support; deploy previews on pull requests.

The implementation can remain backend-free through V2 if questionnaire results stay in the browser. V3 will probably need an external places API or a curated dataset; a serverless proxy may be required to protect API credentials and comply with provider terms.

### Architecture decisions

- Use server-rendered React pages for content-heavy routes and focused client components for coordinated map, filters, list, drawer, quiz, and location state.
- Keep canonical content independent of map and UI libraries. Build scripts transform source content into page props, GeoJSON, and search documents.
- Generate all public V1 entity routes at build time. The site must not require a database or runtime application server.
- Use progressive enhancement: category guides, entity details, citations, and the result list render as HTML; the interactive map enhances the same content after hydration.
- Prefer framework-agnostic TypeScript modules for filtering, scoring, URL parsing, and content validation so they can be unit tested without a browser.
- Treat generated files as build artifacts. Never hand-edit GeoJSON or search indexes generated from canonical content.

### Proposed repository structure

```text
/
├── public/
│   ├── fonts/
│   ├── icons/
│   └── social/
├── content/
│   ├── categories/
│   ├── subcategories/
│   ├── regions/
│   ├── producers/
│   ├── distilleries/
│   ├── products/
│   ├── glossary/
│   └── sources/
├── scripts/
│   ├── build-map-data.ts
│   ├── build-search-index.ts
│   ├── check-content.ts
│   ├── check-links.ts
│   └── check-coordinates.ts
├── src/
│   ├── components/
│   │   ├── explore/
│   │   ├── guide/
│   │   ├── layout/
│   │   └── shared/
│   ├── content.config.ts
│   ├── data/generated/
│   ├── layouts/
│   ├── lib/
│   │   ├── content/
│   │   ├── map/
│   │   ├── search/
│   │   ├── state/
│   │   └── telemetry/
│   ├── pages/
│   ├── styles/
│   └── types/
├── tests/
│   ├── e2e/
│   ├── fixtures/
│   └── unit/
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

`src/data/generated/` should either be ignored by Git and rebuilt in CI, or committed deterministically to make content changes reviewable. Choose one policy at project setup and enforce it consistently.

### Route specification

| Route | Rendering | Purpose |
| --- | --- | --- |
| `/` | Static | Product introduction and entry points into exploration |
| `/explore/` | Static shell + hydrated island | Interactive map, filters, synchronized list, and detail drawer |
| `/spirits/` | Static | All categories and subcategories |
| `/spirits/[slug]/` | Generated static pages | Category or subcategory guide with map entry point |
| `/regions/[slug]/` | Generated static pages | Region summary and associated spirits/distilleries |
| `/producers/[slug]/` | Generated static pages | Producer/brand-family history and related distilleries |
| `/distilleries/[slug]/` | Generated static pages | Permanent, crawlable distillery record |
| `/products/[slug]/` | Generated static pages, optional V1 | Representative product/style record without live pricing |
| `/learn/how-spirits-are-made/` | Static | Production process from raw material through post-distillation |
| `/glossary/` | Static | Searchable terminology index |
| `/glossary/[slug]/` | Generated static pages | Individual term definition and related entities |
| `/sources/` | Static | Methodology, source register, and review policy |
| `/about/` | Static | Independence, corrections, responsible use, and credits |
| `/quiz/` | V2 static shell + hydrated island | Taste questionnaire |
| `/bars/` | V3 static shell + API-backed island | Permission-based nearby-bar discovery |

The drawer may use `/explore/?entity=yamazaki-distillery`, but every published entity should also have a canonical static route. Social/SEO metadata should point to the static entity route rather than query-string state.

### Client state and URL contract

Keep one serializable state object as the source of truth for the V1 explore experience:

```ts
type ExploreState = {
  categoryIds: string[];
  subcategoryIds: string[];
  regionIds: string[];
  selectedEntityId?: string;
  searchQuery?: string;
  view: "map" | "list";
  longitude: number;
  latitude: number;
  zoom: number;
};
```

- Encode meaningful, shareable state in query parameters: `category`, `subcategory`, `region`, `entity`, `q`, `view`, `lng`, `lat`, and `zoom`.
- Omit default values and sort multi-value parameters so URLs remain stable and testable.
- Use `history.replaceState` during continuous map movement and `history.pushState` for deliberate selections.
- Validate and clamp all URL input. Unknown IDs are ignored and invalid coordinates fall back to the default world view.
- Restore state on `popstate`; do not create navigation loops when map events update the URL.
- Keep transient UI state—open filter accordion, hover marker, loading state—out of the URL.

### Content contracts and validation

- Define one strict schema per entity type and a shared base schema for `id`, `slug`, `name`, aliases, sources, publication status, and review dates.
- Prefer stable opaque IDs for relationships and editable slugs for URLs. Slug changes require a redirect entry.
- Validate referential integrity after schemas validate individual records: parent IDs, source IDs, region IDs, producer IDs, and distillery IDs must resolve.
- Normalize coordinates to WGS84 decimal longitude/latitude and reject values outside valid bounds.
- Validate dates as ISO `YYYY-MM-DD`; never accept ambiguous localized dates in source data.
- Publish only records with `reviewStatus: published`. Draft and archived entities may build in previews but must not appear in production indexes.
- Calculate derived fields—counts, bounding boxes, search tokens, map feature properties—during the build rather than duplicating them in source files.
- Preserve accented and non-Latin canonical names. Store transliterations and alternate spellings as aliases for search.

### Generated data artifacts

The content build should emit:

```text
src/data/generated/
├── manifest.json                 # build timestamp, schema version, counts
├── entity-index.json             # small ID/slug/name/type lookup
├── map-overview.geojson          # curated low-zoom overview
├── map/
│   ├── whisky.geojson
│   ├── brandy-fruit.geojson
│   └── ...one file per category
├── search-index.json             # generated client-side entity search
└── source-review-report.json     # missing/stale-source diagnostics
```

- Keep GeoJSON feature properties small: entity ID, canonical name, entity type, category IDs, region ID, status, coordinate precision, and static URL.
- Load full prose only when a detail view is selected or include it in server-rendered HTML for direct routes.
- Add a `schemaVersion` to generated artifacts. Fail clearly if client code and generated data expect different versions.
- Make generation deterministic: stable sort order, no unseeded IDs, and no build timestamp inside files used for snapshot comparison.

### Map implementation

- Create a single Mapbox GeoJSON source for the currently loaded category set when practical, with `cluster: true`, a tested cluster radius, and a maximum clustering zoom.
- Render clusters, cluster counts, and individual points as style layers rather than one HTML element per marker.
- Use a selected-feature layer or feature-state for highlighting. Do not recreate the whole source merely to change selection.
- On cluster activation, call the cluster expansion-zoom API and animate only when reduced motion is not requested.
- Fit bounds when the user deliberately changes category/region, but do not unexpectedly recenter while they are examining a marker.
- Disable uncontrolled world copies if duplicate markers across the antimeridian confuse results; explicitly test Fiji, Alaska/Russia, and Pacific regions.
- Sanitize any HTML passed to map popups. Prefer the application’s accessible detail drawer over rich map popups.
- Show basemap attribution at all viewport sizes and ensure its links remain keyboard accessible.
- If WebGL or tile loading fails, display an error message and retain the synchronized HTML result list.

### Filtering and result synchronization

- Create pure selectors that accept the entity index and `ExploreState`, returning ordered IDs rather than UI components.
- Apply filters consistently to map features, list results, result count, and empty states.
- Define filter semantics explicitly: selections within one filter group use OR; selections across different groups use AND.
- “Show all” means no category restriction, not a separate pseudo-category in the data model.
- Keep selection when it still matches the filters; otherwise close the detail drawer and announce why.
- Use a deterministic default order for the list, then allow name, region, and distance sorting where distance is available.
- Announce result-count changes through a polite live region without announcing every map pan.

### Search implementation

- Index canonical name, aliases, entity type, parent category, region, country, and a short summary.
- Weight canonical names and exact aliases above body text. Return entity type and parent context to disambiguate similar names.
- Normalize case and punctuation while preserving displayed spelling; test apostrophes, accents, macrons, and non-Latin text.
- Debounce browser search input and require no network request in V1.
- Keep the initial index compressed and lazy-load it when the search control is opened if it materially improves initial load.
- Clicking a search result navigates to its static route or updates the explore URL with the matching entity ID, depending on context.

### Component boundaries

```text
ExploreApp
├── ExploreToolbar
│   ├── SearchControl
│   ├── CategoryFilters
│   └── ViewToggle
├── MapView
│   ├── MapLegend
│   ├── MapStatus
│   └── MapControls
├── ResultList
│   └── EntityResultCard
└── EntityDrawer
    ├── EntityHeader
    ├── TasteProfile
    ├── LegalTerms
    ├── RelatedEntities
    └── CitationList
```

- The map adapter owns Mapbox lifecycle only; it receives data and emits semantic events.
- The drawer receives an entity view model, not raw Markdown or Mapbox features.
- Shared entity cards and citation components must work on static pages without hydrating the full explorer.
- Centralize design tokens for category color, spacing, typography, focus, and motion.

### Error and loading states

- Reserve map space before hydration to prevent layout shift.
- Differentiate “loading map code,” “loading category data,” “no matching results,” “tiles unavailable,” and “browser does not support map.”
- Retry transient data/tile errors with a bounded strategy and a manual retry control.
- Treat missing optional media as normal; render a text-first card without a broken placeholder.
- A missing canonical entity or schema mismatch should fail the production build rather than become a silent blank panel.
- Add a production error boundary around interactive islands and collect privacy-safe error events if telemetry is enabled.

### Configuration and environments

- Maintain `development`, deploy-preview, and production environments.
- Document all variables in `.env.example`; keep actual `.env*` secrets ignored.
- Public client configuration must use an explicit public prefix and contain only values safe to expose, such as a restricted public tile token.
- Validate required configuration during the build and report the missing variable by name without printing secret values.
- Restrict map tokens by allowed origin and quota where the provider supports it.
- V3 secret place-provider credentials must exist only in the serverless runtime, never in generated JavaScript or static JSON.

### Package scripts

Plan for the following stable developer interface even if the underlying tools change:

```json
{
  "scripts": {
    "dev": "astro dev",
    "build": "npm run content:check && astro build",
    "preview": "astro preview",
    "content:build": "tsx scripts/build-map-data.ts",
    "content:check": "tsx scripts/check-content.ts",
    "links:check": "tsx scripts/check-links.ts",
    "typecheck": "astro check",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "test:a11y": "playwright test tests/e2e/accessibility.spec.ts"
  }
}
```

The production `build` must generate or verify generated artifacts before the application consumes them. Avoid scripts that depend on uncommitted local state.

### CI/CD pipeline

Run these checks on every pull request:

1. Install from the lockfile using the package manager’s clean-install command.
2. Validate formatting, lint, types, schemas, references, coordinates, and source requirements.
3. Run unit tests and build the production site.
4. Start the built preview and run Playwright smoke/accessibility tests against it.
5. Enforce bundle and page-weight budgets.
6. Upload the static build and test reports as artifacts; publish a deploy preview when configured.

For production deployment:

- Deploy only from the protected main branch after all required checks pass.
- Use immutable asset hashes and appropriate caching: long-lived for hashed assets, short-lived/revalidated for HTML and mutable JSON.
- Generate a sitemap, `robots.txt`, canonical URLs, Open Graph metadata, and a human-readable build/version identifier.
- Keep the previous successful deployment available for rollback.
- Schedule periodic external-link, stale-source, and V3 bar-status checks separately from deploys.

### Observability and analytics

- Prefer privacy-preserving, cookieless analytics if product analytics are needed.
- Track aggregate events such as filter use, entity opens, map/list toggle, search success/empty results, and quiz completion; never include precise coordinates, free-text search, or quiz answers without a reviewed purpose.
- Record web-vital distributions and client errors without user identifiers.
- Document the event names and payload schema before implementation so analytics do not drift.
- Provide a feature flag or configuration switch that disables analytics completely in development and preview environments.

### Security and dependency controls

- Add a restrictive Content Security Policy compatible with the chosen tile and image hosts.
- Allow images, fonts, map styles, tiles, and API connections only from documented origins.
- Sanitize rendered user-controlled or third-party HTML; V1 editorial Markdown should disallow raw HTML by default.
- Validate and encode all query parameters before rendering them into the page.
- Pin dependencies through a lockfile, enable automated vulnerability updates, and review map/provider SDK changes before merging.
- Do not scrape award or place-provider data in violation of terms; ingest only licensed feeds or manually curated facts with citations.

### Data flow

```text
Version-controlled content
        ↓
Schema validation and source checks
        ↓
Static pages + compact map/search indexes
        ↓
CDN-hosted site
        ↓
Client-side filtering, map interactions, and URL state
```

### Performance targets

- Non-map content pages should ship no more than 80KB of route JavaScript compressed; render ordinary content without hydration.
- The explore route should lazy-load the Mapbox engine and target no more than 500KB of initial interactive JavaScript compressed; load search, detail media, and later-category data on demand.
- Keep the overview GeoJSON under 75KB compressed and each category chunk under 150KB compressed for the proposed V1 dataset.
- Target p75 Largest Contentful Paint under 2.5 seconds, Interaction to Next Paint under 200ms, and Cumulative Layout Shift under 0.1 on supported production traffic.
- Target first usable list content before the map finishes loading; the user should never wait for tiles to begin reading results.
- Lazy-load detail media and non-selected category data.
- Use compressed, chunked geographic data rather than one very large file.
- Cluster markers before rendering and cap simultaneous DOM markers.
- Provide a useful list/guide experience if the map script or WebGL fails.
- Measure budgets against production builds in CI. Treat a regression beyond 10% as a failing check unless the pull request records an approved exception.

## 10. Accessibility, privacy, and safety

- Meet WCAG 2.2 AA: keyboard operation, focus management, contrast, reduced motion, labels, and screen-reader announcements.
- Provide a complete list view for all map information; the map cannot be the only route to content.
- Use text/icon redundancy for category colors and accessible names for map controls.
- Avoid requiring an account in V1 or V2.
- Store V2 answers locally by default and explain any analytics.
- In V3, request location only after the user activates “Find bars near me”; offer manual city/postcode entry.
- Do not retain precise location unless the user explicitly opts in and there is a documented need.
- Add a legal-drinking-age/responsible-consumption notice without blocking access to educational material unnecessarily.
- Avoid health claims and do not frame recommendations as encouragement to consume more alcohol.

## 11. Delivery phases

### Phase 0 — Foundation and decisions

- Confirm project name, visual direction, supported languages, and initial geographic scope.
- Finalize the category taxonomy and glossary conventions.
- Choose the static framework, map renderer, basemap provider, and hosting target.
- Define schemas, citation rules, flavor vocabulary, and price bands.
- Create an initial content backlog and acceptance criteria.

**Exit criterion:** a clickable low-fidelity prototype, validated schema, and approved sample content for two contrasting categories.

### Phase 1 — Vertical slice

- Build the responsive map shell, filters, clustering, list view, and detail drawer.
- Implement URL state and static entity pages.
- Populate two end-to-end examples, recommended: Scotch whisky and shōchū.
- Add automated schema, broken-link, accessibility, and core-flow tests.

**Exit criterion:** a user can go from category to subcategory to a verified distillery on desktop and mobile, with citations and accessible non-map navigation.

### Phase 2 — V1 content expansion

- Add the remaining core categories in prioritized batches.
- Add representative regions and a deliberately curated set of distilleries.
- Implement “Show all,” search, glossary, sources, and about pages.
- Add content review status so drafts cannot be published accidentally.
- Optimize map-data chunking, images, caching, and loading states.

**Suggested initial V1 scope:** 8 top-level filters, 25–40 subcategories/styles, 12–20 key regions, and 75–150 verified distillery markers. Favor accuracy and geographic diversity over an exhaustive producer database.

**Exit criterion:** all V1 journeys pass, every published claim has a source, all markers have verified coordinates/precision, and the site meets its performance/accessibility budgets.

### Phase 3 — V1.1 refinement

- Expand underrepresented regions and categories.
- Add comparison and timeline views if user research supports them.
- Improve SEO metadata, social cards, analytics, and correction workflow.
- Run usability sessions with beginners and spirits learners.

## 12. V2 — Taste and cocktail preference finder

### Product approach

Build an educational recommendation quiz, not a personality test. Recommendations should explain which answers affected the result and allow users to explore alternatives.

### Candidate questions

- Preferred flavor families: fruity, floral, herbal, smoky, spicy, cereal, caramel/oak, savory.
- Sweetness preference and tolerance for bitterness.
- Preferred body and alcohol intensity.
- Familiar drinks, including non-alcoholic references such as coffee, tea, citrus, or desserts.
- Cocktail choices: spirit-forward, sour, highball/long, bitter/aperitivo, tropical, creamy, or savory.
- Intended occasion and willingness to explore unfamiliar flavors.
- Optional price band, clearly localized.

### Recommendation model

- Give each answer weighted flavor/style vectors.
- Compare the answer vector with category and cocktail vectors.
- Return three recommendations: strongest match, approachable alternative, adventurous choice.
- Explain matches in plain language and link to map entities.
- Keep the rules in a version-controlled data file so editors can review them.
- Validate recommendations through expert review and user testing; do not infer sensitive traits.

### V2 acceptance criteria

- The quiz works without sign-in and can be completed by keyboard.
- Results are explainable, shareable without exposing raw private answers, and easy to retake.
- Every recommended category has a complete V1 educational page.
- Local storage and analytics behavior are disclosed.

## 13. V3 — Nearby cocktail bars

### Discovery work before implementation

- Select a places provider after reviewing coverage, cost, licensing, caching, attribution, and display rules.
- Decide whether results come from a live places API, an editorial directory, or a hybrid.
- Define what “good” means: rating alone is insufficient and can encode popularity bias.
- License or obtain permission to ingest and display third-party rankings, award names, marks, and historical results; a publicly visible list is not automatically reusable data.
- Establish a way to handle closures, incorrect locations, and sponsored listings.

### Editorial credentials and awards

Use recognized third-party credentials as trust signals alongside taste match, distance, current operating data, and practical fit. Do not treat an award as permanent proof that a venue is currently open or right for every user.

Initial credential sources to evaluate:

- **The World's 50 Best Bars:** global annual positions 1–50 and, where licensed, 51–100. Also consider the official regional lists for Asia, North America, and Europe when available. This is an expert-voted annual ranking, not a certification.
- **Tales of the Cocktail Spirited Awards:** record relevant bar awards, finalist/honoree status, category, region, and award year. This is an annual industry awards program, not a certification.
- **The Pinnacle Guide:** record one-, two-, or three-PIN status and its validity dates. This is closer to a reviewed recognition system: bars apply and are assessed through spot checks and anonymous visits, and PINs are valid for up to two years.
- **Regional equivalents:** add only programs with a published methodology, credible editorial or inspection process, stable official source, and adequate geographic coverage. Avoid unverified “best bar” listicles and user-review badges presented as professional accreditation.

For each credential, store:

```yaml
credentialId: worlds-50-best-bars
credentialType: ranking # ranking | award | reviewed-recognition
title: The World's 50 Best Bars
year: 2025
status: ranked # ranked | winner | finalist | honoree | recognized
positionOrLevel: 12
category: global
validFrom: YYYY-MM-DD
validThrough: YYYY-MM-DD # only when the issuing program defines validity
sourceUrl: "https://..."
verifiedAt: YYYY-MM-DD
```

Never convert a past ranking into a current credential. Preserve historical results for context, label the year prominently, and mark records as stale when their verification window expires.

### Recommendation method

- First filter out bars that are closed, outside the chosen radius, incompatible with essential accessibility/practical filters, or too stale to recommend confidently.
- Calculate an explainable score from **taste/cocktail match**, **distance/travel time**, **credential evidence**, **data freshness**, and **practical fit** such as budget, hours, reservations, and accessibility.
- Apply recency decay to annual rankings and awards. A current PIN may remain active only through its official validity period.
- Give modest extra confidence when independent programs recognize the same venue, but cap the credential contribution so famous bars do not always dominate.
- Do not penalize a bar merely because it has no credential; awards have uneven geographic coverage and tend to favor visible, well-traveled venues.
- Include an editorial “local discovery” lane for strong nearby options without global awards, using a documented review method.
- Keep sponsored placement completely separate from recommendation scoring and label it clearly if introduced.
- Show the user a short reason such as “matches your preference for agave-forward drinks, 1.2 km away, ranked No. 18 in The World's 50 Best Bars 2025.”

### Experience

- Let users use device location or enter a city/postcode manually.
- Show map and list views with distance, current open status if licensed/current, price indicator, accessibility information where available, and source attribution.
- Filter by recommended cocktail/spirit style, distance, budget, practical needs, and recognized credential.
- Display credential badges with program, result/level, year, and source; use official logos only when the trademark owner permits it.
- Offer distinct result groups such as **Best match for you**, **Awarded nearby**, and **Local discoveries** rather than one opaque universal ranking.
- Explain that place data may be incomplete or out of date and link to the venue/provider before travel.

### Architecture and privacy

- Send the minimum location precision required for the search.
- Do not save precise coordinates by default.
- Protect third-party API keys with a serverless endpoint where required.
- Add rate limiting, caching consistent with provider terms, error handling, and usage-cost alerts.
- Make provider attribution and data-deletion rules part of the design, not a launch afterthought.

### V3 acceptance criteria

- Each displayed ranking, award, or recognition links to its official source and includes its year or validity period.
- Expired or historic credentials are visibly distinguished from current recognition.
- Recommendation explanations identify the main taste, proximity, practical, and credential signals used.
- A user can exclude credentialed venues or browse local discoveries without being pushed toward famous bars.
- Closed or insufficiently verified bars are not recommended, even if they have a historic award.
- Automated tests cover recency decay, expired PIN status, duplicate awards, score caps, and ties.

## 14. Quality assurance

### Automated checks

- Schema validity and unique IDs/slugs.
- No orphaned category, region, producer, distillery, product, or source references.
- Coordinate bounds and duplicate/near-duplicate marker detection.
- Citation presence and review-date freshness warnings.
- Broken internal/external links.
- Unit tests for filtering, clustering inputs, URL serialization, and V2 scoring.
- End-to-end tests for the five V1 journeys.
- Accessibility scans and keyboard-flow tests.

### Manual review

- Mobile, tablet, and desktop browsers.
- Map behavior at the antimeridian and high latitudes.
- Dense areas, empty states, slow connections, and WebGL failure.
- Screen reader and reduced-motion use.
- Editorial review by someone knowledgeable in spirits laws and production.

## 15. Major risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Scope grows into an exhaustive global database | Launch with a curated dataset and publish transparent inclusion criteria |
| Legal definitions change | Store jurisdiction, source, and last-reviewed date; schedule recurring review |
| Brand marketing is presented as history | Prioritize independent/primary sources and label disputed claims |
| Map becomes slow or visually overwhelming | Chunk data, cluster markers, lazy-load details, and default to a curated overview |
| Distillery coordinates are inaccurate | Store coordinate precision and verification sources; allow approximate regional locations |
| Price information becomes stale | Use localized bands and price drivers rather than live bottle prices in V1 |
| Recommendation quiz feels arbitrary | Use a documented, testable scoring model with explanations and expert review |
| V3 places API creates cost/privacy issues | Evaluate licensing early, minimize location data, use quotas and cost alerts |
| Bar awards overrepresent famous cities or become stale | Treat credentials as one capped signal, apply recency rules, show dates, and maintain a local-discovery path |
| Ranking names, logos, or datasets have reuse restrictions | Review licensing and trademark terms before ingestion; link to official sources and use text labels when logo rights are unclear |

## 16. Pre-implementation review

### Readiness assessment

The plan is technically coherent and can support the full roadmap, but the main implementation risk is editorial scope rather than code. Eight category families, 25–40 subcategories, and up to 150 verified locations require significant research, review, coordinate verification, and maintenance. The project should therefore be built as a vertical slice and expanded through content batches, even if the public V1 ultimately includes all eight filters.

The visual direction is now specific enough to prototype, but it must be tested on a real map before the category palette is considered final. Basemap labels, country boundaries, clusters, and selected states can change perceived contrast in ways a token table cannot predict.

### Resolved during review

- Search, citations, glossary, accessible list view, and shareable URLs are consistently treated as V1 requirements.
- V1.1 now contains genuine post-launch enhancements rather than features required by core V1 journeys.
- Producer, product, and “How spirits are made” routes now match the information architecture.
- React, Tailwind CSS with semantic design tokens, Mapbox GL, typed/Zod content validation, and a dedicated explorer index are the implementation defaults.
- The chic bar direction now has named semantic tokens, separate category colors, map guidance, typography, imagery, motion, and acceptance criteria.
- Content completeness, source/legal records, media rights, performance budgets, and milestone gates are explicit.

### Recommended defaults for unresolved decisions

| Decision | Recommended default | Reason |
| --- | --- | --- |
| Primary audience | Beginners first, with expandable advanced/legal detail | Keeps the map approachable without removing WSET-level depth |
| Homepage | Editorial introduction at `/` with a prominent map preview and immediate “Explore” action | Gives context, improves SEO, and avoids loading the map bundle for every first visit |
| Explorer | Canonical route at `/explore/` | Keeps shareable map state and the static homepage separate |
| V1 category scope | Build two-category alpha, four-category beta, then all eight approved filters for public V1 | Reduces technical and editorial integration risk |
| Vertical slice | Scotch whisky plus shōchū | Exercises mature legal taxonomy, dense geography, non-Latin aliases, and distinct production traditions |
| Product records | Defer most bottle-level records to V1.1; include only a few style examples | Avoids price, availability, marketing, and maintenance overhead |
| Content format | Markdown with validated front matter for prose-rich entities; YAML/JSON for data-heavy location records | Keeps editorial writing comfortable and structured data reliable |
| Generated files | Do not commit; build deterministically in CI and attach human-readable reports | Avoids noisy diffs while preserving review visibility |
| Theme | Dark “Midnight Bar Atlas” as V1 brand theme, with forced-colors support; optional warm-light reading theme later | Delivers the requested atmosphere without delaying launch |
| Analytics | Off for the first internal alpha; introduce only a small documented event set for public beta | Prevents accidental collection before consent and purpose are settled |
| Language | English first while preserving native names, scripts, diacritics, and aliases | Avoids premature localization architecture while keeping data culturally accurate |
| Hosting/providers | Keep provider adapters narrow and make the final choice after a short licensing/cost spike | Prevents provider rules from leaking through the application |

### Required prototypes before scaffolding the full application

1. **Map legibility prototype:** dark basemap, all eight category markers, clusters, selected state, attribution, and mobile controls.
2. **Content prototype:** one complete Scotch whisky page and one shōchū page using the proposed schema and citation model.
3. **Responsive interaction prototype:** desktop filter/map/drawer and mobile chips/map/bottom-sheet flows with keyboard behavior annotated.
4. **Data-build spike:** validate two categories, generate deterministic GeoJSON/entity indexes, and reject an intentionally broken relationship.
5. **Performance spike:** load the map, overview data, and one category chunk on a throttled mid-tier mobile profile and compare against the budgets.

These prototypes may be throwaway code or small isolated pages. Their purpose is to validate the highest-risk assumptions before building the full component library.

### Stop/go criteria for implementation

Start the main implementation only when:

- The visual prototype passes contrast, grayscale, color-vision, and daylight-legibility reviews.
- The selected basemap provider’s license, attribution, public-token, quota, and caching rules are recorded.
- The two vertical-slice content records pass expert review and the schema can represent them without one-off fields.
- The product owner approves the V1 content boundary and agrees that incomplete categories remain unpublished.
- A named editor owns factual corrections and periodic review after launch.

Pause and revisit architecture if the prototypes show that the map requires server-side geospatial queries, the client artifacts exceed budgets, provider terms prevent the intended display/caching, or the structured schema cannot represent the two vertical-slice categories cleanly.

## 17. Technical implementation checklist

Complete the checklist in order within each milestone. A checked task should include code, tests, documentation, and content review where applicable.

### A. Product and architecture decisions

- [ ] Identify the primary V1 audience and the progressive-disclosure level for beginners versus advanced learners.
- [ ] Approve the eight top-level filters and canonical subcategory hierarchy.
- [ ] Define initial geographic and content scope, including explicit inclusion/exclusion criteria for distilleries and products.
- [ ] Decide whether individual product records are required for V1 or deferred to V1.1.
- [x] Select Vinext/React, Tailwind CSS with semantic tokens, Mapbox GL, search approach, npm, and the Node runtime policy.
- [ ] Select hosting, deploy-preview, basemap, tile, image, analytics, and error-reporting providers.
- [ ] Review all provider licensing, attribution, caching, quota, privacy, and token-exposure requirements.
- [ ] Approve browser support, WCAG 2.2 AA target, performance budgets, and analytics policy.
- [ ] Record decisions and tradeoffs in lightweight architecture decision records.

**Gate A:** product scope, providers, data ownership, technical stack, and measurable quality targets are approved.

### B. Repository and developer tooling

- [x] Scaffold the Vinext TypeScript project without overwriting this plan.
- [ ] Create the agreed directory structure for content, scripts, components, libraries, tests, and generated data.
- [ ] Complete strict TypeScript, content-schema, linting, formatting, and editor configuration.
- [ ] Add `.gitignore`, `.env.example`, runtime/version declaration, lockfile, and dependency-update configuration.
- [ ] Add the standard `dev`, `build`, `preview`, content-check, typecheck, lint, format-check, unit-test, and end-to-end-test scripts.
- [ ] Create a README with setup, commands, content-editing workflow, environment variables, and troubleshooting.
- [ ] Configure CI to install from the lockfile, validate, test, build, and retain reports/artifacts.
- [ ] Configure deploy previews without production secrets or indexing by search engines.
- [ ] Add baseline Content Security Policy and security headers appropriate for a static site.

**Gate B:** a clean checkout can install, validate, test, build, and preview the starter site using documented commands.

### C. Design system and application shell

- [ ] Define design tokens for typography, spacing, radii, elevation, category colors, focus, and motion.
- [ ] Select or self-host fonts with appropriate licensing, subsets, preloading, and fallbacks.
- [ ] Create accessible primitives for buttons, links, chips, checkboxes, accordions, dialog/drawer, bottom sheet, tabs, skip link, live region, loading status, and error notice.
- [ ] Build global header, navigation, footer, responsible-use notice, source link, and correction link.
- [ ] Implement desktop, tablet, and mobile layout breakpoints without hiding content required for accessibility.
- [ ] Support keyboard focus, visible focus indicators, reduced motion, high zoom, and forced-colors behavior.
- [ ] Add component-level accessibility tests for interactive primitives.
- [ ] Create loading, empty, unavailable-map, and unexpected-error patterns.

**Gate C:** the responsive shell and core components pass keyboard, screen-reader spot checks, and automated accessibility tests.

### D. Content schemas and editorial pipeline

- [ ] Implement schemas for categories, subcategories, regions, producers, distilleries, products, glossary terms, sources, legal frameworks, and redirects.
- [ ] Define controlled vocabularies for raw materials, production methods, flavor tags, price bands, coordinate precision, entity status, and review status.
- [ ] Add reusable validation for IDs, slugs, aliases, ISO dates, source references, URLs, country codes, and coordinates.
- [ ] Implement cross-file referential-integrity checks and duplicate ID/slug/coordinate detection.
- [ ] Implement publication rules so drafts cannot appear in production routes, map data, sitemaps, or search indexes.
- [ ] Implement stale-source warnings with different review intervals for laws, opening status, pricing, and history.
- [ ] Add redirect-map validation for any changed slug.
- [ ] Add source-review and content-count reports to CI.
- [ ] Document how an editor creates, reviews, publishes, archives, corrects, and redirects an entity.
- [ ] Create fixtures containing valid, invalid, draft, archived, accented-name, and antimeridian cases.
- [x] Move the published distillery markers into canonical JSON with validation for required fields, category IDs, coordinates, taste tags, source URLs, and duplicate IDs.
- [x] Generate and document a deterministic Markdown inventory for quick editorial review.

**Gate D:** the build reliably rejects malformed, orphaned, unpublished, or internally inconsistent content.

### E. Build-time data generation

- [ ] Implement deterministic entity manifest and ID/slug lookup generation.
- [ ] Generate overview and per-category GeoJSON from canonical distillery/region data.
- [ ] Strip unused prose and private editorial fields from client map artifacts.
- [ ] Generate region/category counts, related-entity lists, and map bounding boxes.
- [ ] Generate or configure the search index with canonical-name weighting and alias support.
- [ ] Generate the source-review report, sitemap inputs, and build metadata.
- [ ] Add schema-version compatibility checks between generated artifacts and client code.
- [ ] Add snapshot/unit tests for stable generation and representative edge cases.
- [ ] Measure compressed artifact sizes and split files that exceed the approved budget.
- [x] Add the distillery inventory drift check to the standard test command.

**Gate E:** identical source content produces identical map/search artifacts, and all artifacts stay within size budgets.

### F. Static routes and entity pages

- [ ] Build the homepage and primary calls to explore or browse the guide.
- [ ] Build the spirit index and generated category/subcategory pages.
- [ ] Build generated region and distillery pages.
- [ ] Build glossary index and term pages.
- [ ] Build sources/methodology, about, corrections, privacy, and responsible-use pages.
- [ ] Render source citations, last-reviewed dates, legal jurisdiction, and coordinate precision consistently.
- [ ] Add breadcrumbs and related links without creating circular or orphaned navigation.
- [ ] Add canonical URLs, page titles, descriptions, social metadata, structured data where appropriate, sitemap, and `robots.txt`.
- [ ] Add redirect behavior for changed slugs.
- [ ] Confirm every page remains readable and navigable with JavaScript disabled.

**Gate F:** each published entity has a crawlable, cited, accessible static page and no published entity is orphaned.

### G. Explore state, filters, and accessible list

- [ ] Implement the typed `ExploreState`, defaults, selectors, and validation.
- [ ] Implement stable URL serialization/parsing for filters, view, selected entity, map position, and search query.
- [ ] Add unit tests for defaults, invalid parameters, multi-filter sorting, rounding, and back/forward restoration.
- [ ] Implement top-level category filters, expandable subcategory filters, regions, “Show all,” and “Clear filters.”
- [ ] Apply documented OR-within/AND-across filter semantics.
- [ ] Implement the synchronized result count and accessible HTML list.
- [ ] Add deterministic sorting and empty-state suggestions.
- [ ] Preserve or clear selection correctly when filters change.
- [ ] Announce important changes through a polite live region without overwhelming screen-reader users.
- [ ] Persist only shareable URL state; do not silently store behavioral profiles.

**Gate G:** filtering and navigation work completely in the list view, including deep links and browser back/forward.

### H. Interactive map

- [ ] Lazy-load Mapbox and later category-data chunks only on the explore route.
- [ ] Initialize the licensed basemap with visible attribution and restricted public token configuration.
- [ ] Add clustered GeoJSON sources and cluster, count, and individual-feature layers.
- [ ] Add category shape/color styling, legend, selected-feature styling, and hover/focus equivalence where possible.
- [ ] Implement cluster expansion, deliberate filter-based fit bounds, reset view, zoom, and geolocation-free initial view.
- [ ] Synchronize map selection and viewport with `ExploreState` without URL or event loops.
- [ ] Implement the accessible entity drawer/bottom sheet and predictable focus return.
- [ ] Add loading, tile/data failure, WebGL failure, retry, and list-fallback behavior.
- [ ] Test antimeridian, world copies, high latitude, dense clusters, approximate coordinates, closed distilleries, and zero-result regions.
- [ ] Test reduced motion, keyboard controls, mobile touch targets, screen resize, and orientation changes.
- [ ] Confirm map/list results and counts stay identical under every filter combination.

**Gate H:** all five V1 journeys work on mobile and desktop, and map failure never blocks access to the underlying information.

### I. Search and detail experience

- [ ] Implement lazy-loaded, client-side search over names, aliases, categories, regions, and summaries.
- [ ] Rank exact names and aliases above body-text matches and display entity context.
- [ ] Test accented characters, macrons, punctuation, alternate spellings, and non-Latin names.
- [ ] Connect search results to static pages and explore selection as appropriate.
- [ ] Build category, subcategory, region, producer, distillery, and optional product detail view models.
- [ ] Implement taste profile, production, quality/price drivers, legal terms, history, related entities, and citations sections.
- [ ] Add share/copy-link behavior with a non-clipboard fallback.
- [ ] Ensure drawer headings, focus trap/management, Escape behavior, and close-button naming are accessible.
- [ ] Add zero-query, no-result, and search-error states.

**Gate I:** users can reliably find an entity by canonical or alternate name and understand why it belongs to its category and place.

### J. V1 content production

- [ ] Complete and expert-review Scotch whisky and shōchū as the vertical slice.
- [ ] Verify every coordinate, its precision level, and its source.
- [ ] Complete all approved top-level category summaries and required subcategories.
- [ ] Continue the sourced-marker program from the current 57 landmarks toward the agreed 75–150-marker V1 range.
- [ ] Add representative producers/brands without presenting paid or promotional rankings.
- [ ] Add taste, style, quality, price-driver, law, labeling, and history content to the defined completeness standard.
- [ ] Check each legal claim against a current primary/official source and record jurisdiction/review date.
- [ ] Perform second-source checks for founding dates, origin stories, and “first” claims.
- [ ] Review naming, diacritics, transliterations, cultural context, image licensing, and alt text.
- [ ] Resolve all blocking content-validation and stale-source findings.

**Gate J:** the V1 dataset meets the agreed scope, every published factual claim is cited, and expert editorial review is recorded.

### K. V1 testing, performance, and launch

- [ ] Add unit tests for schemas, generators, selectors, URL state, filter semantics, search, and redirects.
- [ ] Add Playwright coverage for the five V1 journeys, direct deep links, browser history, map failure, and JavaScript-disabled pages.
- [ ] Add automated WCAG checks plus manual keyboard and representative screen-reader testing.
- [ ] Test supported browsers and viewports, slow network, offline-after-load, 200%/400% zoom, and reduced motion.
- [ ] Enforce JavaScript, CSS, image, GeoJSON, and search-index budgets in CI.
- [ ] Measure Core Web Vitals on a production build and mid-tier mobile profile.
- [ ] Run broken-link, missing-alt, sitemap, canonical, metadata, CSP, and security-header checks.
- [ ] Verify analytics contains no precise location, free-text search, or sensitive quiz data.
- [ ] Create a launch checklist, rollback procedure, incident owner, correction workflow, and content-review calendar.
- [ ] Run usability sessions with beginners and advanced learners; resolve launch-blocking issues.
- [ ] Deploy production, execute smoke tests, verify monitoring, and record the release version.

**Gate K / V1 definition of done:** the approved scope is live, cited, accessible, performant, observable, recoverable, and all required automated/manual checks pass.

### L. V1.1 enhancements

- [ ] Add entity comparison only after defining meaningful comparable fields.
- [ ] Add historical timeline views with sourced dates and disputed-event handling.
- [ ] Expand underrepresented regions based on transparent coverage reporting.
- [ ] Add downloadable/shareable learning collections.
- [ ] Add localization architecture and one pilot translation before broad language expansion.
- [ ] Introduce a lightweight CMS only if the file-based editorial workflow is a demonstrated bottleneck.

### M. V2 preference finder

- [ ] Finalize questions, answer scales, flavor/style vectors, recommendation rules, and plain-language rationales.
- [ ] Define a versioned quiz schema and migration/reset behavior for locally stored results.
- [ ] Implement the scoring engine as a pure TypeScript module with fixture-based tests and no hidden demographic inference.
- [ ] Create three-result logic: strongest match, approachable alternative, and adventurous choice.
- [ ] Build the accessible step flow, progress, review, back, reset, and result experience.
- [ ] Link every recommendation to a complete V1 category page and relevant map view.
- [ ] Store answers locally only after disclosure; provide delete/reset controls.
- [ ] Create shareable results using a compact result/profile code that does not expose raw private answers.
- [ ] Conduct expert calibration and user testing; document model limitations and version.
- [ ] Verify analytics and error logs do not capture raw answers.

**V2 definition of done:** recommendations are tested, explainable, privacy-conscious, accessible, and grounded in completed educational content.

### N. V3 nearby bars and credentials

- [ ] Choose the places-data strategy and document provider terms, field availability, cache limits, cost model, attribution, and deletion requirements.
- [ ] Complete a data-protection review for precise location and implement manual city/postcode input.
- [ ] Build the serverless proxy with input validation, secret isolation, rate limiting, provider-compliant caching, timeouts, and cost alerts.
- [ ] Define the canonical bar schema, provider-ID mapping, deduplication, closure status, and last-verified logic.
- [ ] Obtain permission or a license before ingesting award/ranking datasets or displaying protected logos.
- [ ] Implement year/status/source records for World's 50 Best Bars, relevant regional lists, Spirited Awards, and Pinnacle PINs.
- [ ] Implement credential validity and recency decay, including expired PIN and historic-ranking behavior.
- [ ] Implement the explainable score using taste match, travel distance/time, practical fit, freshness, and capped credential evidence.
- [ ] Add a documented local-discovery lane so uncredentialed venues can surface fairly.
- [ ] Keep sponsored results outside the organic score and label them wherever shown.
- [ ] Build map/list results, permission prompt, manual location, filters, provider attribution, and venue verification warnings.
- [ ] Show recommendation reasons and credential year/level/source on every applicable result.
- [ ] Add automated tests for closure filtering, stale data, distance, score caps, duplicate awards, expired recognition, ties, and provider failures.
- [ ] Run geographic-bias, accessibility, privacy, latency, quota, and cost reviews before launch.

**V3 definition of done:** nearby results are current enough to act on, explainable, privacy-preserving, provider-compliant, geographically responsible, and resilient to API failure.

## 18. Decisions to make before coding

The review above supplies defaults so implementation can move forward. The product owner should explicitly confirm or override these items:

1. Confirm “Midnight Bar Atlas” as the intended interpretation of the chic bar direction.
2. Confirm beginners-first progressive disclosure with advanced WSET-aligned detail available on demand.
3. Confirm the staged content release: two-category alpha, four-category beta, all approved filters at public V1.
4. Confirm that most individual bottle/product records are deferred to V1.1.
5. Approve the initial region/distillery inclusion criteria and the named vertical-slice records.
6. Choose the basemap/tile provider and hosting platform after the licensing and performance spike.
7. Approve self-hosted display/body fonts and the photography/icon licensing budget.
8. Confirm English-first content with canonical native names, scripts, diacritics, and search aliases.
9. Decide whether public-beta analytics are needed and approve the exact event list if so.
10. Name the spirits expert/editor responsible for legal accuracy, corrections, and scheduled review.
11. Set the planned V1 launch definition—private alpha, public beta, or production—and the acceptable amount of incomplete regional coverage.
12. Decide whether users should see an optional warm-light reading theme in V1.1 or retain the dark brand theme only.

## 19. Reference baseline

- [WSET Level 3 Award in Spirits overview](https://www.wsetglobal.com/qualifications/wset-level-3-award-in-spirits)
- [WSET Level 3 Award in Spirits specification, 2025 Issue 3](https://www.wsetglobal.com/media/16505/wset_l3spirits_specification_en_feb2025_issue3.pdf)
- [The World's 50 Best Bars voting system](https://www.theworlds50best.com/bars/best-in-the-world/voting/the-voting-system)
- [Tales of the Cocktail Spirited Awards](https://talesofthecocktail.org/events/spirited-awards/)
- [The Pinnacle Guide recognition and assessment process](https://www.thepinnacleguide.com/about-the-pinnacle-guide/)

These references guide scope and terminology only. Before publishing, each category’s legal claims should be checked against the relevant current law or official geographic-indication/trade-body source.
