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
  assert.match(html, /<strong>150<\/strong> landmarks/);
  assert.match(html, /Choose 2D or 3D map/);
  assert.match(html, /2D<\/button>/);
  assert.match(html, /3D<\/button>/);
  assert.match(html, /Know the family/);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|Building your site/i);
});

test("renders the educational guide", async () => {
  const response = await render("/guide");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Eight families/);
  assert.match(html, /Whisky &amp; whiskey/);
  assert.match(html, /Asian grain spirits/);
  assert.match(html, /Production infographic/);
  assert.match(html, /Regional names found on labels/);
  assert.match(html, /Subtype field cards/);
  assert.match(html, /Regional production atlas/);
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
