import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const readJson = (path) => readFile(new URL(path, root), "utf8").then(JSON.parse);

const [catalog, distilleries, profiles, originalExpansion, additionalExpansion] = await Promise.all([
  readJson("data/zh-TW-content.json"),
  readJson("data/distilleries.json"),
  readJson("data/distillery-profiles.json"),
  readJson("data/subtype-expansion.json"),
  readJson("data/additional-subtype-expansion.json"),
]);

const required = new Set();
const add = (value) => {
  if (typeof value === "string" && /[A-Za-z]/.test(value) && !/^https:\/\//.test(value)) required.add(value);
};

for (const location of distilleries) {
  ["name", "place", "country", "subcategory", "descriptor", "note", "sourceLabel"].forEach((field) => add(location[field]));
  Object.values(profiles[location.id] ?? {}).forEach(add);
}

const expansion = Object.fromEntries(
  [...new Set([...Object.keys(originalExpansion), ...Object.keys(additionalExpansion)])].map((key) => [
    key,
    [...(originalExpansion[key] ?? []), ...(additionalExpansion[key] ?? [])],
  ]),
);

for (const [key, entries] of Object.entries(expansion)) {
  const subcategory = key.split(":", 2)[1];
  const note = `A documented ${subcategory} production site that broadens the atlas beyond its original reference set.`;
  add(subcategory);
  add(note);
  for (const entry of entries) {
    const [, name, place, country, , , descriptor, tagOne, tagTwo, tagThree] = entry;
    [name, place, country, descriptor].forEach(add);
    add(`Official ${name} website`);
    add(`${name} produces ${subcategory} at or around the mapped ${place} site. The producer source below is the reference for current production and visitor information.`);
    add(`${descriptor}. Representative cues include ${tagOne}, ${tagTwo} and ${tagThree}.`);
  }
}

const missing = [...required].filter((source) => !(source in catalog));
if (missing.length) {
  throw new Error(`Traditional Chinese catalog is missing ${missing.length} location strings:\n${missing.slice(0, 20).join("\n")}`);
}

console.log(`Validated ${required.size} Traditional Chinese location and distillery strings in a ${Object.keys(catalog).length}-entry catalog.`);
