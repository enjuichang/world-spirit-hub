"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Maximize2, Minimize2, Minus, Plus, RotateCcw } from "lucide-react";
import mapboxgl, { LngLatBounds, Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapRegion } from "../guideData";
// Mexican denomination territories generated from the official INEGI municipal frame.
import agaveBoundaryData from "./agave-boundaries.json";
// French spirit appellations derived from INAO's open geographic-area data.
import brandyBoundaryData from "./brandy-regions.json";
// Simplified Natural Earth admin-0, admin-1, and map-subunit geometry.
import boundaryData from "./region-boundaries.json";
// Higher-detail Natural Earth geometry for countries whose 1:110m shapes are
// visibly coarse at subtype-map scale. France is intentionally metropolitan.
import refinedBoundaryData from "./refined-country-boundaries.json";
// Protected Scotch areas derived from the statutory dividing line and the
// official 2007 ward boundaries named in the Scotch Whisky specification.
import scotchBoundaryData from "./scotch-regions.json";

type RegionGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;
type BoundaryProperties = { id: string };
type BoundaryFeature = GeoJSON.Feature<RegionGeometry, BoundaryProperties>;
type MinimumRegion = "caribbean";
type MapLandmark = {
  name: string;
  point: [number, number];
  kind: "city" | "distillery";
  detail?: string;
};

type PositionedLabel = {
  key: string;
  name: string;
  pointX: number;
  pointY: number;
  labelX: number;
  labelY: number;
  lineX: number;
  lineY: number;
  textAnchor: "start" | "middle" | "end";
  kind: "region" | "city" | "distillery";
  regionIndex?: number;
};

const MINIMUM_REGION_BOUNDS: Record<MinimumRegion, [[number, number], [number, number]]> = {
  caribbean: [[-92, 6], [-55, 30]],
};

const LOWER_48_BOUNDS = {
  west: -125,
  south: 24,
  east: -66,
  north: 50,
};

function boundaryFeatureForDisplay(feature: BoundaryFeature): BoundaryFeature {
  if (feature.properties.id !== "United States" || feature.geometry.type !== "MultiPolygon") return feature;

  const coordinates = feature.geometry.coordinates.filter((polygon) =>
    polygon.some((ring) => ring.some(([longitude, latitude]) =>
      longitude >= LOWER_48_BOUNDS.west
      && longitude <= LOWER_48_BOUNDS.east
      && latitude >= LOWER_48_BOUNDS.south
      && latitude <= LOWER_48_BOUNDS.north,
    )),
  );

  return {
    ...feature,
    geometry: { ...feature.geometry, coordinates },
  };
}

const boundaryFeatures = new Map(
  [
    ...(boundaryData as GeoJSON.FeatureCollection<RegionGeometry, BoundaryProperties>).features,
    ...(refinedBoundaryData as GeoJSON.FeatureCollection<RegionGeometry, BoundaryProperties>).features,
    ...(scotchBoundaryData as GeoJSON.FeatureCollection<RegionGeometry, BoundaryProperties>).features,
    ...(agaveBoundaryData as GeoJSON.FeatureCollection<RegionGeometry, BoundaryProperties>).features,
    ...(brandyBoundaryData as GeoJSON.FeatureCollection<RegionGeometry, BoundaryProperties>).features,
  ].map((feature) => {
    const displayFeature = boundaryFeatureForDisplay(feature);
    return [displayFeature.properties.id, displayFeature] as const;
  }),
);

const MAX_STATIC_ZOOM = 8;
const PRIMARY_MARKER_MIN_RADIUS_PX = 4.5;
const PRIMARY_MARKER_MAX_RADIUS_PX = 7.5;
const DISTILLERY_MARKER_RADIUS_PX = 2;
const DISTILLERY_MARKER_MAX_RADIUS_PX = 5;
const REGION_COLORS = ["#9b7845", "#d9a85b", "#766548", "#c38c55", "#edc57f", "#a88652"];

const FOCUS_LANDMARKS: Record<string, MapLandmark[]> = {
  "Cognac AOC": [
    { name: "Cognac", point: [-0.3286, 45.6958], kind: "city" },
    { name: "Bordeaux", point: [-0.5792, 44.8378], kind: "city" },
    { name: "Paris", point: [2.3522, 48.8566], kind: "city" },
    { name: "Marseille", point: [5.3698, 43.2965], kind: "city" },
    { name: "Hennessy", point: [-0.3266, 45.6963], kind: "distillery", detail: "Cognac house" },
  ],
  "Armagnac AOC": [
    { name: "Bordeaux", point: [-0.5792, 44.8378], kind: "city" },
    { name: "Toulouse", point: [1.4442, 43.6047], kind: "city" },
    { name: "Paris", point: [2.3522, 48.8566], kind: "city" },
    { name: "Château de Laubade", point: [-0.03, 43.76], kind: "distillery", detail: "Armagnac house" },
  ],
  "Calvados AOC": [
    { name: "Caen", point: [-0.3707, 49.1829], kind: "city" },
    { name: "Rouen", point: [1.0993, 49.4432], kind: "city" },
    { name: "Paris", point: [2.3522, 48.8566], kind: "city" },
    { name: "Christian Drouin", point: [0.183, 49.282], kind: "distillery", detail: "Calvados producer" },
  ],
};

type StaticView = { zoom: number; centerX: number; centerY: number };
const DEFAULT_STATIC_VIEW: StaticView = { zoom: 1, centerX: 0.5, centerY: 0.5 };

const boundaryGroups: Record<string, string[]> = {
  Armagnac: ["Armagnac AOC"],
  "Authorized Mexican states": ["Mezcal DO"],
  Benelux: ["Netherlands", "Belgium", "Luxembourg"],
  Calvados: ["Calvados AOC"],
  Cognac: ["Cognac AOC"],
  "Jalisco + authorized areas": ["Tequila DO"],
  "Jalisco & Nayarit": ["Raicilla DO"],
  Korea: ["South Korea"],
  "Netherlands & Belgium": ["Netherlands", "Belgium"],
  "Northern Mexico": ["Sotol DO"],
  "Pacific South America": ["Peru", "Chile"],
  "Peru & Chile": ["Peru", "Chile"],
  Sonora: ["Bacanora DO"],
};

const countryFocusGroups: Record<string, string[]> = {
  Armagnac: ["Armagnac AOC"],
  "Bolivian high valleys": ["Bolivia"],
  "Central Europe": ["Germany", "Austria", "Switzerland"],
  Calvados: ["Calvados AOC"],
  Cognac: ["Cognac AOC"],
  Jerez: ["Spain"],
  Normandy: ["Calvados AOC"],
  "Pacific South America": ["Peru", "Chile"],
  "Peru & Chile": ["Peru", "Chile"],
  Tennessee: ["United States"],
  "Western Cape": ["South Africa"],
};

const focusContextGroups: Record<string, string[]> = {
  "Armagnac AOC": ["France"],
  "Bacanora DO": ["Mexico"],
  "Calvados AOC": ["France"],
  "Cognac AOC": ["France"],
  "Mezcal DO": ["Mexico"],
  "Raicilla DO": ["Mexico"],
  "Sotol DO": ["Mexico"],
  "Tequila DO": ["Mexico"],
};

const commonRegionGroups: Record<string, string[]> = {
  "Tequila DO": ["Tequila Highlands", "Tequila Valley"],
};

function project([longitude, latitude]: [number, number]) {
  return {
    x: ((longitude + 180) / 360) * 100,
    y: ((90 - latitude) / 180) * 100,
  };
}

function boundariesForRegion(region: MapRegion): BoundaryFeature[] {
  const ids = boundaryGroups[region.name] ?? [region.name];
  return ids.flatMap((id) => {
    const feature = boundaryFeatures.get(id);
    return feature ? [feature] : [];
  });
}

function ringContainsPoint(point: [number, number], ring: number[][]) {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index++) {
    const [x, y] = ring[index];
    const [previousX, previousY] = ring[previous];
    const intersects = ((y > point[1]) !== (previousY > point[1]))
      && point[0] < ((previousX - x) * (point[1] - y)) / (previousY - y) + x;
    if (intersects) inside = !inside;
  }
  return inside;
}

function polygonContainsPoint(point: [number, number], polygon: number[][][]) {
  return ringContainsPoint(point, polygon[0])
    && !polygon.slice(1).some((hole) => ringContainsPoint(point, hole));
}

function featureContainsPoint(feature: BoundaryFeature, point: [number, number]) {
  const polygons = feature.geometry.type === "Polygon"
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;
  return polygons.some((polygon) => polygonContainsPoint(point, polygon));
}

function containingBoundaryId(point: [number, number]) {
  return [...boundaryFeatures.values()].find((feature) => featureContainsPoint(feature, point))?.properties.id;
}

function focusIdsForRegions(regions: MapRegion[], requested?: string[]) {
  const ids = requested ?? regions.flatMap((region) => {
    const explicit = countryFocusGroups[region.name] ?? boundaryGroups[region.name];
    if (explicit) return explicit;
    if (boundaryFeatures.has(region.name)) return [region.name];
    const containingId = containingBoundaryId(region.point);
    return containingId ? [containingId] : [];
  });
  return [...new Set(ids)].filter((id) => boundaryFeatures.has(id));
}

function isDenominationTerritory(id: string) {
  return id.endsWith(" DO") || id.endsWith(" AOC");
}

function featuresForIds(ids: string[]) {
  return ids.flatMap((id) => {
    const feature = boundaryFeatures.get(id);
    return feature ? [feature] : [];
  });
}

function contextIdsForFocus(ids: string[]) {
  return [...new Set(ids.flatMap((id) => focusContextGroups[id] ?? []))];
}

function commonIdsForFocus(ids: string[]) {
  return [...new Set(ids.flatMap((id) => commonRegionGroups[id] ?? []))];
}

function outlineCollection(regions: MapRegion[]): GeoJSON.FeatureCollection<RegionGeometry> {
  return {
    type: "FeatureCollection",
    features: regions.flatMap((region, index) =>
      boundariesForRegion(region).map((feature) => ({
        ...feature,
        properties: {
          index: index + 1,
          name: region.name,
          protected: region.kind === "protected" ? 1 : 0,
        },
      })),
    ),
  };
}

function pointCollection(
  regions: MapRegion[],
  onlyWithoutBoundary = false,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: regions.flatMap((region, index) =>
      onlyWithoutBoundary && boundariesForRegion(region).length > 0
        ? []
        : [
            {
              type: "Feature" as const,
              geometry: { type: "Point" as const, coordinates: region.point },
              properties: {
                index: index + 1,
                name: region.name,
                protected: region.kind === "protected" ? 1 : 0,
              },
            },
          ],
    ),
  };
}

function landmarksForMap(regions: MapRegion[], focusIds: string[]) {
  const landmarks: MapLandmark[] = [
    ...focusIds.flatMap((id) => FOCUS_LANDMARKS[id] ?? []),
    ...regions.flatMap((region) => region.distillery ? [{
      name: region.distillery.name,
      point: region.distillery.point,
      kind: "distillery" as const,
      detail: region.name,
    }] : []),
  ];
  const seen = new Set<string>();
  return landmarks.filter((landmark) => {
    const key = `${landmark.kind}:${landmark.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function landmarkCollection(landmarks: MapLandmark[], kind: MapLandmark["kind"]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: landmarks.filter((landmark) => landmark.kind === kind).map((landmark) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: landmark.point },
      properties: { name: landmark.name, detail: landmark.detail ?? "" },
    })),
  };
}

type LabelRect = { x: number; y: number; width: number; height: number };

function overlapArea(first: LabelRect, second: LabelRect) {
  return Math.max(0, Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x))
    * Math.max(0, Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y));
}

function positionMapLabels(
  regions: MapRegion[],
  landmarks: MapLandmark[],
  viewBox: { x: number; y: number; width: number; height: number },
  fontSize: number,
  markerRadius: number,
) {
  const candidates = [
    ...regions.map((region, index) => ({
      key: `region-${index}`,
      name: `${index + 1}. ${region.name}`,
      point: region.point,
      kind: "region" as const,
      regionIndex: index,
      priority: 0,
      size: fontSize,
    })),
    ...landmarks.map((landmark, index) => ({
      key: `landmark-${landmark.kind}-${index}`,
      name: landmark.name,
      point: landmark.point,
      kind: landmark.kind,
      regionIndex: undefined,
      priority: landmark.kind === "city" ? 1 : 2,
      size: fontSize * 0.82,
    })),
  ].sort((first, second) => first.priority - second.priority);

  const occupied: LabelRect[] = candidates.map((candidate) => {
    const point = project(candidate.point);
    const x = point.x * 3.6;
    const y = point.y * 1.8;
    return { x: x - markerRadius * 1.25, y: y - markerRadius * 1.25, width: markerRadius * 2.5, height: markerRadius * 2.5 };
  });
  const padding = fontSize * 0.4;
  const result: PositionedLabel[] = [];

  candidates.forEach((candidate) => {
    const projected = project(candidate.point);
    const pointX = projected.x * 3.6;
    const pointY = projected.y * 1.8;
    const height = candidate.size * 1.35;
    const width = Math.max(candidate.name.length * candidate.size * 0.57, candidate.size * 2.5);
    const gap = markerRadius * (candidate.kind === "region" ? 2.1 : 1.65) + padding;
    const rowOffsets = [0, -1, 1, -2, 2, -3, 3, -4, 4];
    const placements = rowOffsets.flatMap((row) => {
      const y = pointY + row * height * 1.05;
      return [
        { rect: { x: pointX + gap, y: y - height / 2, width, height }, labelX: pointX + gap + padding, labelY: y, lineX: pointX + gap, lineY: y, textAnchor: "start" as const },
        { rect: { x: pointX - gap - width, y: y - height / 2, width, height }, labelX: pointX - gap - padding, labelY: y, lineX: pointX - gap, lineY: y, textAnchor: "end" as const },
      ];
    });
    placements.push(
      { rect: { x: pointX - width / 2, y: pointY - gap - height, width, height }, labelX: pointX, labelY: pointY - gap - height / 2, lineX: pointX, lineY: pointY - gap, textAnchor: "middle" },
      { rect: { x: pointX - width / 2, y: pointY + gap, width, height }, labelX: pointX, labelY: pointY + gap + height / 2, lineX: pointX, lineY: pointY + gap, textAnchor: "middle" },
    );

    const scored = placements.map((placement, index) => {
      const outside = Math.max(0, viewBox.x + padding - placement.rect.x)
        + Math.max(0, placement.rect.x + placement.rect.width - (viewBox.x + viewBox.width - padding))
        + Math.max(0, viewBox.y + padding - placement.rect.y)
        + Math.max(0, placement.rect.y + placement.rect.height - (viewBox.y + viewBox.height - padding));
      const collision = occupied.reduce((total, rect) => total + overlapArea(placement.rect, rect), 0);
      return { ...placement, score: outside * width * 20 + collision * 120 + index };
    }).sort((first, second) => first.score - second.score);
    const chosen = scored[0];
    occupied.push(chosen.rect);
    result.push({
      key: candidate.key,
      name: candidate.name,
      pointX,
      pointY,
      labelX: chosen.labelX,
      labelY: chosen.labelY,
      lineX: chosen.lineX,
      lineY: chosen.lineY,
      textAnchor: chosen.textAnchor,
      kind: candidate.kind,
      regionIndex: candidate.regionIndex,
    });
  });
  return result;
}

function extendGeometryBounds(bounds: LngLatBounds, geometry: RegionGeometry) {
  const coordinates = geometry.type === "Polygon"
    ? geometry.coordinates.flat(1)
    : geometry.coordinates.flat(2);
  coordinates.forEach((coordinate) => bounds.extend(coordinate as [number, number]));
}

function geometryPath(geometry: RegionGeometry) {
  const polygons = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons
    .flatMap((polygon) =>
      polygon.map((ring) =>
        ring
          .map(([longitude, latitude], index) => {
            const { x, y } = project([longitude, latitude]);
            return `${index === 0 ? "M" : "L"}${x * 3.6} ${y * 1.8}`;
          })
          .join(" ") + " Z",
      ),
    )
    .join(" ");
}

function geometryCoordinates(geometry: RegionGeometry): [number, number][] {
  return (geometry.type === "Polygon" ? geometry.coordinates.flat(1) : geometry.coordinates.flat(2)) as [number, number][];
}

function focusedViewBox(features: BoundaryFeature[]) {
  if (!features.length) return { x: 0, y: 0, width: 360, height: 180 };
  const points = features.flatMap((feature) => geometryCoordinates(feature.geometry).map(project));
  const minX = Math.min(...points.map((point) => point.x * 3.6));
  const maxX = Math.max(...points.map((point) => point.x * 3.6));
  const minY = Math.min(...points.map((point) => point.y * 1.8));
  const maxY = Math.max(...points.map((point) => point.y * 1.8));
  const width = Math.max(maxX - minX, 2);
  const height = Math.max(maxY - minY, 2);
  const paddingX = Math.max(width * 0.16, 0.75);
  const paddingY = Math.max(height * 0.16, 0.75);
  return { x: minX - paddingX, y: minY - paddingY, width: width + paddingX * 2, height: height + paddingY * 2 };
}

function boundsViewBox([[west, south], [east, north]]: [[number, number], [number, number]]) {
  const topLeft = project([west, north]);
  const bottomRight = project([east, south]);
  return {
    x: topLeft.x * 3.6,
    y: topLeft.y * 1.8,
    width: (bottomRight.x - topLeft.x) * 3.6,
    height: (bottomRight.y - topLeft.y) * 1.8,
  };
}

function unionViewBoxes(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  const x = Math.min(first.x, second.x);
  const y = Math.min(first.y, second.y);
  return {
    x,
    y,
    width: Math.max(first.x + first.width, second.x + second.width) - x,
    height: Math.max(first.y + first.height, second.y + second.height) - y,
  };
}

function pointIsWithinBounds([longitude, latitude]: [number, number], [[west, south], [east, north]]: [[number, number], [number, number]]) {
  return longitude >= west && longitude <= east && latitude >= south && latitude <= north;
}

function zoomedViewBox(
  base: { x: number; y: number; width: number; height: number },
  view: StaticView,
) {
  const width = base.width / view.zoom;
  const height = base.height / view.zoom;
  return {
    x: base.x + base.width * view.centerX - width / 2,
    y: base.y + base.height * view.centerY - height / 2,
    width,
    height,
  };
}

function clampView(view: StaticView): StaticView {
  const zoom = Math.min(MAX_STATIC_ZOOM, Math.max(1, view.zoom));
  const half = 0.5 / zoom;
  return {
    zoom,
    centerX: Math.min(1 - half, Math.max(half, view.centerX)),
    centerY: Math.min(1 - half, Math.max(half, view.centerY)),
  };
}

function pointFocusedViewBox(regions: MapRegion[]) {
  const points = regions.flatMap((region) => [region.point, ...(region.distillery ? [region.distillery.point] : [])]).map(project);
  const xs = points.map((point) => point.x * 3.6);
  const ys = points.map((point) => point.y * 1.8);
  const centerX = (Math.min(...xs) + Math.max(...xs)) / 2;
  const centerY = (Math.min(...ys) + Math.max(...ys)) / 2;
  let width = Math.max((Math.max(...xs) - Math.min(...xs)) * 1.45, 34);
  let height = Math.max((Math.max(...ys) - Math.min(...ys)) * 1.45, 16);
  const targetRatio = 2.15;
  if (width / height < targetRatio) width = height * targetRatio;
  else height = width / targetRatio;
  width = Math.min(width, 360);
  height = Math.min(height, 180);
  const x = Math.max(0, Math.min(centerX - width / 2, 360 - width));
  const y = Math.max(0, Math.min(centerY - height / 2, 180 - height));
  return { x, y, width, height };
}

export function RegionMap({
  regions,
  label,
  compact = false,
  focus,
  immersive = false,
  minimumRegion,
}: {
  regions: MapRegion[];
  label: string;
  compact?: boolean;
  focus?: string[];
  immersive?: boolean;
  minimumRegion?: MinimumRegion;
}) {
  const figureRef = useRef<HTMLElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const staticDragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  const [staticViews, setStaticViews] = useState<Record<string, StaticView>>({});
  const [mapViewport, setMapViewport] = useState({ width: 720, height: 350 });
  const focusIds = useMemo(
    () => compact || focus !== undefined ? focusIdsForRegions(regions, focus) : [],
    [compact, focus, regions],
  );
  const focusFeatures = useMemo(() => featuresForIds(focusIds), [focusIds]);
  const contextIds = useMemo(() => contextIdsForFocus(focusIds), [focusIds]);
  const contextFeatures = useMemo(() => featuresForIds(contextIds), [contextIds]);
  const commonIds = useMemo(() => commonIdsForFocus(focusIds), [focusIds]);
  const commonFeatures = useMemo(() => featuresForIds(commonIds), [commonIds]);
  const commonLabel = commonIds.map((id) => id.replace(/^Tequila /, "")).join(" + ");
  const compactContextLabel = contextIds.length ? `${contextIds.join(" + ")} · ` : "";
  const contextLabel = contextIds.length ? `${contextIds.join(" + ")} context · ` : "";
  const hasDenominationFocus = focusIds.some(isDenominationTerritory);
  const hasIncompleteFocus = focus !== undefined && focusIds.length < focus.length;
  const fittedViewBox = contextFeatures.length
    ? focusedViewBox(contextFeatures)
    : focusFeatures.length && !hasIncompleteFocus
      ? focusedViewBox(focusFeatures)
    : compact || focus !== undefined
      ? pointFocusedViewBox(regions)
      : focusedViewBox([]);
  const minimumBounds = minimumRegion ? MINIMUM_REGION_BOUNDS[minimumRegion] : undefined;
  const minimumViewBox = minimumBounds ? boundsViewBox(minimumBounds) : undefined;
  const shouldApplyMinimumRegion = !!minimumBounds
    && !!minimumViewBox
    && regions.some((region) => pointIsWithinBounds(region.point, minimumBounds))
    && (fittedViewBox.width < minimumViewBox.width || fittedViewBox.height < minimumViewBox.height);
  const baseViewBox = shouldApplyMinimumRegion && minimumViewBox
    ? unionViewBoxes(fittedViewBox, minimumViewBox)
    : fittedViewBox;
  const baseViewKey = `${baseViewBox.x}:${baseViewBox.y}:${baseViewBox.width}:${baseViewBox.height}`;
  const staticView = staticViews[baseViewKey] ?? DEFAULT_STATIC_VIEW;
  const viewBox = zoomedViewBox(baseViewBox, staticView);
  const focusLabel = focus?.length ? focus : focusIds;
  const mapUnitsPerPixel = Math.max(
    viewBox.width / Math.max(mapViewport.width, 1),
    viewBox.height / Math.max(mapViewport.height, 1),
  );
  // ResizeObserver can briefly report a zero-sized box while a subtype panel
  // is switching. Cap every SVG size against the visible geographic extent so
  // a transient measurement can never turn a marker into a map-sized shape.
  const mapExtent = Math.min(viewBox.width, viewBox.height);
  const zoomProgress = Math.log(staticView.zoom) / Math.log(MAX_STATIC_ZOOM);
  const primaryMarkerRadiusPx = PRIMARY_MARKER_MIN_RADIUS_PX
    + (PRIMARY_MARKER_MAX_RADIUS_PX - PRIMARY_MARKER_MIN_RADIUS_PX) * zoomProgress;
  const markerRadius = Math.min(mapUnitsPerPixel * primaryMarkerRadiusPx, mapExtent / 52);
  const markerFontSizePx = (compact ? 8.5 : 9.5) + zoomProgress * 1.5;
  const markerFontSize = Math.min(mapUnitsPerPixel * markerFontSizePx, mapExtent / 32);
  const distilleryMarkerRadiusPx = DISTILLERY_MARKER_RADIUS_PX
    + (DISTILLERY_MARKER_MAX_RADIUS_PX - DISTILLERY_MARKER_RADIUS_PX)
      * zoomProgress;
  const distilleryMarkerRadius = Math.min(mapUnitsPerPixel * distilleryMarkerRadiusPx, mapExtent / 100);
  const landmarks = useMemo(() => landmarksForMap(regions, focusIds), [focusIds, regions]);
  const positionedLabels = positionMapLabels(regions, landmarks, viewBox, markerFontSize, markerRadius);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width >= 120 && height >= 120) setMapViewport({ width, height });
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleFullscreenChange() {
      const fullscreen = document.fullscreenElement === figureRef.current;
      setIsFullscreen(fullscreen);
      window.setTimeout(() => mapRef.current?.resize(), 0);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  async function toggleFullscreen() {
    if (!figureRef.current) return;
    if (document.fullscreenElement === figureRef.current) await document.exitFullscreen();
    else await figureRef.current.requestFullscreen();
  }

  function changeStaticZoom(multiplier: number) {
    setStaticViews((views) => {
      const current = views[baseViewKey] ?? DEFAULT_STATIC_VIEW;
      return { ...views, [baseViewKey]: clampView({ ...current, zoom: current.zoom * multiplier }) };
    });
  }

  function resetStaticView() {
    setStaticViews((views) => ({ ...views, [baseViewKey]: DEFAULT_STATIC_VIEW }));
  }

  function beginStaticPan(event: React.PointerEvent<HTMLDivElement>) {
    if (mapReady || event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    staticDragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function moveStaticPan(event: React.PointerEvent<HTMLDivElement>) {
    const drag = staticDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || staticView.zoom <= 1) return;
    const width = Math.max(event.currentTarget.getBoundingClientRect().width, 1);
    const height = Math.max(event.currentTarget.getBoundingClientRect().height, 1);
    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    staticDragRef.current = { ...drag, x: event.clientX, y: event.clientY };
    setStaticViews((views) => {
      const current = views[baseViewKey] ?? DEFAULT_STATIC_VIEW;
      return { ...views, [baseViewKey]: clampView({
        ...current,
        centerX: current.centerX - deltaX / (width * current.zoom),
        centerY: current.centerY - deltaY / (height * current.zoom),
      }) };
    });
  }

  function endStaticPan(event: React.PointerEvent<HTMLDivElement>) {
    if (staticDragRef.current?.pointerId !== event.pointerId) return;
    staticDragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  useEffect(() => {
    if (compact || !wrapperRef.current || mapRef.current) return;
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken) return;

    const wrapper = wrapperRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || !mapContainerRef.current || mapRef.current) return;
        observer.disconnect();

        mapboxgl.accessToken = mapboxToken;
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/dark-v11",
          center: [0, 24],
          zoom: -0.25,
          minZoom: -1,
          maxZoom: 8,
          attributionControl: false,
          cooperativeGestures: true,
          renderWorldCopies: false,
        });
        mapRef.current = map;
        map.setProjection({ name: "mercator" });
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

        map.on("load", () => {
          if (contextFeatures.length) {
            map.addSource("geographic-context", {
              type: "geojson",
              data: { type: "FeatureCollection", features: contextFeatures },
            });
            map.addLayer({
              id: "geographic-context-fill",
              type: "fill",
              source: "geographic-context",
              paint: { "fill-color": "#5f523f", "fill-opacity": 0.24 },
            });
            map.addLayer({
              id: "geographic-context-outline",
              type: "line",
              source: "geographic-context",
              paint: { "line-color": "#c6a56e", "line-width": 1.5, "line-opacity": 0.88 },
            });
          }
          if (commonFeatures.length) {
            map.addSource("common-production-regions", {
              type: "geojson",
              data: { type: "FeatureCollection", features: commonFeatures },
            });
            map.addLayer({
              id: "common-production-regions-fill",
              type: "fill",
              source: "common-production-regions",
              paint: {
                "fill-color": [
                  "match", ["get", "id"],
                  "Tequila Highlands", "#d9a85b",
                  "Tequila Valley", "#76a878",
                  "#9b7845",
                ],
                "fill-opacity": 0.3,
              },
            });
          }
          if (focusFeatures.length) {
            map.addSource("country-focus", {
              type: "geojson",
              data: { type: "FeatureCollection", features: focusFeatures },
            });
            map.addLayer({
              id: "country-focus-fill",
              type: "fill",
              source: "country-focus",
              paint: { "fill-color": "#7c6441", "fill-opacity": 0.18 },
            });
            map.addLayer({
              id: "country-focus-outline",
              type: "line",
              source: "country-focus",
              paint: { "line-color": "#ae8c59", "line-width": 1.4, "line-opacity": 0.9 },
            });
          }
          map.addSource("production-outlines", {
            type: "geojson",
            data: outlineCollection(regions),
          });
          map.addLayer({
            id: "production-area-fill",
            type: "fill",
            source: "production-outlines",
            paint: {
              "fill-color": [
                "match", ["get", "index"],
                1, REGION_COLORS[0],
                2, REGION_COLORS[1],
                3, REGION_COLORS[2],
                4, REGION_COLORS[3],
                5, REGION_COLORS[4],
                6, REGION_COLORS[5],
                "#d9a85b",
              ],
              "fill-opacity": 0.28,
            },
          });
          map.addLayer({
            id: "production-area-glow",
            type: "line",
            source: "production-outlines",
            paint: {
              "line-color": "#e2bc78",
              "line-width": ["interpolate", ["linear"], ["zoom"], 0, 3, 5, 6],
              "line-blur": 3,
              "line-opacity": 0.32,
            },
          });
          map.addLayer({
            id: "production-area-outline",
            type: "line",
            source: "production-outlines",
            paint: {
              "line-color": ["case", ["==", ["get", "protected"], 1], "#ffe1a3", "#e2bc78"],
              "line-width": ["interpolate", ["linear"], ["zoom"], 0, 1.25, 5, 2.5],
              "line-opacity": 0.96,
            },
          });

          map.addSource("production-fallback-points", {
            type: "geojson",
            data: pointCollection(regions, true),
          });
          map.addLayer({
            id: "production-fallback-halo",
            type: "circle",
            source: "production-fallback-points",
          paint: {
              "circle-color": "#e2bc78",
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 7, 4, 10, 8, 14],
              "circle-blur": 0.75,
              "circle-opacity": 0.65,
            },
          });
          map.addLayer({
            id: "production-fallback-points",
            type: "circle",
            source: "production-fallback-points",
            paint: {
              "circle-color": ["case", ["==", ["get", "protected"], 1], "#f4c978", "#d9a85b"],
              "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, PRIMARY_MARKER_MIN_RADIUS_PX, 4, 6, 8, PRIMARY_MARKER_MAX_RADIUS_PX],
              "circle-stroke-color": "#fff4df",
              "circle-stroke-width": 2,
            },
          });

          map.addSource("production-labels", {
            type: "geojson",
            data: pointCollection(regions),
          });
          map.addLayer({
            id: "production-region-names",
            type: "symbol",
            source: "production-labels",
            layout: {
              "text-field": ["get", "name"],
              "text-size": ["interpolate", ["linear"], ["zoom"], 0, 10, 4, 13],
              "text-font": ["Open Sans Bold"],
              "text-allow-overlap": false,
              "text-optional": true,
              "text-variable-anchor": ["center", "top", "bottom", "left", "right"],
              "text-radial-offset": 0.5,
              "text-letter-spacing": 0.04,
            },
            paint: {
              "text-color": "#fff4df",
              "text-halo-color": "#17120d",
              "text-halo-width": 1.5,
              "text-halo-blur": 0.5,
            },
          });

          const resetRegionFocus = () => {
            setHoveredRegion(null);
            map.getCanvas().style.cursor = "";
            map.setPaintProperty("production-area-fill", "fill-color", [
              "match", ["get", "index"],
              1, REGION_COLORS[0], 2, REGION_COLORS[1], 3, REGION_COLORS[2],
              4, REGION_COLORS[3], 5, REGION_COLORS[4], 6, REGION_COLORS[5], "#d9a85b",
            ]);
            map.setPaintProperty("production-area-fill", "fill-opacity", 0.28);
            map.setPaintProperty("production-area-outline", "line-opacity", 0.96);
            map.setPaintProperty("production-region-names", "text-opacity", 1);
            map.setPaintProperty("production-fallback-points", "circle-opacity", 1);
            map.setPaintProperty("production-fallback-halo", "circle-opacity", 0.65);
          };
          const focusRegion = (name: string) => {
            setHoveredRegion(name);
            map.getCanvas().style.cursor = "pointer";
            const selected = ["==", ["get", "name"], name];
            map.setPaintProperty("production-area-fill", "fill-color", ["case", selected, "#edc57f", "#070706"]);
            map.setPaintProperty("production-area-fill", "fill-opacity", ["case", selected, 0.58, 0.78]);
            map.setPaintProperty("production-area-outline", "line-opacity", ["case", selected, 1, 0.16]);
            map.setPaintProperty("production-region-names", "text-opacity", ["case", selected, 1, 0.16]);
            map.setPaintProperty("production-fallback-points", "circle-opacity", ["case", selected, 1, 0.14]);
            map.setPaintProperty("production-fallback-halo", "circle-opacity", ["case", selected, 0.75, 0.05]);
          };
          const handleRegionHover = (event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
            const name = event.features?.[0]?.properties?.name;
            if (typeof name === "string") focusRegion(name);
          };
          map.on("mousemove", "production-area-fill", handleRegionHover);
          map.on("mouseleave", "production-area-fill", resetRegionFocus);
          map.on("mousemove", "production-fallback-points", handleRegionHover);
          map.on("mouseleave", "production-fallback-points", resetRegionFocus);

          const cities = landmarkCollection(landmarks, "city");
          if (cities.features.length) {
            map.addSource("context-cities", { type: "geojson", data: cities });
            map.addLayer({
              id: "context-city-points",
              type: "circle",
              source: "context-cities",
              paint: {
                "circle-color": "#d9cbb6",
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 6, 3.5],
                "circle-stroke-color": "#17120d",
                "circle-stroke-width": 1,
              },
            });
            map.addLayer({
              id: "context-city-names",
              type: "symbol",
              source: "context-cities",
              layout: {
                "text-field": ["get", "name"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 0, 9, 6, 11],
                "text-font": ["Open Sans Semibold"],
                "text-variable-anchor": ["top", "bottom", "left", "right"],
                "text-radial-offset": 0.65,
                "text-allow-overlap": false,
                "text-optional": false,
              },
              paint: {
                "text-color": "#d9cbb6",
                "text-halo-color": "#17120d",
                "text-halo-width": 1.5,
              },
            });
          }

          const distilleries = landmarkCollection(landmarks, "distillery");
          if (distilleries.features.length) {
            map.addSource("representative-distilleries", { type: "geojson", data: distilleries });
            map.addLayer({
              id: "distillery-points",
              type: "circle",
              source: "representative-distilleries",
              paint: {
                "circle-color": "#17120d",
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 1.75, 4, 2.5, 8, 5],
                "circle-stroke-color": "#ffd992",
                "circle-stroke-width": ["interpolate", ["linear"], ["zoom"], 0, 1, 8, 1.75],
              },
            });
            map.addLayer({
              id: "distillery-names",
              type: "symbol",
              source: "representative-distilleries",
              layout: {
                "text-field": ["get", "name"],
                "text-size": 9.5,
                "text-font": ["Open Sans Semibold"],
                "text-offset": [0, 1.25],
                "text-anchor": "top",
                "text-allow-overlap": false,
                "text-optional": true,
                "text-variable-anchor": ["top", "bottom", "left", "right"],
                "text-radial-offset": 0.75,
              },
              paint: {
                "text-color": "#f4c978",
                "text-halo-color": "#17120d",
                "text-halo-width": 1.5,
                "text-halo-blur": 0.5,
              },
            });

            const showDistilleryPopup = (event: mapboxgl.MapMouseEvent & { features?: mapboxgl.MapboxGeoJSONFeature[] }) => {
              const feature = event.features?.[0];
              if (!feature || feature.geometry.type !== "Point") return;
              const coordinates = feature.geometry.coordinates as [number, number];
              new mapboxgl.Popup({ closeButton: false, offset: 10, className: "distillery-popup" })
                .setLngLat(coordinates)
                .setHTML(`<strong>${feature.properties?.name ?? "Distillery"}</strong><span>${feature.properties?.detail ?? ""}</span>`)
                .addTo(map);
            };
            map.on("click", "distillery-points", showDistilleryPopup);
            map.on("mouseenter", "distillery-points", () => { map.getCanvas().style.cursor = "pointer"; });
            map.on("mouseleave", "distillery-points", () => { map.getCanvas().style.cursor = ""; });
          }

          if (focusFeatures.length) {
            const bounds = new LngLatBounds();
            if (shouldApplyMinimumRegion && minimumBounds) minimumBounds.forEach((point) => bounds.extend(point));
            (contextFeatures.length ? contextFeatures : focusFeatures).forEach((feature) => extendGeometryBounds(bounds, feature.geometry));
            regions.forEach((region) => {
              bounds.extend(region.point);
              if (region.distillery) bounds.extend(region.distillery.point);
            });
            map.fitBounds(bounds, { padding: 28, maxZoom: 5.5, duration: 0 });
          } else if (regions.length > 1) {
            const bounds = new LngLatBounds();
            if (shouldApplyMinimumRegion && minimumBounds) minimumBounds.forEach((point) => bounds.extend(point));
            regions.forEach((region) => {
              const boundaries = boundariesForRegion(region);
              if (boundaries.length) boundaries.forEach((feature) => extendGeometryBounds(bounds, feature.geometry));
              else bounds.extend(region.point);
            });
            map.fitBounds(bounds, { padding: 42, maxZoom: 5.2, duration: 0 });
          } else if (shouldApplyMinimumRegion && minimumBounds) {
            map.fitBounds(minimumBounds, { padding: 28, maxZoom: 5.2, duration: 0 });
          } else {
            map.jumpTo({ center: regions[0].point, zoom: 3.2 });
          }
          setMapReady(true);
        });
      },
      { rootMargin: "240px 0px" },
    );
    observer.observe(wrapper);

    return () => {
      observer.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [commonFeatures, compact, contextFeatures, focusFeatures, landmarks, minimumBounds, regions, shouldApplyMinimumRegion]);

  return (
    <figure className={`region-map${compact ? " compact" : ""}${focusFeatures.length ? " focused" : ""}${immersive ? " immersive" : ""}${hoveredRegion ? " has-region-hover" : ""}`} ref={figureRef}>
      <div
        className={`map-canvas${mapReady ? " mapbox-ready" : ""}${staticView.zoom > 1 ? " is-zoomed" : ""}`}
        ref={wrapperRef}
        role="group"
        aria-label={`${label}: ${regions.map((region) => region.name).join(", ")}`}
        onPointerDown={beginStaticPan}
        onPointerMove={moveStaticPan}
        onPointerUp={endStaticPan}
        onPointerCancel={endStaticPan}
        onWheel={(event) => {
          if (mapReady) return;
          event.preventDefault();
          changeStaticZoom(event.deltaY < 0 ? 1.25 : 0.8);
        }}
      >
        <div className="map-graticule" aria-hidden="true" />
        {!compact && !focusFeatures.length && <div className="map-land" aria-hidden="true" />}
        <svg
          className="map-region-outlines"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {!focusFeatures.length && (
            <image className="map-land-vector" href="/world-equirectangular.svg" x="0" y="0" width="360" height="180" />
          )}
          {contextFeatures.map((feature) => (
            <path className="map-country-context" d={geometryPath(feature.geometry)} fillRule="evenodd" key={`${feature.properties.id}-context`} />
          ))}
          {commonFeatures.map((feature, index) => (
            <path className={`map-common-region common-${index}`} d={geometryPath(feature.geometry)} fillRule="evenodd" key={`${feature.properties.id}-common`} />
          ))}
          {focusFeatures.map((feature) => (
            <path className="map-focus-outline" d={geometryPath(feature.geometry)} fillRule="evenodd" key={`${feature.properties.id}-focus`} />
          ))}
          {regions.flatMap((region, index) =>
            boundariesForRegion(region).map((feature, featureIndex) => (
              <path
                className={`map-region-outline ${region.kind ?? "traditional"}${hoveredRegion === region.name ? " is-hovered" : hoveredRegion ? " is-dimmed" : ""}`}
                d={geometryPath(feature.geometry)}
                fillRule="evenodd"
                key={`${region.name}-outline-${index}-${featureIndex}`}
                style={{ fill: `color-mix(in srgb, ${REGION_COLORS[index % REGION_COLORS.length]} 28%, transparent)`, stroke: REGION_COLORS[index % REGION_COLORS.length] }}
                onPointerEnter={() => setHoveredRegion(region.name)}
                onPointerLeave={() => setHoveredRegion(null)}
              />
            )),
          )}
          {positionedLabels.map((positioned) => {
            if (positioned.kind === "region" && positioned.regionIndex !== undefined) {
              const region = regions[positioned.regionIndex];
              return (
                <g
                  className={`map-focused-marker ${region.kind ?? "traditional"}${hoveredRegion === region.name ? " is-hovered" : hoveredRegion ? " is-dimmed" : ""}`}
                  key={positioned.key}
                  onPointerEnter={() => setHoveredRegion(region.name)}
                  onPointerLeave={() => setHoveredRegion(null)}
                >
                  <circle cx={positioned.pointX} cy={positioned.pointY} r={markerRadius} />
                  <line x1={positioned.pointX} y1={positioned.pointY} x2={positioned.lineX} y2={positioned.lineY} />
                  <text
                    x={positioned.labelX}
                    y={positioned.labelY}
                    dominantBaseline="middle"
                    fontSize={markerFontSize}
                    textAnchor={positioned.textAnchor}
                  >{compact ? region.name : positioned.name}</text>
                </g>
              );
            }
            const landmark = landmarks.find((item) => item.name === positioned.name && item.kind === positioned.kind);
            const radius = positioned.kind === "distillery" ? distilleryMarkerRadius * 1.4 : distilleryMarkerRadius;
            return (
              <g className={`map-place-marker ${positioned.kind}`} key={positioned.key}>
                <title>{`${positioned.name}${landmark?.detail ? ` · ${landmark.detail}` : ""}`}</title>
                {positioned.kind === "city"
                  ? <circle cx={positioned.pointX} cy={positioned.pointY} r={radius} />
                  : <path d={`M ${positioned.pointX} ${positioned.pointY - radius} L ${positioned.pointX + radius} ${positioned.pointY} L ${positioned.pointX} ${positioned.pointY + radius} L ${positioned.pointX - radius} ${positioned.pointY} Z`} />}
                <line x1={positioned.pointX} y1={positioned.pointY} x2={positioned.lineX} y2={positioned.lineY} />
                <text
                  x={positioned.labelX}
                  y={positioned.labelY}
                  dominantBaseline="middle"
                  fontSize={markerFontSize * 0.82}
                  textAnchor={positioned.textAnchor}
                >{positioned.name}</text>
              </g>
            );
          })}
        </svg>
        {!compact && <div className="mapbox-region-layer" ref={mapContainerRef} aria-hidden={!mapReady} />}
        <div className="map-zoom-controls" aria-label="Map zoom controls">
          <button type="button" onClick={() => changeStaticZoom(1.5)} disabled={staticView.zoom >= MAX_STATIC_ZOOM} aria-label="Zoom in"><Plus aria-hidden="true" /></button>
          <button type="button" onClick={() => changeStaticZoom(2 / 3)} disabled={staticView.zoom <= 1} aria-label="Zoom out"><Minus aria-hidden="true" /></button>
          <button type="button" onClick={resetStaticView} disabled={staticView.zoom <= 1} aria-label="Reset map view"><RotateCcw aria-hidden="true" /></button>
          {immersive && <button type="button" onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit full screen" : "View map full screen"}>{isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}</button>}
        </div>
      </div>
      <figcaption>
        {compact ? (
          <div className="compact-map-caption">
            <span>{focusLabel.length ? `${hasDenominationFocus ? `${compactContextLabel}${commonLabel ? `${commonLabel} · ` : ""}official denomination` : "Geographic focus"} · ${focusLabel.join(" + ")}` : "Production area"}</span>
            {regions[0].distillery && <strong><i aria-hidden="true" />{regions[0].distillery.name}</strong>}
          </div>
        ) : (
          <>
            <div className="map-caption-heading">
              <span>{focusLabel.length ? `${hasDenominationFocus ? `${contextLabel}${commonLabel ? `${commonLabel} · ` : ""}official denomination` : "Geographic focus"} · ${focusLabel.join(" + ")}` : mapReady ? "Interactive vector atlas" : "Regional vector atlas"}</span>
              {regions.some((region) => region.distillery) && <small><i /> Featured distillery</small>}
            </div>
            <ol>
              {regions.map((region, index) => (
                <li key={`${region.name}-legend-${index}`}>
                  <b aria-hidden="true" style={{ borderColor: REGION_COLORS[index % REGION_COLORS.length], boxShadow: `0 0 0 3px color-mix(in srgb, ${REGION_COLORS[index % REGION_COLORS.length]} 16%, transparent)` }} />
                  <strong>{region.name}</strong>
                  <small>{region.distillery ? region.distillery.name : region.kind === "protected" ? "Protected origin" : "Production tradition"}</small>
                </li>
              ))}
            </ol>
          </>
        )}
      </figcaption>
    </figure>
  );
}
