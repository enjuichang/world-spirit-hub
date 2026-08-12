"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { LngLatBounds, Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapRegion } from "../guideData";
// Simplified Natural Earth admin-0, admin-1, and map-subunit geometry.
import boundaryData from "./region-boundaries.json";
// Protected Scotch areas derived from the statutory dividing line and the
// official 2007 ward boundaries named in the Scotch Whisky specification.
import scotchBoundaryData from "./scotch-regions.json";

type RegionGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;
type BoundaryProperties = { id: string };
type BoundaryFeature = GeoJSON.Feature<RegionGeometry, BoundaryProperties>;

const boundaryFeatures = new Map(
  [
    ...(boundaryData as GeoJSON.FeatureCollection<RegionGeometry, BoundaryProperties>).features,
    ...(scotchBoundaryData as GeoJSON.FeatureCollection<RegionGeometry, BoundaryProperties>).features,
  ].map((feature) => [
    feature.properties.id,
    feature,
  ]),
);

const boundaryGroups: Record<string, string[]> = {
  Benelux: ["Netherlands", "Belgium", "Luxembourg"],
  Korea: ["South Korea"],
  "Netherlands & Belgium": ["Netherlands", "Belgium"],
  "Pacific South America": ["Peru", "Chile"],
  "Peru & Chile": ["Peru", "Chile"],
};

const countryFocusGroups: Record<string, string[]> = {
  Armagnac: ["France"],
  "Bolivian high valleys": ["Bolivia"],
  "Central Europe": ["Germany", "Austria", "Switzerland"],
  Cognac: ["France"],
  Jerez: ["Spain"],
  Normandy: ["France"],
  "Pacific South America": ["Peru", "Chile"],
  "Peru & Chile": ["Peru", "Chile"],
  Tennessee: ["United States"],
  "Western Cape": ["South Africa"],
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

function featuresForIds(ids: string[]) {
  return ids.flatMap((id) => {
    const feature = boundaryFeatures.get(id);
    return feature ? [feature] : [];
  });
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
}: {
  regions: MapRegion[];
  label: string;
  compact?: boolean;
  focus?: string[];
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const focusIds = useMemo(
    () => compact || focus !== undefined ? focusIdsForRegions(regions, focus) : [],
    [compact, focus, regions],
  );
  const focusFeatures = useMemo(() => featuresForIds(focusIds), [focusIds]);
  const viewBox = focusFeatures.length
    ? focusedViewBox(focusFeatures)
    : compact
      ? pointFocusedViewBox(regions)
      : focusedViewBox([]);
  const markerRadius = compact
    ? Math.max(viewBox.width / 120, 0.065)
    : Math.max(viewBox.width / 68, 0.17);
  const markerFontSize = compact
    ? Math.max(viewBox.width / 34, 0.24)
    : Math.max(viewBox.width / 25, 0.5);
  const distilleryMarkerRadius = compact
    ? Math.max(viewBox.width / 145, 0.032)
    : Math.max(viewBox.width / 105, 0.12);

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
        map.scrollZoom.disable();
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

        map.on("load", () => {
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
                "match", ["get", "name"],
                "Highland", "#9b7845",
                "Speyside", "#d9a85b",
                "Lowland", "#766548",
                "Islay", "#c38c55",
                "Campbeltown", "#edc57f",
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
              "circle-radius": 14,
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
              "circle-radius": 9,
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
              id: "distillery-halo",
              type: "circle",
              source: "representative-distilleries",
              paint: {
                "circle-color": "#f0bd68",
                "circle-radius": 9,
                "circle-blur": 0.65,
                "circle-opacity": 0.5,
              },
            });
            map.addLayer({
              id: "distillery-points",
              type: "circle",
              source: "representative-distilleries",
              paint: {
                "circle-color": "#17120d",
                "circle-radius": 4.5,
                "circle-stroke-color": "#ffd992",
                "circle-stroke-width": 2,
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
            focusFeatures.forEach((feature) => extendGeometryBounds(bounds, feature.geometry));
            map.fitBounds(bounds, { padding: 28, maxZoom: 5.5, duration: 0 });
          } else if (regions.length > 1) {
            const bounds = new LngLatBounds();
            regions.forEach((region) => {
              const boundaries = boundariesForRegion(region);
              if (boundaries.length) boundaries.forEach((feature) => extendGeometryBounds(bounds, feature.geometry));
              else bounds.extend(region.point);
            });
            map.fitBounds(bounds, { padding: 42, maxZoom: 5.2, duration: 0 });
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
  }, [compact, focusFeatures, regions]);

  return (
    <figure className={`region-map${compact ? " compact" : ""}${focusFeatures.length ? " focused" : ""}`}>
      <div
        className={`map-canvas${mapReady ? " mapbox-ready" : ""}`}
        ref={wrapperRef}
        role="img"
        aria-label={`${label}: ${regions.map((region) => region.name).join(", ")}`}
      >
        <div className="map-graticule" aria-hidden="true" />
        {!focusFeatures.length && <div className="map-land" aria-hidden="true" />}
        <svg
          className="map-region-outlines"
          viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden="true"
        >
          {compact && !focusFeatures.length && (
            <image className="map-land-vector" href="/world-equirectangular.svg" x="0" y="0" width="360" height="180" />
          )}
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
              />
            )),
          )}
          {regions.flatMap((region, index) => {
            if (!region.distillery) return [];
            const point = project(region.distillery.point);
            const x = point.x * 3.6;
            const y = point.y * 1.8;
            return [
              <g className="map-distillery-marker" key={`${region.name}-distillery-${index}`}>
                <circle className="map-distillery-halo" cx={x} cy={y} r={distilleryMarkerRadius * 2.2} />
                <circle cx={x} cy={y} r={distilleryMarkerRadius} />
              </g>,
            ];
          })}
          {(focusFeatures.length > 0 || compact) && regions.map((region, index) => {
            const point = project(region.point);
            const x = point.x * 3.6;
            const y = point.y * 1.8;
            const direction = x > viewBox.x + viewBox.width * 0.58 ? -1 : 1;
            const labelY = y + ((index % 3) - 1) * markerFontSize * 1.4;
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
        {!focusFeatures.length && !compact && regions.map((region, index) => {
          const point = project(region.point);
          const hasBoundary = boundariesForRegion(region).length > 0;
          return (
            <span
              aria-hidden="true"
              className={`${hasBoundary ? "map-outline-index" : "map-marker"} ${region.kind ?? "traditional"}`}
              key={`${region.name}-${index}`}
              style={{ "--map-x": `${point.x}%`, "--map-y": `${point.y}%` } as CSSProperties}
            >
              <i>{hasBoundary ? region.name : index + 1}</i>
            </span>
          );
        })}
        {!compact && <div className="mapbox-region-layer" ref={mapContainerRef} aria-hidden={!mapReady} />}
      </div>
      <figcaption>
        {compact ? (
          <div className="compact-map-caption">
            <span>{focusIds.length ? `Geographic focus · ${focusIds.join(" + ")}` : "Production area"}</span>
            {regions[0].distillery && <strong><i aria-hidden="true" />{regions[0].distillery.name}</strong>}
          </div>
        ) : (
          <>
            <div className="map-caption-heading">
              <span>{focusIds.length ? `Geographic focus · ${focusIds.join(" + ")}` : mapReady ? "Interactive vector atlas" : "Regional vector atlas"}</span>
              {regions.some((region) => region.distillery) && <small><i /> Featured distillery</small>}
            </div>
            <ol>
              {regions.map((region, index) => (
                <li key={`${region.name}-legend-${index}`}>
                  <b aria-hidden="true" />
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
