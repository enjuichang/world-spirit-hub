import type { MapRegion } from "../guideData";

type Distillery = NonNullable<MapRegion["distillery"]>;

// Representative, well-known production sites for the regional names used in
// the bottle-label atlas. Most coordinates come from the project's sourced
// distillery index; the few additions cover label regions not in that index.
const labelDistilleries: Record<string, Record<string, Distillery>> = {
  whisky: {
    Scotland: { name: "Glenfiddich Distillery", point: [-3.128, 57.454] },
    Ireland: { name: "Old Bushmills Distillery", point: [-6.518, 55.204] },
    "United States": { name: "Maker’s Mark Distillery", point: [-85.382, 37.647] },
    Tennessee: { name: "Jack Daniel Distillery", point: [-86.132, 35.284] },
    Japan: { name: "Yamazaki Distillery", point: [135.674, 34.892] },
    Taiwan: { name: "Kavalan Distillery", point: [121.69, 24.713] },
    India: { name: "Amrut Distilleries", point: [77.59, 13.02] },
  },
  brandy: {
    Cognac: { name: "Hennessy", point: [-0.328, 45.695] },
    Armagnac: { name: "Château de Laubade", point: [-0.03, 43.76] },
    Calvados: { name: "Christian Drouin", point: [0.183, 49.282] },
    Italy: { name: "Nardini Distillery", point: [11.731, 45.767] },
    "Pacific South America": { name: "Hacienda La Caravedo", point: [-75.728, -14.067] },
    "Bolivian high valleys": { name: "Casa Real Distillery", point: [-64.65, -21.58] },
    "Western Cape": { name: "KWV House of Fire", point: [18.966, -33.763] },
  },
  rum: {
    Martinique: { name: "Habitation Clément", point: [-60.9, 14.615] },
    Jamaica: { name: "Appleton Estate", point: [-77.82, 18.08] },
    Brazil: { name: "Novo Fogo Distillery", point: [-48.55, -25.52] },
    Guatemala: { name: "Ron Zacapa / ILG", point: [-90.606, 14.624] },
    Barbados: { name: "Mount Gay Distillery", point: [-59.611, 13.295] },
    Haiti: { name: "Distillerie Chelo", point: [-72.34, 19.37] },
  },
  agave: {
    "Tequila DO": { name: "Tequila Fortaleza", point: [-103.836, 20.88] },
    "Mezcal DO": { name: "Los Danzantes Distillery", point: [-96.383, 16.867] },
    Sonora: { name: "Kilinga Bacanora", point: [-108.94, 27.03] },
    "Raicilla DO": { name: "Estancia Distillery", point: [-103.99, 20.88] },
    "Sotol DO": { name: "Flor del Desierto", point: [-105.11, 29.38] },
  },
  gin: {
    Plymouth: { name: "Black Friars Distillery", point: [-4.143, 50.369] },
    Benelux: { name: "Filliers Distillery", point: [3.527, 50.984] },
  },
  vodka: {
    Poland: { name: "Żyrardów Distillery", point: [20.438, 52.048] },
    Sweden: { name: "The Absolut Company", point: [14.296, 55.928] },
    Finland: { name: "Koskenkorva Distillery", point: [22.459, 62.692] },
  },
  asian: {
    China: { name: "Kweichow Moutai", point: [106.4, 27.84] },
    Kyushu: { name: "Kirishima Shuzo", point: [131.073, 31.724] },
    Okinawa: { name: "Zuisen Distillery", point: [127.72, 26.21] },
    Korea: { name: "Andong Soju Distillery", point: [128.73, 36.56] },
    "Taiwan’s offshore islands": { name: "Kinmen Kaoliang Liquor", point: [118.32, 24.44] },
  },
  flavoured: {
    Italy: { name: "Luxardo Distillery", point: [11.731, 45.337] },
    Greece: { name: "Plomari Distillery", point: [26.36, 38.98] },
    Marseille: { name: "Maison Ferroni", point: [5.55, 43.285] },
    Scandinavia: { name: "Arcus Production Site", point: [10.88, 60.06] },
    Pontarlier: { name: "Distillerie Guy", point: [6.36, 46.9] },
  },
};

export function withLabelDistilleries(categoryId: string, regions: MapRegion[]) {
  const seen = new Set<string>();
  const categoryDistilleries = labelDistilleries[categoryId] ?? {};

  return regions.flatMap((region) => {
    if (seen.has(region.name)) return [];
    seen.add(region.name);
    return [{ ...region, distillery: region.distillery ?? categoryDistilleries[region.name] }];
  });
}
