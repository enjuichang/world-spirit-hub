import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const jsonUrl = new URL("../data/distilleries.json", import.meta.url);
const profilesUrl = new URL("../data/distillery-profiles.json", import.meta.url);
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
const requiredSubtypes = new Map([
  ["whisky", ["Scotch whisky", "Bourbon", "Rye whiskey", "Tennessee whiskey", "Irish whiskey", "Canadian whisky", "Japanese whisky", "Taiwanese single malt whisky", "Indian single malt whisky"]],
  ["brandy", ["Cognac", "Armagnac", "Brandy de Jerez", "Pisco", "Grappa", "Calvados", "Fruit eaux-de-vie", "Singani", "South African pot-still brandy"]],
  ["rum", ["Molasses-based rum", "Cane-juice rum", "Rhum agricole", "Jamaican rum", "Cuban-style rum", "Cachaça", "Clairin"]],
  ["agave", ["Tequila", "Mezcal", "Ancestral mezcal", "Bacanora", "Raicilla", "Sotol"]],
  ["gin", ["London Dry Gin", "Distilled gin", "Contemporary gin", "Old Tom gin", "Genever", "Barrel-aged gin"]],
  ["vodka", ["Neutral vodka", "Characterful vodka", "Flavored vodka", "Infused vodka", "Potato vodka"]],
  ["asian", ["Strong-aroma baijiu", "Sauce-aroma baijiu", "Light-aroma baijiu", "Rice-aroma baijiu", "Honkaku shōchū", "Awamori", "Diluted soju", "Distilled soju", "Kaoliang"]],
  ["flavoured", ["Liqueurs", "Amari", "Aniseed spirits", "Aquavit", "Cocktail bitters", "Flavored vodka", "Infused vodka", "Absinthe"]],
]);
const minimumSubtypeCoverage = 2;
const minimumSubtypeCoverageOverrides = new Map([
  ["whisky:Scotch whisky", 24],
]);
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

const profileFields = ["established", "production", "style", "context"];

function validate(distilleries, profiles) {
  if (!Array.isArray(distilleries)) throw new Error("The inventory must be an array.");
  if (!profiles || Array.isArray(profiles) || typeof profiles !== "object") {
    throw new Error("The distillery profiles must be an object keyed by distillery id.");
  }

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

    const profile = profiles[distillery.id];
    if (!profile) throw new Error(`Entry ${distillery.id} needs a researched profile.`);
    for (const field of profileFields) {
      if (typeof profile[field] !== "string" || !profile[field].trim()) {
        throw new Error(`Profile ${distillery.id} is missing ${field}.`);
      }
    }
  }


  for (const [categoryId, subtypes] of requiredSubtypes) {
    for (const subtype of subtypes) {
      const count = distilleries.filter(
        (item) => item.categoryId === categoryId && item.subcategory === subtype,
      ).length;
      const requiredCount = minimumSubtypeCoverageOverrides.get(`${categoryId}:${subtype}`) ?? minimumSubtypeCoverage;
      if (count < requiredCount) {
        throw new Error(
          `${categoryNames.get(categoryId)} / ${subtype} needs at least ${requiredCount} records; found ${count}.`,
        );
      }
    }
  }

  const orphanedProfiles = Object.keys(profiles).filter((id) => !ids.has(id));
  if (orphanedProfiles.length) {
    throw new Error(`Profiles without inventory entries: ${orphanedProfiles.join(", ")}`);
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
    `**${distilleries.length} landmarks · ${categories.length} spirit families · every marker has an official source link and researched profile.**`,
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

  lines.push(
    "",
    "## Core subtype coverage",
    "",
    `Every educational subtype has at least ${minimumSubtypeCoverage} matching distillery landmarks; Scotch whisky has a dedicated minimum of 24. Additional regional styles remain in the inventory where they add useful context.`,
    "",
    "| Family | Subtype | Markers |",
    "| --- | --- | ---: |",
  );

  for (const [categoryId, categoryName] of categories) {
    for (const subtype of requiredSubtypes.get(categoryId) ?? []) {
      const count = distilleries.filter(
        (item) => item.categoryId === categoryId && item.subcategory === subtype,
      ).length;
      lines.push(`| ${categoryName} | ${subtype} | ${count} |`);
    }
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
    "- Keep a matching production, style, history and label-context profile in `data/distillery-profiles.json`.",
    "- Run `npm run data:sync` after editing and `npm run data:check` before committing.",
    "",
  );

  return lines.join("\n");
}

const distilleries = JSON.parse(await readFile(jsonUrl, "utf8"));
const profiles = JSON.parse(await readFile(profilesUrl, "utf8"));
validate(distilleries, profiles);
const markdown = render(distilleries);

if (process.argv.includes("--check")) {
  const current = await readFile(markdownUrl, "utf8").catch(() => "");
  if (current !== markdown) {
    throw new Error("DISTILLERIES.md is out of date. Run `npm run data:sync`.");
  }
  console.log(`Validated ${distilleries.length} distillery records, researched profiles and the Markdown index.`);
} else {
  await writeFile(markdownUrl, markdown);
  console.log(`Generated DISTILLERIES.md from ${distilleries.length} records.`);
}
