# Writing for the journal

Add a `.md` file to this folder and run `npm run blog:sync` (the dev and build
commands run it automatically). The URL-safe kebab-case filename becomes the
URL slug; standard locale suffixes such as `-en-US` and `-zh-TW` are supported.

Every post starts with front matter:

```md
---
title: Your post title
description: A short summary used on the journal page and in search previews.
date: 2026-09-26
author: Your name
language: en-US
translationKey: your-story-key
spirit: rum
distillery: mount-gay
tags: tasting, production
---
```

`title`, `description`, `date`, and `language` are required. Language must be
`en-US` or `zh-TW`; the Journal uses it to place the post in the correct
language collection and to format its publication date. Give translated
versions of the same article the same optional `translationKey`. The site will
then choose the version matching the reader's saved language preference and
show a language switch on the article. `author`, `translationKey`, `spirit`,
`distillery`, and `tags` are optional. To connect a post to a spirit guide, set
`spirit` to one of:
`whisky`, `brandy`, `rum`, `agave`, `gin`, `vodka`, `asian`, or `flavoured`.
Use the stable ID from `data/distilleries.json` (or either subtype-expansion
file) to connect a distillery. A distillery connection automatically connects
the post to that distillery's spirit family. You can also use `distilleries`
with comma-separated IDs when a story covers several producers. Delete the
relationship lines when a post should stand on its own.

## Images, video, maps, and embedded websites

Store post-owned files under `public/blog-assets/<translation-key>/`. Files in
`public/` are addressed from Markdown with a leading slash. The build checks
that referenced local files exist and that their file types are supported.

```md
![A descriptive alt text](/blog-assets/your-story-key/photo.webp "Optional caption")

@[video](/blog-assets/your-story-key/interview.mp4 "Optional video caption")

@[embed](https://www.youtube.com/embed/VIDEO_ID "Optional embed title")

@[map](oregon 45.7089 -121.5123 "Hood River, Oregon")
```

Images support AVIF, GIF, JPEG, PNG, SVG, and WebP. Videos support MP4, OGG,
and WebM. Remote image and video URLs must use HTTPS. Website embeds are
sandboxed, lazy-loaded, and must use HTTPS; some websites block iframe embeds,
so use the provider's official embed URL when available. Every embed includes
an external source link as a fallback.

Locator maps are self-contained, so they do not require an API key or contact a
third-party map service. Use latitude first, longitude second, followed by the
visible place label. The `oregon` region is currently available; the build
checks map syntax, supported regions, and coordinate ranges.

The journal also supports headings, paragraphs, links, bold and italic text,
inline code, blockquotes, ordered and unordered lists, dividers, and fenced
code blocks.
