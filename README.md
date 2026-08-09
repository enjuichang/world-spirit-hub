# World Spirit Hub

A dark, editorial world-spirit atlas with switchable 2D/3D Mapbox views, 112 sourced landmarks across eight categories, at least two landmarks for every educational subtype, an explainable taste-profile quiz, and a curated cocktail-bar finder with dated editorial credentials.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Map configuration

The atlas uses Mapbox GL JS with a customized Dark style. Copy `.env.example` to `.env.local` and add a public URL-restricted token:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_public_token
```

Never put a secret Mapbox token in a `NEXT_PUBLIC_*` variable.
If the token is absent or Mapbox cannot load, the accessible location list remains available.

## Commands

- `npm run dev` — start the development site.
- `npm run build` — produce the Cloudflare-compatible deployment build.
- `npm run data:sync` — validate the canonical distillery JSON and regenerate the Markdown inventory.
- `npm run data:check` — verify the JSON and confirm the generated inventory is current.
- `npm test` — build and verify the main rendered routes.
- `npm run lint` — run code-quality checks.

## Managing distilleries

[`data/distilleries.json`](data/distilleries.json) is the canonical inventory, paired by stable ID with the researched production and style copy in [`data/distillery-profiles.json`](data/distillery-profiles.json). [`DISTILLERIES.md`](DISTILLERIES.md) is the generated, human-readable index, grouped by spirit family with official links and stable record IDs.

To add or update a distillery:

1. Edit `data/distilleries.json`; do not edit `DISTILLERIES.md` by hand.
2. Add a matching profile in `data/distillery-profiles.json` with established, production, style, and history/label context copy.
3. Keep every `id` unique and stable, enter coordinates as `[longitude, latitude]`, and use an official HTTPS source.
4. Mark regional or non-entrance coordinates as `"precision": "approximate"`.
5. Run `npm run data:sync`, then `npm test`.

The generator validates required fields, category IDs, coordinates, tags, source URLs, and duplicate IDs. The test workflow runs `data:check`, so a stale Markdown inventory fails before deployment.

## Main project surfaces

- `data/distilleries.json` — canonical, website-driving distillery inventory.
- `data/distillery-profiles.json` — researched production, house-style, history, and label context for every landmark.
- `DISTILLERIES.md` — generated overview for quick review and link checking.
- `scripts/generate-distillery-index.mjs` — inventory validation and Markdown generation.
- `app/data.ts` — spirit categories, imported distillery records, and credentialed-bar sample.
- `app/SpiritExplorer.tsx` — 2D/3D Mapbox atlas, filtering, search, clustering, list view, official links, and distillery-specific detail profiles.
- `app/guide/` — educational field guide.
- `app/discover/` — local, explainable taste profile.
- `app/bars/` — privacy-conscious distance sorting for dated bar credentials.
- `PLAN.md` — product roadmap, editorial standards, architecture, and implementation checklist.

## Editorial caveat

This is an independent educational project and is not affiliated with WSET or any award body. Map markers labeled approximate are regional learning landmarks rather than turn-by-turn visitor directions. Bar credentials show their source year and should be verified before travel.
