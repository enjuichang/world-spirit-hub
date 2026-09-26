# World Spirit Hub

A dark, editorial world-spirit atlas with switchable 2D/3D Mapbox views, 628 sourced sites across eight categories, at least six sites for every core educational subtype (most have eight or more), 53 distinct Scotch whisky distilleries, deep non-whisky coverage, an explainable taste-profile quiz, and a curated cocktail-bar finder with dated editorial credentials.

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
- `npm run build:pages` — produce a static GitHub Pages build in `out/`.
- `npm run data:sync` — validate the canonical distillery JSON and regenerate the Markdown inventory.
- `npm run data:check` — verify the JSON and confirm the generated inventory is current.
- `npm run blog:sync` — validate journal Markdown and regenerate the app’s post registry.
- `npm run blog:check` — verify that the generated post registry is current.
- `npm test` — build and verify the main rendered routes.
- `npm run lint` — run code-quality checks.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds and publishes the
site whenever `main` is updated. In the repository’s **Settings → Pages**,
select **GitHub Actions** as the source. Add a repository secret named
`NEXT_PUBLIC_MAPBOX_TOKEN` if the hosted atlas should use Mapbox; the accessible
fallback map works without it.

## Managing distilleries

[`data/distilleries.json`](data/distilleries.json) is the original inventory, paired by stable ID with the researched production and style copy in [`data/distillery-profiles.json`](data/distillery-profiles.json). [`data/subtype-expansion.json`](data/subtype-expansion.json) adds three sourced producers for each educational subtype. [`DISTILLERIES.md`](DISTILLERIES.md) is the generated, human-readable index, grouped by spirit family with official links and stable record IDs.

To add or update a distillery:

1. Edit `data/distilleries.json`; do not edit `DISTILLERIES.md` by hand.
2. Add a matching profile in `data/distillery-profiles.json` with established, production, style, and history/label context copy.
3. Keep every `id` unique and stable, enter coordinates as `[longitude, latitude]`, and use an official HTTPS source.
4. Mark regional or non-entrance coordinates as `"precision": "approximate"`.
5. Run `npm run data:sync`, then `npm test`.

The generator validates required fields, category IDs, coordinates, tags, source URLs, and duplicate IDs. The test workflow runs `data:check`, so a stale Markdown inventory fails before deployment.

## Writing journal posts

Create a URL-safe, kebab-case `.md` file in [`content/blog`](content/blog). The
filename becomes the post URL; locale suffixes such as `-en-US` and `-zh-TW`
are supported. Each post needs `title`, `description`, `date`,
and `language` front matter. Language must be `en-US` or `zh-TW`; it controls
the Journal collection, semantic language tag, and date formatting. Add an
optional `spirit` field to connect the story to one of the eight guide
categories and display a direct field-guide link:

```md
---
title: A title worth opening
description: A short preview of the story.
date: 2026-09-26
author: World Spirit Hub
language: en-US
translationKey: clear-creek-pear-brandy
spirit: rum
distillery: mount-gay
tags: labels, field notes
---

Write the story in **Markdown** here.
```

Valid spirit IDs are `whisky`, `brandy`, `rum`, `agave`, `gin`, `vodka`,
`asian`, and `flavoured`. `distillery` accepts any stable distillery ID in the
project data; use `distilleries: id-one, id-two` for several producers in the
same family. A distillery automatically supplies its spirit relationship, and
mismatched or unknown IDs fail validation. These links work in both directions:
posts link into the guide/atlas, while spirit guides and distillery drawers list
their related stories. The relationship fields, `author`, and `tags` can be
omitted. Run `npm run blog:sync` after adding a post; `npm run dev` and all
build commands also run it automatically. See
[`content/blog/README.md`](content/blog/README.md) for the supported Markdown.

To publish two language versions of one story, create one file for each locale
and give both the same `translationKey`. Each key may have at most one `en-US`
and one `zh-TW` post. The generator validates that paired versions connect to
the same spirit and distilleries. Journal and article links then follow the
reader's saved site language, with a manual language switch always available.

Blog-owned images and videos live in [`public/blog-assets`](public/blog-assets),
preferably grouped by `translationKey`. Markdown supports normal image syntax,
`@[video](...)` for local or HTTPS video, and `@[embed](...)` for sandboxed HTTPS
website embeds. Local references are checked during `blog:sync`, so missing or
unsupported files fail the build instead of publishing broken media. Complete
syntax and supported formats are documented in
[`content/blog/README.md`](content/blog/README.md).

## Main project surfaces

- `data/distilleries.json` — original website-driving distillery inventory.
- `data/subtype-expansion.json` — three additional sourced producers for every educational subtype.
- `data/distillery-profiles.json` — researched production, house-style, history, and label context for every site.
- `DISTILLERIES.md` — generated overview for quick review and link checking.
- `scripts/generate-distillery-index.mjs` — inventory validation and Markdown generation.
- `app/data.ts` — spirit categories, imported distillery records, and credentialed-bar sample.
- `app/SpiritExplorer.tsx` — 2D/3D Mapbox atlas, filtering, search, clustering, list view, official links, and distillery-specific detail profiles.
- `app/guide/` — educational field guide.
- `app/discover/` — local, explainable taste profile.
- `app/bars/` — privacy-conscious distance sorting for dated bar credentials.
- `app/blog/` — Markdown-powered journal index, article pages, and spirit-guide connections.
- `content/blog/` — editable journal posts and authoring instructions.
- `PLAN.md` — product roadmap, editorial standards, architecture, and implementation checklist.

## Editorial caveat

This is an independent educational project and is not affiliated with WSET or any award body. Map markers labeled approximate are regional learning sites rather than turn-by-turn visitor directions. Bar credentials show their source year and should be verified before travel.
