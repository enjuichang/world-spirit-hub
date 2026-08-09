# World Spirit Hub

A dark, editorial world-spirit atlas with switchable 2D/3D Mapbox views, 57 sourced landmarks across eight categories, an explainable taste-profile quiz, and a curated cocktail-bar finder with dated editorial credentials.

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
- `npm test` — build and verify the main rendered routes.
- `npm run lint` — run code-quality checks.

## Main project surfaces

- `app/data.ts` — curated spirit categories, sourced distillery landmarks, and credentialed-bar sample.
- `app/SpiritExplorer.tsx` — 2D/3D Mapbox atlas, filtering, search, clustering, list view, official distillery links, and detail drawer.
- `app/guide/` — educational field guide.
- `app/discover/` — local, explainable taste profile.
- `app/bars/` — privacy-conscious distance sorting for dated bar credentials.
- `PLAN.md` — product roadmap, editorial standards, architecture, and implementation checklist.

## Editorial caveat

This is an independent educational project and is not affiliated with WSET or any award body. Map markers labeled approximate are regional learning landmarks rather than turn-by-turn visitor directions. Bar credentials show their source year and should be verified before travel.
