import assert from "node:assert/strict";
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
  assert.match(html, /<strong>672<\/strong> sites/);
  assert.match(html, /Choose 2D or 3D map/);
  assert.match(html, /2D<\/button>/);
  assert.match(html, /3D<\/button>/);
  assert.match(html, /Know the family/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("renders the educational guide", async () => {
  const [indexResponse, whiskyResponse, brandyResponse] = await Promise.all([
    render("/guide"),
    render("/guide/whisky"),
    render("/guide/brandy"),
  ]);
  assert.equal(indexResponse.status, 200);
  assert.equal(whiskyResponse.status, 200);
  assert.equal(brandyResponse.status, 200);

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
  assert.match(whiskyHtml, /Distillery map/);
  assert.match(whiskyHtml, /162(?:<!-- -->)? documented production sites/);

  const brandyHtml = await brandyResponse.text();
  assert.match(brandyHtml, /More than 98% of Cognac vineyards/);
  assert.match(brandyHtml, /Folle Blanche/);
  assert.match(brandyHtml, /Colombard/);
  assert.match(brandyHtml, /Borderies/);
  assert.match(brandyHtml, /France with orientation markers for the six crus/);
  assert.match(brandyHtml, /VS Cognac/);
  assert.match(brandyHtml, /90(?:<!-- -->)? documented production sites/);
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
