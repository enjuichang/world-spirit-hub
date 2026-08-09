# World Spirit Hub

A dark, editorial world-spirit atlas with an interactive Mapbox map, eight-category field guide, explainable taste-profile quiz, and a curated cocktail-bar finder with dated editorial credentials.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server.

## Map configuration

The atlas uses Mapbox GL JS. It can run locally with the included token-free dark raster fallback. To use Mapbox’s customizable Dark style, copy `.env.example` to `.env.local` and add a public URL-restricted token:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=your_public_token
```

Never put a secret Mapbox token in a `NEXT_PUBLIC_*` variable.

## Commands

- `npm run dev` — start the development site.
- `npm run build` — produce the Cloudflare-compatible deployment build.
- `npm test` — build and verify the main rendered routes.
- `npm run lint` — run code-quality checks.

## Main project surfaces

- `app/data.ts` — curated spirit categories, map landmarks, and credentialed-bar sample.
- `app/SpiritExplorer.tsx` — Mapbox atlas, filtering, search, clustering, list view, and detail drawer.
- `app/guide/` — educational field guide.
- `app/discover/` — local, explainable taste profile.
- `app/bars/` — privacy-conscious distance sorting for dated bar credentials.
- `PLAN.md` — product roadmap, editorial standards, architecture, and implementation checklist.

## Editorial caveat

This is an independent educational project and is not affiliated with WSET or any award body. Map markers labeled approximate are regional learning landmarks rather than turn-by-turn visitor directions. Bar credentials show their source year and should be verified before travel.

