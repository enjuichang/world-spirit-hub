import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, {
      headers: { accept: "text/html", host: "localhost" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the finished World Spirit Hub homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>World Spirit Hub — A spirited atlas<\/title>/i);
  assert.match(html, /Every spirit has/);
  assert.match(html, /Show all spirits/);
  assert.match(html, /<strong>636<\/strong>\s*(?:<!-- -->)?\s*sites/);
  assert.match(html, /Choose 2D or 3D map/);
  assert.match(html, /2D<\/button>/);
  assert.match(html, /3D<\/button>/);
  assert.match(html, /Know the family/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("renders the educational guide", async () => {
  const [indexResponse, whiskyResponse, brandyResponse, agaveResponse, asianResponse, flavouredResponse] = await Promise.all([
    render("/guide"),
    render("/guide/whisky"),
    render("/guide/brandy"),
    render("/guide/agave"),
    render("/guide/asian"),
    render("/guide/flavoured"),
  ]);
  assert.equal(indexResponse.status, 200);
  assert.equal(whiskyResponse.status, 200);
  assert.equal(brandyResponse.status, 200);
  assert.equal(agaveResponse.status, 200);
  assert.equal(asianResponse.status, 200);
  assert.equal(flavouredResponse.status, 200);

  const indexHtml = await indexResponse.text();
  assert.match(indexHtml, /Eight families/);
  assert.match(indexHtml, /Choose a spirit family/);
  assert.match(indexHtml, /Whisky &amp; whiskey/);
  assert.match(indexHtml, /Asian grain spirits/);
  assert.match(indexHtml, /branding distinctions/);

  const whiskyHtml = await whiskyResponse.text();
  assert.match(whiskyHtml, /Production infographic/);
  assert.match(whiskyHtml, /Common terms on the bottle/);
  assert.match(whiskyHtml, /Single malt Scotch/);
  assert.match(whiskyHtml, /Blended Scotch/);
  assert.match(whiskyHtml, /Regional names found on labels/);
  assert.match(whiskyHtml, /Subtype field cards/);
  assert.match(whiskyHtml, /Regional vector atlas/);
  assert.match(whiskyHtml, /From introductory to advanced/);
  assert.match(whiskyHtml, /Blended Irish whiskey/);
  assert.match(whiskyHtml, /Australian whisky/);
  assert.match(whiskyHtml, /LARK Pontville Distillery/);
  assert.match(whiskyHtml, /Distillery map/);
  assert.match(whiskyHtml, /169(?:<!-- -->)? documented production sites/);

  const brandyHtml = await brandyResponse.text();
  assert.match(brandyHtml, /More than 98% of Cognac vineyards/);
  assert.match(brandyHtml, /Folle Blanche/);
  assert.match(brandyHtml, /Colombard/);
  assert.match(brandyHtml, /Borderies/);
  assert.match(brandyHtml, /The six official Cognac crus/);
  assert.match(brandyHtml, /VS Cognac/);
  assert.match(brandyHtml, /86(?:<!-- -->)? documented production sites/);

  const agaveHtml = await agaveResponse.text();
  const asianHtml = await asianResponse.text();
  const flavouredHtml = await flavouredResponse.text();
  assert.match(agaveHtml, /Mexico context · Highlands \+ Valley · official denomination/i);
  assert.match(agaveHtml, /Tequila DO/);
  assert.match(agaveHtml, /Los Altos · Highlands/);
  assert.match(agaveHtml, /trade and terroir language, not separate classes/i);
  assert.doesNotMatch(agaveHtml, /Geographic focus · Mexico/);

  assert.match(asianHtml, /Geographic focus · China › Guizhou/);
  assert.match(flavouredHtml, /Europe context · Sweden \+ Norway/);
});

test("Australian whisky has a map boundary and representative distilleries", async () => {
  const [expansion, boundaries] = await Promise.all([
    readFile(new URL("../data/additional-subtype-expansion.json", import.meta.url), "utf8").then(JSON.parse),
    readFile(new URL("../app/guide/australia-boundary.json", import.meta.url), "utf8").then(JSON.parse),
  ]);

  assert.equal(expansion["whisky:Australian whisky"].length, 8);
  assert.equal(boundaries.features[0].properties.id, "Australia");
  assert.equal(boundaries.features[0].geometry.type, "MultiPolygon");
});

test("all maps share complete, detailed country vectors", async () => {
  const [worldSvg, guideBoundaries] = await Promise.all([
    readFile(new URL("../public/world-equirectangular.svg", import.meta.url), "utf8"),
    readFile(new URL("../app/guide/refined-country-boundaries.json", import.meta.url), "utf8").then(JSON.parse),
  ]);

  assert.equal((worldSvg.match(/class="country /g) ?? []).length, 258);
  for (const countryCode of ["AUS", "CHN", "FIN", "FRA", "NLD", "USA"]) {
    assert.match(worldSvg, new RegExp(`class="country ${countryCode}"`));
  }

  assert.ok(guideBoundaries.features.length >= 33);
  for (const countryName of ["Australia", "China", "Finland", "Netherlands", "Norway", "South Korea", "United Kingdom", "United States"]) {
    assert.ok(guideBoundaries.features.some((feature) => feature.properties.id === countryName));
  }
});

test("Bourbon uses a Kentucky state boundary", async () => {
  const boundaries = await readFile(new URL("../app/guide/kentucky-boundary.json", import.meta.url), "utf8").then(JSON.parse);

  assert.equal(boundaries.features[0].properties.id, "Kentucky");
  assert.equal(boundaries.features[0].geometry.type, "MultiPolygon");
});

test("Texas sotol-style spirits use a Texas state boundary", async () => {
  const boundaries = await readFile(new URL("../app/guide/texas-boundary.json", import.meta.url), "utf8").then(JSON.parse);

  assert.equal(boundaries.features[0].properties.id, "Texas");
  assert.equal(boundaries.features[0].geometry.type, "MultiPolygon");
});

test("renders the taste profile and credentialed bar experiences", async () => {
  const [quizResponse, barsResponse] = await Promise.all([
    render("/discover"),
    render("/bars"),
  ]);
  assert.equal(quizResponse.status, 200);
  assert.equal(barsResponse.status, 200);

  const quizHtml = await quizResponse.text();
  const barsHtml = await barsResponse.text();
  assert.match(quizHtml, /Which aroma pulls you closer/);
  assert.match(quizHtml, /Answers stay on this device/);
  assert.match(barsHtml, /Remarkable bars/);
  assert.match(barsHtml, /World’s 50 Best Bars/);
  assert.match(barsHtml, /Your coordinates stay in this browser/);
});

test("renders the localized Markdown journal with bidirectional spirit and distillery links", async () => {
  const [indexResponse, allResponse, englishResponse, traditionalChineseResponse, postResponse, translatedPostResponse, brandyGuideResponse, distilleryResponse] = await Promise.all([
    render("/blog"),
    render("/blog?language=all"),
    render("/blog?language=en-US"),
    render("/blog?language=zh-TW"),
    render("/blog/clear-creek-pear-brandy-en-US"),
    render("/blog/clear-creek-pear-brandy-zh-TW"),
    render("/guide/brandy"),
    render("/?distillery=clear-creek-brandy"),
  ]);

  assert.equal(indexResponse.status, 200);
  assert.equal(allResponse.status, 200);
  assert.equal(englishResponse.status, 200);
  assert.equal(traditionalChineseResponse.status, 200);
  assert.equal(postResponse.status, 200);
  assert.equal(translatedPostResponse.status, 200);
  assert.equal(brandyGuideResponse.status, 200);
  assert.equal(distilleryResponse.status, 200);

  const indexHtml = await indexResponse.text();
  const allHtml = await allResponse.text();
  const englishHtml = await englishResponse.text();
  const traditionalChineseHtml = await traditionalChineseResponse.text();
  const postHtml = await postResponse.text();
  const translatedPostHtml = await translatedPostResponse.text();
  const brandyGuideHtml = await brandyGuideResponse.text();
  const distilleryHtml = await distilleryResponse.text();
  assert.match(indexHtml, /Stories from inside the bottle/);
  assert.match(indexHtml, /English/);
  assert.match(indexHtml, /繁體中文/);
  assert.match(indexHtml, /href="\/blog\/clear-creek-pear-brandy-en-US"/);
  assert.doesNotMatch(indexHtml, /href="\/blog\/clear-creek-pear-brandy-zh-TW"/);
  assert.match(allHtml, /href="\/blog\/clear-creek-pear-brandy-en-US"/);
  assert.doesNotMatch(allHtml, /href="\/blog\/clear-creek-pear-brandy-zh-TW"/);
  assert.match(englishHtml, /href="\/blog\/clear-creek-pear-brandy-en-US"/);
  assert.doesNotMatch(englishHtml, /href="\/blog\/clear-creek-pear-brandy-zh-TW"/);
  assert.match(traditionalChineseHtml, /href="\/blog\/clear-creek-pear-brandy-zh-TW"/);
  assert.doesNotMatch(traditionalChineseHtml, /href="\/blog\/clear-creek-pear-brandy-en-US"/);
  assert.match(postHtml, /lang="en-US"/);
  assert.match(postHtml, /Read in/);
  assert.match(postHtml, /href="\/blog\/clear-creek-pear-brandy-zh-TW"/);
  assert.match(postHtml, /hrefLang="zh-TW"/);
  assert.match(translatedPostHtml, /lang="zh-TW"/);
  assert.match(translatedPostHtml, /閱讀語言/);
  assert.match(translatedPostHtml, /href="\/blog\/clear-creek-pear-brandy-en-US"/);
  assert.match(translatedPostHtml, /Map of Oregon showing Hood River, Oregon/);
  assert.match(translatedPostHtml, /45\.7089° N/);
  assert.match(translatedPostHtml, /121\.5123° W/);
  assert.match(postHtml, /Story context/);
  assert.match(postHtml, /Spirit family at a glance/);
  assert.match(postHtml, /Brandy &amp; fruit spirits/);
  assert.match(postHtml, /href="\/guide\/brandy"/);
  assert.match(postHtml, /Distillery/);
  assert.match(postHtml, /Clear Creek Distillery/);
  assert.match(postHtml, /Representative bottle/);
  assert.match(postHtml, /src="\/bottles\/clear-creek-brandy.webp"/);
  assert.match(postHtml, /Production signature/);
  assert.match(postHtml, /Style in the glass/);
  assert.match(postHtml, /Taste cues/);
  assert.match(postHtml, /href="\/\?distillery=clear-creek-brandy#explore"/);
  assert.ok(postHtml.indexOf("post-profile-section") < postHtml.indexOf("post-body"));
  assert.match(brandyGuideHtml, /Stories connected to [\s\S]*Brandy &amp; fruit spirits/);
  assert.match(brandyGuideHtml, /href="\/blog\/clear-creek-pear-brandy-en-US"/);
  assert.match(distilleryHtml, /Stories featuring [\s\S]*Clear Creek Distillery/);
  assert.match(distilleryHtml, /href="\/blog\/clear-creek-pear-brandy-en-US"/);
});
