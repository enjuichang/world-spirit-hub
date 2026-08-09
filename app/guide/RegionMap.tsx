"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import mapboxgl, { LngLatBounds, Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapRegion } from "../guideData";

function project([longitude, latitude]: [number, number]) {
  return {
    x: ((longitude + 180) / 360) * 100,
    y: ((90 - latitude) / 180) * 100,
  };
}

function regionCollection(regions: MapRegion[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  return {
    type: "FeatureCollection",
    features: regions.map((region, index) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: region.point },
      properties: {
        index: index + 1,
        name: region.name,
        protected: region.kind === "protected" ? 1 : 0,
      },
    })),
  };
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
          map.addSource("production-regions", {
            type: "geojson",
            data: regionCollection(regions),
          });
          map.addLayer({
            id: "production-halo",
            type: "circle",
            source: "production-regions",
            paint: {
              "circle-color": "#e2bc78",
              "circle-radius": 14,
              "circle-blur": 0.75,
              "circle-opacity": 0.65,
            },
          });
          map.addLayer({
            id: "production-points",
            type: "circle",
            source: "production-regions",
            paint: {
              "circle-color": ["case", ["==", ["get", "protected"], 1], "#f4c978", "#d9a85b"],
              "circle-radius": 9,
              "circle-stroke-color": "#fff4df",
              "circle-stroke-width": 2,
            },
          });
          map.addLayer({
            id: "production-index",
            type: "symbol",
            source: "production-regions",
            layout: {
              "text-field": ["to-string", ["get", "index"]],
              "text-size": 10,
              "text-font": ["Open Sans Bold"],
              "text-allow-overlap": true,
            },
            paint: { "text-color": "#17120d" },
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
        {regions.map((region, index) => {
          const point = project(region.point);
          return (
            <span
              aria-hidden="true"
              className={`map-marker ${region.kind ?? "traditional"}`}
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
