"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import bottleImages from "../data/bottle-images.json";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Globe2,
  Layers3,
  List,
  Map as MapIcon,
  MapPin,
  Minus,
  Plus,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import {
  categories,
  getCategory,
  getLocation,
  locations,
} from "./data";
import { withBasePath } from "./publicPath";

type BottleImage = {
  imagePath: string;
  imageSourceUrl: string;
  productPageUrl: string;
  productName: string;
};

const bottleImageById = bottleImages as Record<string, BottleImage>;
const MAPBOX_PUBLIC_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const MAX_FALLBACK_ZOOM = 7;

type FallbackView = { zoom: number; centerX: number; centerY: number };

const DEFAULT_FALLBACK_VIEW: FallbackView = {
  zoom: 1,
  centerX: 0.5,
  centerY: 0.5,
};

function projectLocation([longitude, latitude]: [number, number]) {
  return {
    x: ((longitude + 180) / 360) * 360,
    y: ((90 - latitude) / 180) * 180,
  };
}

function clampFallbackView(view: FallbackView): FallbackView {
  const zoom = Math.min(MAX_FALLBACK_ZOOM, Math.max(1, view.zoom));
  const half = 0.5 / zoom;
  return {
    zoom,
    centerX: Math.min(1 - half, Math.max(half, view.centerX)),
    centerY: Math.min(1 - half, Math.max(half, view.centerY)),
  };
}

function OfflineExplorerMap({
  visibleLocations,
  activeId,
  onChooseLocation,
  onPreviewLocation,
  onLeaveLocation,
}: {
  visibleLocations: typeof locations;
  activeId: string | null;
  onChooseLocation: (id: string) => void;
  onPreviewLocation: (id: string) => void;
  onLeaveLocation: () => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const [view, setView] = useState(DEFAULT_FALLBACK_VIEW);
  const [viewport, setViewport] = useState({ width: 900, height: 630 });
  const width = 360 / view.zoom;
  const height = 180 / view.zoom;
  const viewBox = `${view.centerX * 360 - width / 2} ${view.centerY * 180 - height / 2} ${width} ${height}`;
  // This SVG uses `slice`, so the larger scale factor controls how user units
  // map to pixels. Convert the desired zoom-responsive pixel radius back into
  // viewBox units instead of assuming one geographic radius works everywhere.
  const screenScale = Math.max(viewport.width / width, viewport.height / height);
  const zoomProgress = Math.log(view.zoom) / Math.log(MAX_FALLBACK_ZOOM);
  const markerRadiusPixels = 3.5 + zoomProgress * 2.5;
  const markerRadius = markerRadiusPixels / Math.max(screenScale, 0.01);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width: nextWidth, height: nextHeight } = entry.contentRect;
      if (nextWidth >= 120 && nextHeight >= 120) setViewport({ width: nextWidth, height: nextHeight });
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  function changeZoom(multiplier: number) {
    setView((current) => clampFallbackView({
      ...current,
      zoom: current.zoom * multiplier,
    }));
  }

  function beginPan(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as Element).closest("button, [role='button']")) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePan(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || view.zoom <= 1) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };
    setView((current) => clampFallbackView({
      ...current,
      centerX: current.centerX - deltaX / Math.max(bounds.width * current.zoom, 1),
      centerY: current.centerY - deltaY / Math.max(bounds.height * current.zoom, 1),
    }));
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <div
      ref={containerRef}
      className={`map-canvas offline-explorer-map${view.zoom > 1 ? " is-zoomed" : ""}`}
      style={{ padding: 0 }}
      onPointerDown={beginPan}
      onPointerMove={movePan}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      aria-label="Interactive world spirits map"
    >
      <svg
        viewBox={viewBox}
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`${visibleLocations.length} spirit sites on a world map`}
      >
        <image href={withBasePath("/world-equirectangular.svg")} x="0" y="0" width="360" height="180" />
        <g className="offline-map-graticule" aria-hidden="true">
          {[45, 90, 135, 180, 225, 270, 315].map((x) => <line key={`x-${x}`} x1={x} y1="0" x2={x} y2="180" />)}
          {[45, 90, 135].map((y) => <line key={`y-${y}`} x1="0" y1={y} x2="360" y2={y} />)}
        </g>
        <g className="offline-map-markers">
          {visibleLocations.map((location) => {
            const point = projectLocation(location.coordinates);
            const category = getCategory(location.categoryId)!;
            const selected = activeId === location.id;
            return (
              <g
                key={location.id}
                className={selected ? "selected" : ""}
                role="button"
                tabIndex={0}
                aria-label={`${location.name}, ${location.place}, ${location.country}`}
                onMouseEnter={() => onPreviewLocation(location.id)}
                onMouseLeave={onLeaveLocation}
                onFocus={() => onPreviewLocation(location.id)}
                onBlur={onLeaveLocation}
                onClick={(event) => {
                  event.stopPropagation();
                  onChooseLocation(location.id);
                }}
                onKeyDown={(event) => {
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  onChooseLocation(location.id);
                }}
              >
                <circle className="offline-marker-halo" cx={point.x} cy={point.y} r={markerRadius * 1.55} />
                <circle cx={point.x} cy={point.y} r={selected ? markerRadius * 1.25 : markerRadius} fill={category.color} />
              </g>
            );
          })}
        </g>
      </svg>
      <div className="offline-map-note">Built-in atlas · always available</div>
      <div className="map-zoom-controls" aria-label="Map zoom controls">
        <button type="button" onClick={() => changeZoom(1.7)} disabled={view.zoom >= MAX_FALLBACK_ZOOM} aria-label="Zoom in">
          <Plus />
        </button>
        <button type="button" onClick={() => changeZoom(1 / 1.7)} disabled={view.zoom <= 1} aria-label="Zoom out">
          <Minus />
        </button>
        <button type="button" onClick={() => setView(DEFAULT_FALLBACK_VIEW)} disabled={view.zoom <= 1} aria-label="Reset map view">
          <RotateCcw />
        </button>
      </div>
    </div>
  );
}

function BottlePortrait({
  id,
  name,
  compact = false,
}: {
  id: string;
  name: string;
  compact?: boolean;
}) {
  const bottle = bottleImageById[id];
  if (!bottle) return null;

  return (
    <img
      className={`bottle-image ${compact ? "bottle-image-compact" : ""}`}
      src={withBasePath(bottle.imagePath)}
      alt={`${bottle.productName} bottle from ${name}`}
      loading="lazy"
      decoding="async"
    />
  );
}

function featureCollection(
  categoryId: string,
  query: string,
  selectedId: string | null,
): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const normalized = query.trim().toLocaleLowerCase();
  const visible = locations.filter((location) => {
    const matchesCategory =
      categoryId === "all" || location.categoryId === categoryId;
    const matchesQuery =
      normalized.length === 0 ||
      [
        location.name,
        location.place,
        location.country,
        location.subcategory,
        ...location.tags,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(normalized);
    return matchesCategory && matchesQuery;
  });

  return {
    type: "FeatureCollection",
    features: visible.map((location) => {
      const category = getCategory(location.categoryId)!;
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: location.coordinates },
        properties: {
          id: location.id,
          name: location.name,
          categoryId: location.categoryId,
          color: category.color,
          short: category.short,
          selected: location.id === selectedId ? 1 : 0,
        },
      };
    }),
  };
}

export function SpiritExplorer() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapboxMap | null>(null);
  const previewClearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"map" | "list">("map");
  const [mapMode, setMapMode] = useState<"2d" | "3d">("2d");

  const filteredLocations = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return locations.filter((location) => {
      const matchesCategory =
        categoryId === "all" || location.categoryId === categoryId;
      const matchesQuery =
        normalized.length === 0 ||
        [
          location.name,
          location.place,
          location.country,
          location.subcategory,
          ...location.tags,
        ]
          .join(" ")
          .toLocaleLowerCase()
          .includes(normalized);
      return matchesCategory && matchesQuery;
    });
  }, [categoryId, query]);

  const activeId = hoveredId ?? selectedId;
  const selectedLocation = activeId ? getLocation(activeId) : undefined;
  const selectedCategory = selectedLocation
    ? getCategory(selectedLocation.categoryId)
    : categoryId !== "all"
      ? getCategory(categoryId)
      : undefined;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    let loadTimer: ReturnType<typeof setTimeout> | undefined;

    try {
      const mapboxToken = MAPBOX_PUBLIC_TOKEN;
      if (!mapboxToken) {
        queueMicrotask(() => setMapFailed(true));
        return;
      }

      mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [9, 24],
        zoom: 1.25,
        minZoom: 1,
        maxZoom: 13,
        attributionControl: false,
      });

      mapRef.current = map;
      map.setProjection({ name: "mercator" });
      map.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "bottom-right",
      );
      map.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-left",
      );

      loadTimer = setTimeout(() => {
        if (!map.loaded()) setMapFailed(true);
      }, 8000);

      map.on("error", () => {
        if (!map.loaded()) setMapFailed(true);
      });

      map.on("load", () => {
        if (loadTimer) clearTimeout(loadTimer);
        setMapFailed(false);
        map.addSource("terrain-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });

        map.addSource("spirits", {
          type: "geojson",
          data: featureCollection("all", "", null),
          cluster: true,
          clusterMaxZoom: 6,
          clusterRadius: 44,
        });

        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "spirits",
          filter: ["has", "point_count"],
          paint: {
            "circle-color": [
              "step",
              ["get", "point_count"],
              "#7E694A",
              6,
              "#A98249",
              12,
              "#D4A95F",
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              19,
              6,
              23,
              12,
              28,
            ],
            "circle-stroke-color": "#F4EBDD",
            "circle-stroke-opacity": 0.55,
            "circle-stroke-width": 1,
          },
        });

        map.addLayer({
          id: "unclustered-points",
          type: "circle",
          source: "spirits",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ["get", "color"],
            "circle-radius": [
              "interpolate", ["linear"], ["zoom"],
              1, ["case", ["==", ["get", "selected"], 1], 7, 4],
              6, ["case", ["==", ["get", "selected"], 1], 9, 5.5],
              13, ["case", ["==", ["get", "selected"], 1], 12, 7],
            ],
            "circle-stroke-color": [
              "case",
              ["==", ["get", "selected"], 1],
              "#FFD37A",
              "#100F0E",
            ],
            "circle-stroke-width": [
              "interpolate", ["linear"], ["zoom"],
              1, ["case", ["==", ["get", "selected"], 1], 2.5, 1.25],
              13, ["case", ["==", ["get", "selected"], 1], 3.5, 2],
            ],
          },
        });

        map.on("click", "clusters", (event) => {
          const feature = map.queryRenderedFeatures(event.point, {
            layers: ["clusters"],
          })[0];
          const clusterId = Number(feature?.properties?.cluster_id);
          const source = map.getSource("spirits") as GeoJSONSource;
          if (!feature || Number.isNaN(clusterId)) return;
          const coordinates = (feature.geometry as GeoJSON.Point).coordinates as [
            number,
            number,
          ];
          source.getClusterExpansionZoom(clusterId, (error, zoom) => {
            if (error || zoom === null || zoom === undefined) return;
            map.easeTo({ center: coordinates, zoom, duration: 550 });
          });
        });

        map.on("click", "unclustered-points", (event) => {
          const feature = event.features?.[0];
          const id = feature?.properties?.id as string | undefined;
          if (!feature || !id) return;
          setSelectedId(id);
          setHoveredId(null);
          const point = feature.geometry as GeoJSON.Point;
          map.easeTo({
            center: point.coordinates as [number, number],
            zoom: Math.max(map.getZoom(), 5),
            duration: 500,
          });
        });

        map.on("mouseenter", "unclustered-points", (event) => {
          const id = event.features?.[0]?.properties?.id as string | undefined;
          if (id) previewLocation(id);
        });

        map.on("mouseleave", "unclustered-points", () => {
          clearLocationPreview();
        });

        ["clusters", "unclustered-points"].forEach((layer) => {
          map.on("mouseenter", layer, () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", layer, () => {
            map.getCanvas().style.cursor = "";
          });
        });

        setMapReady(true);
      });
    } catch {
      queueMicrotask(() => setMapFailed(true));
    }

    return () => {
      if (loadTimer) clearTimeout(loadTimer);
      if (previewClearTimer.current) clearTimeout(previewClearTimer.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const source = map.getSource("spirits") as GeoJSONSource | undefined;
    source?.setData(featureCollection(categoryId, query, activeId));
  }, [activeId, categoryId, mapReady, query]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map || !map.isStyleLoaded()) return;

    if (mapMode === "3d") {
      map.setProjection({ name: "globe" });
      map.setTerrain({ source: "terrain-dem", exaggeration: 1.15 });
      map.setFog({
        color: "#171d1c",
        "high-color": "#25312e",
        "horizon-blend": 0.08,
        "space-color": "#080706",
        "star-intensity": 0.12,
      });
      map.easeTo({
        pitch: 38,
        bearing: -12,
        zoom: Math.max(map.getZoom(), 1.55),
        duration: 700,
      });
    } else {
      map.setTerrain(null);
      map.setFog(null);
      map.setProjection({ name: "mercator" });
      map.easeTo({ pitch: 0, bearing: 0, duration: 650 });
    }
  }, [mapMode, mapReady]);

  function chooseCategory(nextId: string) {
    setCategoryId(nextId);
    setSelectedId(null);
    setHoveredId(null);
    setQuery("");
    const map = mapRef.current;
    if (map) map.easeTo({ center: [9, 24], zoom: 1.25, duration: 500 });
  }

  function chooseLocation(id: string) {
    const location = getLocation(id);
    if (!location) return;
    setSelectedId(id);
    setHoveredId(null);
    setMobileView("map");
    mapRef.current?.easeTo({
      center: location.coordinates,
      zoom: 5,
      duration: 500,
    });
  }

  function chooseMapMode(mode: "2d" | "3d") {
    setMapMode(mode);
    setMobileView("map");
  }

  function previewLocation(id: string) {
    if (previewClearTimer.current) clearTimeout(previewClearTimer.current);
    setHoveredId(id);
  }

  function clearLocationPreview(delay = 350) {
    if (previewClearTimer.current) clearTimeout(previewClearTimer.current);
    previewClearTimer.current = setTimeout(() => setHoveredId(null), delay);
  }

  return (
    <section className="explorer" id="explore" aria-labelledby="explore-title">
      <header className="explorer-intro">
          <p className="eyebrow">
            <span /> The spirited atlas
          </p>
          <h1 id="explore-title">
            Every spirit has
            <em> somewhere to begin.</em>
          </h1>
          <p>
            Trace raw materials, methods and laws across the map. Start broad,
            then follow a category to the people and places that shape it.
          </p>
          <div className="hero-facts" aria-label="Collection summary">
            <span>
              <strong>8</strong> families
            </span>
            <span>
              <strong>{locations.length}</strong> sites
            </span>
            <span>
              <strong>1</strong> world
            </span>
          </div>
      </header>

      <aside className="filter-panel" aria-label="Map filters">
          <div className="filter-heading">
            <span>Filter the atlas</span>
            {categoryId !== "all" && (
              <button type="button" onClick={() => chooseCategory("all")}>
                Clear
              </button>
            )}
          </div>
          <button
            type="button"
            className={`category-filter show-all ${categoryId === "all" ? "active" : ""}`}
            onClick={() => chooseCategory("all")}
            aria-pressed={categoryId === "all"}
          >
            <span className="all-mark">
              <Layers3 size={16} />
            </span>
            <span>
              <strong>Show all spirits</strong>
              <small>All {locations.length} map sites</small>
            </span>
            <ChevronRight size={16} aria-hidden="true" />
          </button>
          <div className="category-filter-grid">
            {categories.map((category) => {
              const count = locations.filter(
                (location) => location.categoryId === category.id,
              ).length;
              return (
                <button
                  type="button"
                  className={`category-filter ${categoryId === category.id ? "active" : ""}`}
                  key={category.id}
                  onClick={() => chooseCategory(category.id)}
                  aria-pressed={categoryId === category.id}
                  style={{ "--category": category.color } as React.CSSProperties}
                >
                  <span className="category-mark">{category.short}</span>
                  <span>
                    <strong>{category.name}</strong>
                    <small>{count} sites</small>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              );
            })}
          </div>
          {selectedCategory && !selectedLocation && (
            <Link className="category-guide-link" href={`/guide/${selectedCategory.id}`} style={{ "--category": selectedCategory.color } as React.CSSProperties}>
              <BookOpen size={15} />
              <span><small>Read the dedicated chapter</small>{selectedCategory.name}</span>
              <ArrowUpRight size={15} />
            </Link>
          )}
      </aside>

      <div className={`explorer-stage mobile-${mobileView}`}>
        <div className="map-toolbar">
          <label className="map-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search spirit sites</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a place or style…"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </label>
          <div className="result-count" aria-live="polite">
            <span>{filteredLocations.length}</span> places in view
          </div>
          <div
            className="dimension-toggle"
            role="group"
            aria-label="Choose 2D or 3D map"
          >
            <button
              type="button"
              className={mapMode === "2d" ? "active" : ""}
              onClick={() => chooseMapMode("2d")}
              aria-pressed={mapMode === "2d"}
            >
              <MapIcon size={14} /> 2D
            </button>
            <button
              type="button"
              className={mapMode === "3d" ? "active" : ""}
              onClick={() => chooseMapMode("3d")}
              aria-pressed={mapMode === "3d"}
              disabled={!mapReady}
              title={!mapReady ? "3D view will be available when the live map is ready" : undefined}
            >
              <Globe2 size={14} /> 3D
            </button>
          </div>
          <div className="view-toggle" aria-label="Choose result view">
            <button
              type="button"
              className={mobileView === "map" ? "active" : ""}
              onClick={() => setMobileView("map")}
              aria-pressed={mobileView === "map"}
            >
              <MapIcon size={15} /> Map
            </button>
            <button
              type="button"
              className={mobileView === "list" ? "active" : ""}
              onClick={() => setMobileView("list")}
              aria-pressed={mobileView === "list"}
            >
              <List size={15} /> List
            </button>
          </div>
        </div>

        <div className="map-pane">
          {!mapReady && !mapFailed && (
            <div className="map-loading" role="status">
              <span /> Drawing the atlas…
            </div>
          )}
          <div
            ref={mapContainer}
            className={`map-canvas mapbox-explorer-layer${mapFailed ? " mapbox-failed" : ""}`}
            aria-label="Interactive world spirits map"
          />
          {mapFailed && (
            <OfflineExplorerMap
              visibleLocations={filteredLocations}
              activeId={activeId}
              onChooseLocation={chooseLocation}
              onPreviewLocation={previewLocation}
              onLeaveLocation={() => clearLocationPreview()}
            />
          )}
          <div className="map-legend" aria-label="Spirit category legend">
            {categories.map((category) => (
              <span key={category.id}>
                <i style={{ backgroundColor: category.color }} />
                {category.short}
              </span>
            ))}
          </div>
        </div>

        <div className="location-list" aria-label="Spirit sites">
          <div className="list-heading">
            <span>Atlas index</span>
            <small>{filteredLocations.length} results</small>
          </div>
          {filteredLocations.length === 0 ? (
            <div className="no-results">
              <Search size={24} />
              <strong>No places match that search.</strong>
              <button type="button" onClick={() => setQuery("")}>
                Clear search
              </button>
            </div>
          ) : (
            filteredLocations.map((location) => {
              const category = getCategory(location.categoryId)!;
              return (
                <button
                  type="button"
                  key={location.id}
                  className={selectedId === location.id ? "selected" : ""}
                  onClick={() => chooseLocation(location.id)}
                >
                  <span className="list-bottle">
                    <BottlePortrait
                      id={location.id}
                      name={location.name}
                      compact
                    />
                    <i style={{ backgroundColor: category.color }}>
                      {category.short}
                    </i>
                  </span>
                  <span>
                    <strong>{location.name}</strong>
                    <small>
                      {location.place} · {location.subcategory}
                    </small>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              );
            })
          )}
        </div>

        {selectedLocation && selectedCategory && (
          <aside
            className={`detail-drawer${hoveredId ? " is-hover-preview" : ""}`}
            aria-label="Selected distillery details"
            aria-live="polite"
            onPointerEnter={() => {
              if (previewClearTimer.current) clearTimeout(previewClearTimer.current);
            }}
            onPointerLeave={() => clearLocationPreview(0)}
          >
            <button
              className="drawer-close"
              type="button"
              onClick={() => {
                setSelectedId(null);
                setHoveredId(null);
              }}
              aria-label="Close details"
            >
              <X size={18} />
            </button>
            <div
              className="drawer-category"
              style={{ color: selectedCategory.color }}
            >
              <span>{selectedCategory.short}</span>
              {selectedCategory.name}
            </div>

            <>
                <p className="drawer-overline">
                  <MapPin size={14} /> {selectedLocation.place},{" "}
                  {selectedLocation.country}
                </p>
                <h2>{selectedLocation.name}</h2>
                <p className="drawer-lead">{selectedLocation.descriptor}</p>
                {selectedLocation.precision === "approximate" && (
                  <p className="precision-note">Approximate regional marker</p>
                )}
                {bottleImageById[selectedLocation.id] && (
                  <figure className="drawer-bottle">
                    <BottlePortrait
                      id={selectedLocation.id}
                      name={selectedLocation.name}
                    />
                    <figcaption>
                      <span>Featured bottle</span>
                      <strong>{bottleImageById[selectedLocation.id].productName}</strong>
                      <small>
                        An actual bottling associated with this producer.
                      </small>
                      <a
                        href={bottleImageById[selectedLocation.id].productPageUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View product source <ArrowUpRight size={12} />
                      </a>
                    </figcaption>
                  </figure>
                )}
                <div className="taste-tags">
                  {selectedLocation.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <div className="drawer-section">
                  <h3>Why it matters</h3>
                  <p>{selectedLocation.note}</p>
                </div>
                <div className="drawer-section distillery-profile">
                  <h3>Distillery profile</h3>
                  <dl className="profile-facts">
                    <div>
                      <dt>Established</dt>
                      <dd>{selectedLocation.profile.established}</dd>
                    </div>
                    <div>
                      <dt>Spirit focus</dt>
                      <dd>{selectedLocation.subcategory}</dd>
                    </div>
                  </dl>
                </div>
                <details className="drawer-disclosure" open>
                  <summary>Production signature</summary>
                  <p>{selectedLocation.profile.production}</p>
                </details>
                <details className="drawer-disclosure">
                  <summary>Style in the glass</summary>
                  <p>{selectedLocation.profile.style}</p>
                </details>
                <details className="drawer-disclosure">
                  <summary>History & label context</summary>
                  <p>{selectedLocation.profile.context}</p>
                </details>
                {selectedLocation.sourceUrl && (
                  <a
                    className="source-link distillery-source"
                    href={selectedLocation.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Globe2 size={15} />
                    {selectedLocation.sourceLabel ?? "Official distillery website"}
                    <ArrowUpRight size={14} />
                  </a>
                )}

                <details className="family-reference">
                  <summary>
                    <BookOpen size={14} /> About the wider {selectedCategory.name} family
                  </summary>
                  <div className="family-reference-body">
                    <h3>Styles to know</h3>
                    <div className="subcategory-list">
                      {selectedCategory.subcategories.map((subcategory) => (
                        <span key={subcategory}>{subcategory}</span>
                      ))}
                    </div>
                    <h3>Taste compass</h3>
                    <div className="taste-bars">
                      {selectedCategory.taste.map((taste, index) => (
                        <div key={taste}>
                          <span>{taste}</span>
                          <i>
                            <b
                              style={{
                                width: `${78 - index * 7}%`,
                                backgroundColor: selectedCategory.color,
                              }}
                            />
                          </i>
                        </div>
                      ))}
                    </div>
                    <p>{selectedCategory.production}</p>
                    <a
                      className="source-link"
                      href={selectedCategory.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <BookOpen size={15} /> {selectedCategory.sourceLabel}
                      <ArrowUpRight size={14} />
                    </a>
                  </div>
                </details>
              </>
          </aside>
        )}
      </div>
    </section>
  );
}
