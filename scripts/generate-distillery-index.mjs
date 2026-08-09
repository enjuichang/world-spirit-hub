import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const jsonUrl = new URL("../data/distilleries.json", import.meta.url);
const markdownUrl = new URL("../DISTILLERIES.md", import.meta.url);

const categories = [
  ["whisky", "Whisky & whiskey"],
  ["brandy", "Brandy & fruit spirits"],
  ["rum", "Rum & sugar cane"],
  ["agave", "Agave & related spirits"],
  ["gin", "Gin & genever"],
  ["vodka", "Vodka"],
  ["asian", "Asian grain spirits"],
  ["flavoured", "Flavored spirits & liqueurs"],
];

const categoryNames = new Map(categories);
const requiredTextFields = [
  "id",
  "name",
  "place",
  "country",
  "categoryId",
  "subcategory",
  "descriptor",
  "note",
  "sourceLabel",
  "sourceUrl",
];

function validate(distilleries) {
  if (!Array.isArray(distilleries)) throw new Error("The inventory must be an array.");

  const ids = new Set();
  for (const [index, distillery] of distilleries.entries()) {
    for (const field of requiredTextFields) {
      if (typeof distillery[field] !== "string" || !distillery[field].trim()) {
        throw new Error(`Entry ${index + 1} is missing ${field}.`);
      }
    }
    if (ids.has(distillery.id)) throw new Error(`Duplicate id: ${distillery.id}`);
    ids.add(distillery.id);

    if (!categoryNames.has(distillery.categoryId)) {
      throw new Error(`Unknown category on ${distillery.id}: ${distillery.categoryId}`);
    }
    if (
      !Array.isArray(distillery.coordinates) ||
      distillery.coordinates.length !== 2 ||
      !distillery.coordinates.every(Number.isFinite) ||
      Math.abs(distillery.coordinates[0]) > 180 ||
      Math.abs(distillery.coordinates[1]) > 90
    ) {
      throw new Error(`Invalid coordinates on ${distillery.id}.`);
    }
    if (!Array.isArray(distillery.tags) || !distillery.tags.length) {
      throw new Error(`Entry ${distillery.id} needs at least one taste tag.`);
    }
    if (!/^https:\/\//.test(distillery.sourceUrl)) {
      throw new Error(`Entry ${distillery.id} needs an HTTPS official source URL.`);
    }
  }
}

function cell(value) {
  return String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
}

function render(distilleries) {
  const lines = [
    "# World Spirit Hub — Distillery Inventory",
    "",
    "> Generated from `data/distilleries.json`. Edit the JSON, then run `npm run data:sync`.",
    "",
    `**${distilleries.length} landmarks · ${categories.length} spirit families · every marker has an official source link.**`,
    "",
    "## Coverage summary",
    "",
    "| Family | Markers |",
    "| --- | ---: |",
  ];

  for (const [categoryId, categoryName] of categories) {
    const count = distilleries.filter((item) => item.categoryId === categoryId).length;
    lines.push(`| ${categoryName} | ${count} |`);
  }

  for (const [categoryId, categoryName] of categories) {
    const entries = distilleries
      .filter((item) => item.categoryId === categoryId)
      .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));

    lines.push(
      "",
      `## ${categoryName} (${entries.length})`,
      "",
      "| Distillery / landmark | Place | Country | Style | Precision | Official website | ID |",
      "| --- | --- | --- | --- | --- | --- | --- |",
    );
    for (const item of entries) {
      lines.push(
        `| ${cell(item.name)} | ${cell(item.place)} | ${cell(item.country)} | ${cell(item.subcategory)} | ${item.precision ?? "exact"} | [Visit](${item.sourceUrl}) | \`${item.id}\` |`,
      );
    }
  }

  lines.push(
    "",
    "## Editing checklist",
    "",
    "- Keep `id` unique, lowercase, and stable after publication.",
    "- Store coordinates as `[longitude, latitude]`.",
    "- Use `precision: \"approximate\"` when a marker represents a regional or non-public production location.",
    "- Link to an official producer, distillery, appellation, or government source.",
    "- Run `npm run data:sync` after editing and `npm run data:check` before committing.",
    "",
  );

  return lines.join("\n");
}

const distilleries = JSON.parse(await readFile(jsonUrl, "utf8"));
validate(distilleries);
const markdown = render(distilleries);

if (process.argv.includes("--check")) {
  const current = await readFile(markdownUrl, "utf8").catch(() => "");
  if (current !== markdown) {
    throw new Error("DISTILLERIES.md is out of date. Run `npm run data:sync`.");
  }
  console.log(`Validated ${distilleries.length} distillery records and the Markdown index.`);
} else {
  await writeFile(markdownUrl, markdown);
  console.log(`Generated DISTILLERIES.md from ${distilleries.length} records.`);
}
