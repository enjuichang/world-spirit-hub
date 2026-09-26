import { access, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contentDirectory = resolve(root, "content/blog");
const outputFile = resolve(root, "app/blog/generated-posts.ts");
const summaryOutputFile = resolve(root, "app/blog/generated-post-summaries.ts");
const publicDirectory = resolve(root, "public");
const allowedSpirits = new Set([
  "whisky",
  "brandy",
  "rum",
  "agave",
  "gin",
  "vodka",
  "asian",
  "flavoured",
]);
const allowedLanguages = new Set(["en-US", "zh-TW"]);
const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"]);
const videoExtensions = new Set([".mp4", ".ogg", ".webm"]);
const mapRegions = new Set(["oregon"]);

const [canonicalDistilleries, subtypeExpansion, additionalSubtypeExpansion] = await Promise.all([
  readFile(resolve(root, "data/distilleries.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/subtype-expansion.json"), "utf8").then(JSON.parse),
  readFile(resolve(root, "data/additional-subtype-expansion.json"), "utf8").then(JSON.parse),
]);

const distilleryCategoryById = new Map(
  canonicalDistilleries.map((distillery) => [distillery.id, distillery.categoryId]),
);
for (const expansion of [subtypeExpansion, additionalSubtypeExpansion]) {
  for (const [key, entries] of Object.entries(expansion)) {
    const categoryId = key.slice(0, key.indexOf(":"));
    for (const entry of entries) distilleryCategoryById.set(entry[0], categoryId);
  }
}

function parseFrontMatter(source, filename) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error(`${filename}: missing --- front matter block`);

  const metadata = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(":");
    if (separator < 1) throw new Error(`${filename}: invalid front matter line: ${line}`);
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    metadata[key] = value;
  }

  for (const field of ["title", "description", "date", "language"]) {
    if (!metadata[field]) throw new Error(`${filename}: ${field} is required`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) || Number.isNaN(Date.parse(`${metadata.date}T00:00:00Z`))) {
    throw new Error(`${filename}: date must use YYYY-MM-DD`);
  }
  if (metadata.spirit && !allowedSpirits.has(metadata.spirit)) {
    throw new Error(`${filename}: unknown spirit '${metadata.spirit}'`);
  }
  if (!allowedLanguages.has(metadata.language)) {
    throw new Error(`${filename}: language must be en-US or zh-TW`);
  }

  return {
    metadata,
    body: match[2].trim(),
  };
}

async function validateLocalAsset(url, filename, kind) {
  const pathname = decodeURIComponent(new URL(url, "https://local.invalid").pathname);
  const assetFile = resolve(publicDirectory, `.${pathname}`);
  const assetRelativePath = relative(publicDirectory, assetFile);
  if (assetRelativePath.startsWith("..") || assetRelativePath.startsWith("/")) {
    throw new Error(`${filename}: asset path escapes the public directory`);
  }
  const extension = extname(pathname).toLowerCase();
  const allowedExtensions = kind === "image" ? imageExtensions : videoExtensions;
  if (!allowedExtensions.has(extension)) {
    throw new Error(`${filename}: unsupported ${kind} extension '${extension || "none"}'`);
  }
  await access(assetFile).catch(() => {
    throw new Error(`${filename}: local asset '${url}' does not exist in public/`);
  });
}

async function validateMediaReferences(body, filename) {
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    const image = trimmed.match(/^!\[[^\]]*\]\((\S+?)(?:\s+"[^"]+")?\)$/);
    const video = trimmed.match(/^@\[video\]\((\S+?)(?:\s+"[^"]+")?\)$/);
    const embed = trimmed.match(/^@\[embed\]\((\S+?)(?:\s+"[^"]+")?\)$/);
    const map = trimmed.match(/^@\[map\]\(([a-z0-9-]+)\s+(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s+"([^"]+)"\)$/);

    if (trimmed.startsWith("![") && !image) {
      throw new Error(`${filename}: invalid image syntax`);
    }
    if (trimmed.startsWith("@[video]") && !video) {
      throw new Error(`${filename}: invalid video syntax`);
    }
    if (trimmed.startsWith("@[embed]") && !embed) {
      throw new Error(`${filename}: invalid embed syntax`);
    }
    if (trimmed.startsWith("@[map]") && !map) {
      throw new Error(`${filename}: invalid map syntax`);
    }

    for (const [kind, match] of [["image", image], ["video", video]]) {
      if (!match) continue;
      if (match[1].startsWith("/")) await validateLocalAsset(match[1], filename, kind);
      else if (!match[1].startsWith("https://")) {
        throw new Error(`${filename}: ${kind} URLs must be local public paths or HTTPS URLs`);
      }
    }
    if (embed && !embed[1].startsWith("https://")) {
      throw new Error(`${filename}: embedded websites must use HTTPS`);
    }
    if (map) {
      const [, region, latitudeValue, longitudeValue, label] = map;
      const latitude = Number(latitudeValue);
      const longitude = Number(longitudeValue);
      if (!mapRegions.has(region)) {
        throw new Error(`${filename}: unsupported map region '${region}'`);
      }
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw new Error(`${filename}: map coordinates are outside the valid latitude/longitude range`);
      }
      if (!label.trim()) throw new Error(`${filename}: map label cannot be empty`);
    }
  }
}

const files = (await readdir(contentDirectory))
  .filter((filename) => extname(filename) === ".md" && filename.toLowerCase() !== "readme.md")
  .sort();

const posts = await Promise.all(
  files.map(async (filename) => {
    const slug = filename.replace(/\.md$/, "");
    if (!/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/.test(slug)) {
      throw new Error(`${filename}: filenames must use URL-safe kebab-case`);
    }
    const { metadata, body } = parseFrontMatter(
      await readFile(resolve(contentDirectory, filename), "utf8"),
      filename,
    );
    await validateMediaReferences(body, filename);
    if (metadata.distillery && metadata.distilleries) {
      throw new Error(`${filename}: use distillery or distilleries, not both`);
    }
    const distilleryIds = (metadata.distilleries || metadata.distillery || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    for (const id of distilleryIds) {
      if (!distilleryCategoryById.has(id)) throw new Error(`${filename}: unknown distillery '${id}'`);
    }
    const connectedCategories = new Set(distilleryIds.map((id) => distilleryCategoryById.get(id)));
    if (connectedCategories.size > 1) {
      throw new Error(`${filename}: connected distilleries must belong to the same spirit family`);
    }
    const inferredSpiritId = connectedCategories.values().next().value;
    if (metadata.spirit && inferredSpiritId && metadata.spirit !== inferredSpiritId) {
      throw new Error(`${filename}: spirit '${metadata.spirit}' does not match the connected distillery family '${inferredSpiritId}'`);
    }
    return {
      slug,
      title: metadata.title,
      description: metadata.description,
      date: metadata.date,
      author: metadata.author || undefined,
      language: metadata.language,
      translationKey: metadata.translationKey || undefined,
      spiritId: metadata.spirit || inferredSpiritId || undefined,
      distilleryIds,
      tags: metadata.tags ? metadata.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      body,
    };
  }),
);

posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));

const translationGroups = new Map();
for (const post of posts) {
  if (!post.translationKey) continue;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.translationKey)) {
    throw new Error(`${post.slug}: translationKey must use lowercase kebab-case`);
  }
  const group = translationGroups.get(post.translationKey) ?? [];
  if (group.some((candidate) => candidate.language === post.language)) {
    throw new Error(`${post.slug}: translationKey '${post.translationKey}' already has a ${post.language} version`);
  }
  group.push(post);
  translationGroups.set(post.translationKey, group);
}

for (const [translationKey, group] of translationGroups) {
  const reference = group[0];
  for (const post of group.slice(1)) {
    const sameSpirit = post.spiritId === reference.spiritId;
    const sameDistilleries = JSON.stringify([...post.distilleryIds].sort()) === JSON.stringify([...reference.distilleryIds].sort());
    if (!sameSpirit || !sameDistilleries) {
      throw new Error(`${post.slug}: translations for '${translationKey}' must connect to the same spirit and distilleries`);
    }
  }
}

const generated = `// Generated from content/blog/*.md by scripts/generate-blog-content.mjs.\n// Do not edit this file directly.\n\nimport type { BlogPost } from "./types";\n\nexport const blogPosts: BlogPost[] = ${JSON.stringify(posts, null, 2)};\n`;
const summaries = posts.map((post) => ({
  slug: post.slug,
  title: post.title,
  description: post.description,
  date: post.date,
  author: post.author,
  language: post.language,
  translationKey: post.translationKey,
  spiritId: post.spiritId,
  distilleryIds: post.distilleryIds,
  tags: post.tags,
}));
const generatedSummaries = `// Generated from content/blog/*.md by scripts/generate-blog-content.mjs.\n// Do not edit this file directly.\n\nimport type { BlogPostSummary } from "./types";\n\nexport const blogPostSummaries: BlogPostSummary[] = ${JSON.stringify(summaries, null, 2)};\n`;
const [current, currentSummaries] = await Promise.all([
  readFile(outputFile, "utf8").catch(() => ""),
  readFile(summaryOutputFile, "utf8").catch(() => ""),
]);

if (process.argv.includes("--check")) {
  if (current !== generated || currentSummaries !== generatedSummaries) {
    console.error("Blog content is stale. Run npm run blog:sync.");
    process.exitCode = 1;
  }
} else if (current !== generated) {
  await Promise.all([
    writeFile(outputFile, generated),
    writeFile(summaryOutputFile, generatedSummaries),
  ]);
  console.log(`Generated ${posts.length} blog post${posts.length === 1 ? "" : "s"}.`);
} else if (currentSummaries !== generatedSummaries) {
  await writeFile(summaryOutputFile, generatedSummaries);
  console.log(`Generated ${posts.length} blog post summar${posts.length === 1 ? "y" : "ies"}.`);
}
