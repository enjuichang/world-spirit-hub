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
  "Calvados AOC": ["France"],
  "Cognac AOC": ["France"],
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

function distilleryCollection(regions: MapRegion[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: regions.flatMap((region) => region.distillery ? [{
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: region.distillery.point },
      properties: { name: region.distillery.name, region: region.name },
    }] : []),
  };
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
  const [staticViews, setStaticViews] = useState<Record<string, StaticView>>({});
  const [mapViewport, setMapViewport] = useState({ width: 720, height: 350 });
  const focusIds = useMemo(
    () => compact || focus !== undefined ? focusIdsForRegions(regions, focus) : [],
    [compact, focus, regions],
  );
  const focusFeatures = useMemo(() => featuresForIds(focusIds), [focusIds]);
  const contextIds = useMemo(() => contextIdsForFocus(focusIds), [focusIds]);
  const contextFeatures = useMemo(() => featuresForIds(contextIds), [contextIds]);
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

          const distilleries = distilleryCollection(regions);
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
                .setHTML(`<strong>${feature.properties?.name ?? "Distillery"}</strong><span>${feature.properties?.region ?? ""}</span>`)
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
  }, [compact, contextFeatures, focusFeatures, minimumBounds, regions, shouldApplyMinimumRegion]);

  return (
    <figure className={`region-map${compact ? " compact" : ""}${focusFeatures.length ? " focused" : ""}${immersive ? " immersive" : ""}`} ref={figureRef}>
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
          {focusFeatures.map((feature) => (
            <path className="map-focus-outline" d={geometryPath(feature.geometry)} fillRule="evenodd" key={`${feature.properties.id}-focus`} />
          ))}
          {regions.flatMap((region, index) =>
            boundariesForRegion(region).map((feature, featureIndex) => (
              <path
                className={`map-region-outline ${region.kind ?? "traditional"}`}
                d={geometryPath(feature.geometry)}
                fillRule="evenodd"
                key={`${region.name}-outline-${index}-${featureIndex}`}
                style={{ fill: `color-mix(in srgb, ${REGION_COLORS[index % REGION_COLORS.length]} 28%, transparent)`, stroke: REGION_COLORS[index % REGION_COLORS.length] }}
              />
            )),
          )}
          {regions.flatMap((region, index) => {
            if (!region.distillery) return [];
            const point = project(region.distillery.point);
            const x = point.x * 3.6;
            const y = point.y * 1.8;
            const radius = distilleryMarkerRadius;
            return [
              <g className="map-distillery-marker" key={`${region.name}-distillery-${index}`}>
                <path d={`M ${x - radius} ${y} a ${radius} ${radius} 0 1 0 ${radius * 2} 0 a ${radius} ${radius} 0 1 0 ${-radius * 2} 0`} />
              </g>,
            ];
          })}
          {regions.map((region, index) => {
            const point = project(region.point);
            const x = point.x * 3.6;
            const y = point.y * 1.8;
            const direction = x > viewBox.x + viewBox.width * 0.58 ? -1 : 1;
            const labelOffsets = [-1.8, -0.65, 0.65, -1.1, 1.7, 0.15];
            const labelY = y + labelOffsets[index % labelOffsets.length] * markerFontSize;
            const labelX = x + direction * markerRadius * 1.9;
            return (
              <g className={`map-focused-marker ${region.kind ?? "traditional"}`} key={`${region.name}-focused-${index}`}>
                <circle cx={x} cy={y} r={markerRadius} />
                <line x1={x} y1={y} x2={labelX} y2={labelY} />
                <text
                  x={labelX + direction * markerRadius * 0.45}
                  y={labelY}
                  dominantBaseline="middle"
                  fontSize={markerFontSize}
                  textAnchor={direction === 1 ? "start" : "end"}
                >{compact ? region.name : `${index + 1}. ${region.name}`}</text>
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
            <span>{focusLabel.length ? `${hasDenominationFocus ? "Official denomination" : "Geographic focus"} · ${focusLabel.join(" + ")}` : "Production area"}</span>
            {regions[0].distillery && <strong><i aria-hidden="true" />{regions[0].distillery.name}</strong>}
          </div>
        ) : (
          <>
            <div className="map-caption-heading">
              <span>{focusLabel.length ? `${hasDenominationFocus ? "Official denomination" : "Geographic focus"} · ${focusLabel.join(" + ")}` : mapReady ? "Interactive vector atlas" : "Regional vector atlas"}</span>
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
