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
  assert.match(html, /<strong>636<\/strong> sites/);
  assert.match(html, /Choose 2D or 3D map/);
  assert.match(html, /2D<\/button>/);
  assert.match(html, /3D<\/button>/);
  assert.match(html, /Know the family/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("renders the educational guide", async () => {
  const [indexResponse, whiskyResponse, brandyResponse, agaveResponse] = await Promise.all([
    render("/guide"),
    render("/guide/whisky"),
    render("/guide/brandy"),
    render("/guide/agave"),
  ]);
  assert.equal(indexResponse.status, 200);
  assert.equal(whiskyResponse.status, 200);
  assert.equal(brandyResponse.status, 200);
  assert.equal(agaveResponse.status, 200);

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
  assert.match(agaveHtml, /Mexico context · Highlands \+ Valley · official denomination/i);
  assert.match(agaveHtml, /Tequila DO/);
  assert.match(agaveHtml, /Los Altos · Highlands/);
  assert.match(agaveHtml, /trade and terroir language, not separate classes/i);
  assert.doesNotMatch(agaveHtml, /Geographic focus · Mexico/);
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
  for (const countryName of ["Australia", "China", "Finland", "Netherlands", "South Korea", "United Kingdom", "United States"]) {
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
