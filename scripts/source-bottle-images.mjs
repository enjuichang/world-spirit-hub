import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const baseDistilleries = JSON.parse(
  await readFile(path.join(root, "data/distilleries.json"), "utf8"),
);
const subtypeExpansion = JSON.parse(
  await readFile(path.join(root, "data/subtype-expansion.json"), "utf8"),
);
const additionalSubtypeExpansion = JSON.parse(
  await readFile(path.join(root, "data/additional-subtype-expansion.json"), "utf8"),
);
for (const [key, entries] of Object.entries(additionalSubtypeExpansion)) {
  subtypeExpansion[key] = [...(subtypeExpansion[key] ?? []), ...entries];
}
const expandedDistilleries = Object.entries(subtypeExpansion).flatMap(
  ([key, entries]) => {
    const separator = key.indexOf(":");
    const categoryId = key.slice(0, separator);
    const subcategory = key.slice(separator + 1);

    return entries.map((entry) => {
      const [id, name, place, country, longitude, latitude, descriptor, ...rest] =
        entry;
      const sourceUrl = rest.pop();
      return {
        id,
        name,
        place,
        country,
        coordinates: [longitude, latitude],
        categoryId,
        subcategory,
        descriptor,
        sourceUrl,
      };
    });
  },
);
const distilleries = [...baseDistilleries, ...expandedDistilleries];
const productPages = JSON.parse(
  await readFile(path.join(root, "data/bottle-product-pages.json"), "utf8"),
);
Object.assign(
  productPages,
  JSON.parse(
    await readFile(
      path.join(root, "data/bottle-product-pages-overrides.json"),
      "utf8",
    ),
  ),
);
const directImageOverrides = JSON.parse(
  await readFile(
    path.join(root, "data/bottle-direct-image-overrides.json"),
    "utf8",
  ),
);
const outputDir = path.join(root, "public/bottles");
const catalogPath = path.join(root, "data/bottle-images.json");
const reportPath = path.join(root, "data/bottle-image-report.json");
const onlyMissing = process.argv.includes("--missing");
const onlyDirect = process.argv.includes("--direct");
const refreshIds = new Set(
  (process.argv.find((argument) => argument.startsWith("--ids=")) ?? "")
    .replace("--ids=", "")
    .split(",")
    .filter(Boolean),
);
let existingCatalog = {};
try {
  existingCatalog = JSON.parse(await readFile(catalogPath, "utf8"));
} catch {}

await mkdir(outputDir, { recursive: true });

const positiveTerms = [
  ["packshot", 180],
  ["pack-shot", 180],
  ["bottle", 150],
  ["product", 65],
  ["front", 35],
  ["hero", 15],
  ["range", 15],
  ["collection", 10],
];
const negativeTerms = [
  ["logo", -260],
  ["icon", -220],
  ["favicon", -300],
  ["flag", -220],
  ["cocktail", -130],
  ["recipe", -100],
  ["award", -100],
  ["badge", -120],
  ["distillery", -45],
  ["tour", -70],
  ["visit", -60],
  ["person", -80],
  ["people", -80],
  ["barrel", -80],
  ["cask", -65],
  ["background", -80],
  ["banner", -60],
  ["desktop", -25],
  ["mobile", -25],
  ["social", -120],
  ["facebook", -150],
  ["instagram", -150],
];

function decodeHtml(value) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&quot;", '"')
    .replaceAll("&#x27;", "'")
    .replaceAll("\\/", "/")
    .replaceAll("\\u002F", "/");
}

function attr(tag, name) {
  const match = tag.match(
    new RegExp(`${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return decodeHtml(match?.[1] ?? match?.[2] ?? "");
}

function collectCandidates(html, pageUrl, producerName) {
  const candidates = new Map();
  const add = (rawUrl, context = "") => {
    if (!rawUrl || rawUrl.startsWith("data:")) return;
    const first = decodeHtml(rawUrl.trim().split(/\s+/)[0]);
    let url;
    try {
      url = new URL(first, pageUrl);
    } catch {
      return;
    }
    if (!/^https?:$/.test(url.protocol)) return;
    if (!/\.(?:avif|jpe?g|png|webp)(?:$|\?)/i.test(url.href)) return;
    const key = url.href;
    const haystack = `${url.pathname} ${context}`.toLowerCase();
    let score = 0;
    for (const [term, points] of positiveTerms) {
      if (haystack.includes(term)) score += points;
    }
    for (const [term, points] of negativeTerms) {
      if (haystack.includes(term)) score += points;
    }
    for (const word of producerName.toLowerCase().split(/[^a-z0-9]+/)) {
      if (word.length > 3 && haystack.includes(word)) score += 8;
    }
    if (/\.png(?:$|\?)/i.test(url.href)) score += 24;
    if (/\.webp(?:$|\?)/i.test(url.href)) score += 10;
    const previous = candidates.get(key);
    if (!previous || previous.score < score) {
      candidates.set(key, { url: key, score, context: context.trim() });
    }
  };

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    const context = [attr(tag, "alt"), attr(tag, "title"), attr(tag, "class")]
      .filter(Boolean)
      .join(" ");
    for (const name of ["src", "data-src", "data-lazy-src", "data-original"]) {
      add(attr(tag, name), context);
    }
    for (const name of ["srcset", "data-srcset"]) {
      const values = attr(tag, name).split(",").map((item) => item.trim());
      add(values.at(-1) ?? "", context);
    }
  }

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = match[0];
    const property = `${attr(tag, "property")} ${attr(tag, "name")}`;
    if (/og:image|twitter:image/i.test(property)) {
      add(attr(tag, "content"), "official product hero open graph");
    }
  }

  for (const match of html.matchAll(
    /(?:https?:)?(?:\\?\/){1,2}[^"'<>\s]+\.(?:avif|jpe?g|png|webp)(?:\?[^"'<>\s\\]*)?/gi,
  )) {
    add(match[0], "page asset");
  }

  return [...candidates.values()].sort((a, b) => b.score - a.score);
}

async function fetchPage(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: {
      "accept-language": "en-US,en;q=0.8",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/136 Safari/537.36",
    },
    signal: AbortSignal.timeout(18_000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return { html: await response.text(), url: response.url };
}

function extensionFor(contentType, sourceUrl) {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("avif")) return "avif";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg";
  const match = new URL(sourceUrl).pathname.match(/\.(avif|jpe?g|png|webp)$/i);
  return match?.[1]?.toLowerCase().replace("jpeg", "jpg") ?? "jpg";
}

async function downloadCandidate(candidate, id) {
  const response = await fetch(candidate.url, {
    redirect: "follow",
    headers: {
      referer: candidate.pageUrl,
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/136 Safari/537.36",
    },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`image HTTP ${response.status}`);
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.startsWith("image/")) throw new Error("not an image");
  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length < 8_000 || bytes.length > 12_000_000) {
    throw new Error(`implausible image size ${bytes.length}`);
  }
  const extension = extensionFor(contentType, response.url);
  const filename = `${id}.${extension}`;
  await writeFile(path.join(outputDir, filename), bytes);
  return { filename, bytes: bytes.length, finalUrl: response.url };
}

async function searchBottleImages(location) {
  const query = `${location.name} ${location.subcategory} bottle product`;
  const searchUrl = `https://www.bing.com/images/search?q=${encodeURIComponent(query)}&form=HDRSC2&first=1`;
  const response = await fetch(searchUrl, {
    headers: {
      "accept-language": "en-US,en;q=0.8",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/136 Safari/537.36",
    },
    signal: AbortSignal.timeout(18_000),
  });
  if (!response.ok) throw new Error(`image search HTTP ${response.status}`);
  const html = await response.text();
  const candidates = [];
  for (const match of html.matchAll(/\bm=(?:"([^"]+)"|'([^']+)')/gi)) {
    try {
      const metadata = JSON.parse(decodeHtml(match[1] ?? match[2] ?? ""));
      if (!metadata.murl || !metadata.purl) continue;
      const context = `${metadata.t ?? ""} ${metadata.desc ?? ""}`;
      const haystack = `${metadata.murl} ${metadata.purl} ${context}`.toLowerCase();
      let score = haystack.includes("bottle") ? 180 : 60;
      if (/logo|icon|distillery|tour|person|cocktail|barrel/.test(haystack)) score -= 180;
      for (const word of location.name.toLowerCase().split(/[^a-z0-9]+/)) {
        if (word.length > 3 && haystack.includes(word)) score += 14;
      }
      candidates.push({
        url: metadata.murl,
        pageUrl: metadata.purl,
        context,
        score,
      });
    } catch {}
  }
  return candidates.sort((a, b) => b.score - a.score);
}

async function sourceOne(location) {
  const productPage = productPages[location.id];
  const directImage = directImageOverrides[location.id];
  if (directImage) {
    try {
      const downloaded = await downloadCandidate(
        {
          url: directImage.imageSourceUrl,
          pageUrl: directImage.productPageUrl,
        },
        location.id,
      );
      return {
        id: location.id,
        status: "sourced",
        imagePath: `/bottles/${downloaded.filename}`,
        imageSourceUrl: downloaded.finalUrl,
        productPageUrl: directImage.productPageUrl,
        productName: directImage.productName,
        score: 300,
        bytes: downloaded.bytes,
      };
    } catch (error) {
      return {
        id: location.id,
        status: "missing",
        errors: [`exact bottle image: ${error.message}`],
      };
    }
  }
  const pageAttempts = [productPage?.productPageUrl, location.sourceUrl].filter(Boolean);
  try {
    pageAttempts.push(new URL("/", location.sourceUrl).href);
  } catch {}

  const errors = [];
  for (const pageUrl of [...new Set(pageAttempts)]) {
    try {
      const page = await fetchPage(pageUrl);
      const candidates = collectCandidates(
        page.html,
        page.url,
        `${location.name} ${productPage?.productName ?? ""}`,
      );
      for (const candidate of candidates.slice(0, 12)) {
        if (candidate.score < 35) continue;
        try {
          const downloaded = await downloadCandidate(
            { ...candidate, pageUrl: page.url },
            location.id,
          );
          return {
            id: location.id,
            status: "sourced",
            imagePath: `/bottles/${downloaded.filename}`,
            imageSourceUrl: downloaded.finalUrl,
            productPageUrl: page.url,
            productName:
              productPage?.productName ||
              candidate.context ||
              `${location.name} bottling`,
            score: candidate.score,
            bytes: downloaded.bytes,
          };
        } catch (error) {
          errors.push(`${candidate.url}: ${error.message}`);
        }
      }
      errors.push(`${page.url}: no bottle-like image candidate`);
    } catch (error) {
      errors.push(`${pageUrl}: ${error.message}`);
    }
  }
  try {
    const candidates = await searchBottleImages(location);
    for (const candidate of candidates.slice(0, 24)) {
      if (candidate.score < 60) continue;
      try {
        const downloaded = await downloadCandidate(candidate, location.id);
        return {
          id: location.id,
          status: "sourced",
          imagePath: `/bottles/${downloaded.filename}`,
          imageSourceUrl: downloaded.finalUrl,
          productPageUrl: candidate.pageUrl,
          productName: candidate.context || `${location.name} bottling`,
          score: candidate.score,
          bytes: downloaded.bytes,
        };
      } catch (error) {
        errors.push(`${candidate.url}: ${error.message}`);
      }
    }
    errors.push(`${location.name}: no usable bottle image search result`);
  } catch (error) {
    errors.push(`image search: ${error.message}`);
  }
  return { id: location.id, status: "missing", errors: errors.slice(-4) };
}

const locationsToSource = refreshIds.size
  ? distilleries.filter((location) => refreshIds.has(location.id))
  : onlyDirect
    ? distilleries.filter((location) => directImageOverrides[location.id])
  : onlyMissing
    ? distilleries.filter((location) => !existingCatalog[location.id])
    : distilleries;
const results = [];
const concurrency = 5;
let nextIndex = 0;
async function worker() {
  while (nextIndex < locationsToSource.length) {
    const index = nextIndex++;
    const location = locationsToSource[index];
    const result = await sourceOne(location);
    results[index] = result;
    process.stdout.write(
      `${String(index + 1).padStart(3, "0")}/${locationsToSource.length} ${location.id}: ${result.status}\n`,
    );
  }
}
await Promise.all(Array.from({ length: concurrency }, () => worker()));

const sourcedCatalog = Object.fromEntries(
  results
    .filter((result) => result.status === "sourced")
    .map(({ id, status, score, bytes, ...entry }) => [id, entry]),
);
const catalog = { ...existingCatalog, ...sourcedCatalog };
await writeFile(catalogPath, `${JSON.stringify(catalog, null, 2)}\n`);
await writeFile(reportPath, `${JSON.stringify(results, null, 2)}\n`);

const sourced = results.filter((result) => result.status === "sourced").length;
console.log(
  `Sourced ${sourced}/${locationsToSource.length} attempted bottle images; catalog now covers ${Object.keys(catalog).length}/${distilleries.length}.`,
);
