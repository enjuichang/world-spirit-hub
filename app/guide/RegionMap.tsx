"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatBounds, Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapRegion } from "../guideData";
// Simplified Natural Earth admin-0, admin-1, and map-subunit geometry.
import boundaryData from "./region-boundaries.json";

type RegionGeometry = GeoJSON.Polygon | GeoJSON.MultiPolygon;
type BoundaryProperties = { id: string };
type BoundaryFeature = GeoJSON.Feature<RegionGeometry, BoundaryProperties>;

const boundaryFeatures = new Map(
  (boundaryData as GeoJSON.FeatureCollection<RegionGeometry, BoundaryProperties>).features.map((feature) => [
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

export function RegionMap({
  regions,
  label,
  compact = false,
}: {
  regions: MapRegion[];
  label: string;
  compact?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const [mapReady, setMapReady] = useState(false);

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
        });
        mapRef.current = map;
        map.setProjection({ name: "mercator" });
        map.scrollZoom.disable();
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-left");

        map.on("load", () => {
          map.addSource("production-outlines", {
            type: "geojson",
            data: outlineCollection(regions),
          });
          map.addLayer({
            id: "production-area-fill",
            type: "fill",
            source: "production-outlines",
            paint: {
              "fill-color": ["case", ["==", ["get", "protected"], 1], "#e2bc78", "#d9a85b"],
              "fill-opacity": 0.2,
            },
          });
          map.addLayer({
            id: "production-area-glow",
            type: "line",
            source: "production-outlines",
            paint: {
              "line-color": "#e2bc78",
              "line-width": 7,
              "line-blur": 5,
              "line-opacity": 0.45,
            },
          });
          map.addLayer({
            id: "production-area-outline",
            type: "line",
            source: "production-outlines",
            paint: {
              "line-color": ["case", ["==", ["get", "protected"], 1], "#ffe1a3", "#e2bc78"],
              "line-width": 2.25,
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
            id: "production-index",
            type: "symbol",
            source: "production-labels",
            layout: {
              "text-field": ["to-string", ["get", "index"]],
              "text-size": 11,
              "text-font": ["Open Sans Bold"],
              "text-allow-overlap": true,
            },
            paint: {
              "text-color": "#fff4df",
              "text-halo-color": "#17120d",
              "text-halo-width": 2,
              "text-halo-blur": 0.5,
            },
          });

          if (regions.length > 1) {
            const bounds = new LngLatBounds();
            regions.forEach((region) => bounds.extend(region.point));
            map.fitBounds(bounds, { padding: 65, maxZoom: 4.2, duration: 0 });
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
  }, [compact, regions]);

  return (
    <figure className={`region-map${compact ? " compact" : ""}`}>
      <div
        className={`map-canvas${mapReady ? " mapbox-ready" : ""}`}
        ref={wrapperRef}
        role="img"
        aria-label={`${label}: ${regions.map((region) => region.name).join(", ")}`}
      >
        <div className="map-graticule" aria-hidden="true" />
        <div className="map-land" aria-hidden="true" />
        <svg className="map-region-outlines" viewBox="0 0 360 180" preserveAspectRatio="none" aria-hidden="true">
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
        </svg>
        {regions.map((region, index) => {
          const point = project(region.point);
          const hasBoundary = boundariesForRegion(region).length > 0;
          return (
            <span
              aria-hidden="true"
              className={`${hasBoundary ? "map-outline-index" : "map-marker"} ${region.kind ?? "traditional"}`}
              key={`${region.name}-${index}`}
              style={{ "--map-x": `${point.x}%`, "--map-y": `${point.y}%` } as CSSProperties}
            >
              <i>{index + 1}</i>
            </span>
          );
        })}
        {!compact && <div className="mapbox-region-layer" ref={mapContainerRef} aria-hidden={!mapReady} />}
      </div>
      <figcaption>
        <span>{compact ? "Production area" : mapReady ? "Interactive Mapbox atlas" : "Regional production atlas"}</span>
        <ol>
          {regions.map((region, index) => (
            <li key={`${region.name}-legend-${index}`}>
              <b>{index + 1}</b>
              <strong>{region.name}</strong>
              {!compact && <small>{region.kind === "protected" ? "Protected origin" : "Production tradition"}</small>}
            </li>
          ))}
        </ol>
      </figcaption>
    </figure>
  );
}
