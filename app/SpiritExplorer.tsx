"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl, { GeoJSONSource, Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Globe2,
  Layers3,
  List,
  Map as MapIcon,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import {
  categories,
  getCategory,
  getLocation,
  locations,
} from "./data";

const bottleSpritePosition: Record<string, [number, number]> = {
  whisky: [0, 0],
  brandy: [33.333, 0],
  rum: [66.667, 0],
  agave: [100, 0],
  gin: [0, 100],
  vodka: [33.333, 100],
  asian: [66.667, 100],
  flavoured: [100, 100],
};

function BottlePortrait({
  categoryId,
  name,
  compact = false,
}: {
  categoryId: string;
  name: string;
  compact?: boolean;
}) {
  const [x, y] = bottleSpritePosition[categoryId] ?? bottleSpritePosition.whisky;

  return (
    <span
      className={`bottle-image ${compact ? "bottle-image-compact" : ""}`}
      role="img"
      aria-label={`Representative bottle portrait for ${name}`}
      style={
        {
          "--bottle-x": `${x}%`,
          "--bottle-y": `${y}%`,
        } as React.CSSProperties
      }
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
  const [mapReady, setMapReady] = useState(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [categoryId, setCategoryId] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
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

  const selectedLocation = selectedId ? getLocation(selectedId) : undefined;
  const selectedCategory = selectedLocation
    ? getCategory(selectedLocation.categoryId)
    : categoryId !== "all"
      ? getCategory(categoryId)
      : undefined;

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
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

      map.on("load", () => {
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
          id: "cluster-count",
          type: "symbol",
          source: "spirits",
          filter: ["has", "point_count"],
          layout: {
            "text-field": ["get", "point_count_abbreviated"],
            "text-size": 12,
            "text-font": ["Open Sans Bold"],
          },
          paint: { "text-color": "#100F0E" },
        });

        map.addLayer({
          id: "unclustered-points",
          type: "circle",
          source: "spirits",
          filter: ["!", ["has", "point_count"]],
          paint: {
            "circle-color": ["get", "color"],
            "circle-radius": [
              "case",
              ["==", ["get", "selected"], 1],
              12,
              9,
            ],
            "circle-stroke-color": [
              "case",
              ["==", ["get", "selected"], 1],
              "#FFD37A",
              "#100F0E",
            ],
            "circle-stroke-width": [
              "case",
              ["==", ["get", "selected"], 1],
              4,
              2,
            ],
          },
        });

        map.addLayer({
          id: "point-labels",
          type: "symbol",
          source: "spirits",
          filter: ["!", ["has", "point_count"]],
          layout: {
            "text-field": ["get", "short"],
            "text-size": 8,
            "text-font": ["Open Sans Bold"],
            "text-allow-overlap": true,
          },
          paint: { "text-color": "#100F0E" },
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
          if (!id) return;
          setSelectedId(id);
          const point = feature.geometry as GeoJSON.Point;
          map.easeTo({
            center: point.coordinates as [number, number],
            zoom: Math.max(map.getZoom(), 5),
            duration: 500,
          });
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
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || !map) return;
    const source = map.getSource("spirits") as GeoJSONSource | undefined;
    source?.setData(featureCollection(categoryId, query, selectedId));
  }, [categoryId, mapReady, query, selectedId]);

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
    setQuery("");
    const map = mapRef.current;
    if (map) map.easeTo({ center: [9, 24], zoom: 1.25, duration: 500 });
  }

  function chooseLocation(id: string) {
    const location = getLocation(id);
    if (!location) return;
    setSelectedId(id);
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

  return (
    <section className="explorer" id="explore" aria-labelledby="explore-title">
      <aside className="explorer-sidebar">
        <div className="explorer-intro">
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
              <strong>{locations.length}</strong> landmarks
            </span>
            <span>
              <strong>1</strong> world
            </span>
          </div>
        </div>

        <div className="filter-panel" aria-label="Map filters">
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
              <small>All {locations.length} map landmarks</small>
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
                    <small>{count} landmarks</small>
                  </span>
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <div className={`explorer-stage mobile-${mobileView}`}>
        <div className="map-toolbar">
          <label className="map-search">
            <Search size={17} aria-hidden="true" />
            <span className="sr-only">Search spirit landmarks</span>
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
              disabled={mapFailed}
            >
              <MapIcon size={14} /> 2D
            </button>
            <button
              type="button"
              className={mapMode === "3d" ? "active" : ""}
              onClick={() => chooseMapMode("3d")}
              aria-pressed={mapMode === "3d"}
              disabled={mapFailed}
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
          {mapFailed && (
            <div className="map-unavailable" role="alert">
              <MapIcon size={28} />
              <strong>The map is unavailable.</strong>
              <span>Every location remains available in list view.</span>
              <button type="button" onClick={() => setMobileView("list")}>
                Open list
              </button>
            </div>
          )}
          <div ref={mapContainer} className="map-canvas" aria-label="Interactive world spirits map" />
          <div className="map-legend" aria-label="Spirit category legend">
            {categories.map((category) => (
              <span key={category.id}>
                <i style={{ backgroundColor: category.color }} />
                {category.short}
              </span>
            ))}
          </div>
        </div>

        <div className="location-list" aria-label="Spirit landmarks">
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
                      categoryId={location.categoryId}
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

        {selectedCategory && (
          <aside className="detail-drawer" aria-label="Selected spirit details">
            <button
              className="drawer-close"
              type="button"
              onClick={() => {
                setSelectedId(null);
                if (!selectedLocation) setCategoryId("all");
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

            {selectedLocation ? (
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
                <figure className="drawer-bottle">
                  <BottlePortrait
                    categoryId={selectedLocation.categoryId}
                    name={selectedLocation.name}
                  />
                  <figcaption>
                    <span>Bottle portrait</span>
                    <strong>{selectedLocation.name}</strong>
                    <small>
                      A representative {selectedLocation.subcategory.toLowerCase()} bottle,
                      created for the atlas.
                    </small>
                  </figcaption>
                </figure>
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
            ) : (
              <>
                <p className="drawer-overline">
                  <Sparkles size={14} /> Category field note
                </p>
                <h2>{selectedCategory.name}</h2>
                <p className="drawer-lead">{selectedCategory.summary}</p>
              </>
            )}

            {!selectedLocation && (
              <>
                <div className="drawer-section">
                  <h3>Styles to know</h3>
                  <div className="subcategory-list">
                    {selectedCategory.subcategories.map((subcategory) => (
                      <span key={subcategory}>{subcategory}</span>
                    ))}
                  </div>
                </div>
                <div className="drawer-section">
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
                </div>
                <details className="drawer-disclosure">
                  <summary>Production & style</summary>
                  <p>{selectedCategory.production}</p>
                </details>
                <details className="drawer-disclosure">
                  <summary>Law & labels</summary>
                  <p>{selectedCategory.law}</p>
                </details>
                <details className="drawer-disclosure">
                  <summary>History</summary>
                  <p>{selectedCategory.history}</p>
                </details>
                <details className="drawer-disclosure">
                  <summary>What moves price</summary>
                  <p>{selectedCategory.price}</p>
                </details>
                <a
                  className="source-link"
                  href={selectedCategory.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  <BookOpen size={15} /> {selectedCategory.sourceLabel}
                  <ArrowUpRight size={14} />
                </a>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
