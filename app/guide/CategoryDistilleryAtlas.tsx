"use client";

import { ArrowUpRight, Factory, MapPinned, Minus, Plus, RotateCcw } from "lucide-react";
import type { CSSProperties } from "react";
import { useMemo, useRef, useState } from "react";
import type { SpiritLocation } from "../data";
import { withBasePath } from "../publicPath";

type AtlasView = { zoom: number; centerX: number; centerY: number };

const MAX_ATLAS_ZOOM = 8;

function normalizedPosition([longitude, latitude]: [number, number]) {
  return { x: (longitude + 180) / 360, y: (90 - latitude) / 180 };
}

function position(coordinates: [number, number], view: AtlasView) {
  const point = normalizedPosition(coordinates);
  return {
    left: `${50 + (point.x - view.centerX) * view.zoom * 100}%`,
    top: `${50 + (point.y - view.centerY) * view.zoom * 100}%`,
  };
}

function clampAtlasView(view: AtlasView): AtlasView {
  const zoom = Math.min(MAX_ATLAS_ZOOM, Math.max(1, view.zoom));
  const half = 0.5 / zoom;
  return {
    zoom,
    centerX: Math.min(1 - half, Math.max(half, view.centerX)),
    centerY: Math.min(1 - half, Math.max(half, view.centerY)),
  };
}

type SubtypeRegion = {
  name: string;
  count: number;
  style: CSSProperties;
};

type MapPoint = { x: number; y: number };
type MapCircle = MapPoint & { radius: number };

const CIRCLE_EPSILON = 1e-9;
const REGION_MARKER_CLEARANCE = 0.0025;

// Coordinates are measured in units of map height. Since the map is 2:1,
// x spans 0..2 and y spans 0..1. This keeps the regions circular on screen.
function mapPoint([longitude, latitude]: [number, number]): MapPoint {
  return { x: (longitude + 180) / 180, y: (90 - latitude) / 180 };
}

function squaredDistance(first: MapPoint, second: MapPoint) {
  return (first.x - second.x) ** 2 + (first.y - second.y) ** 2;
}

function contains(circle: MapCircle, point: MapPoint) {
  return squaredDistance(circle, point) <= (circle.radius + CIRCLE_EPSILON) ** 2;
}

function circleThroughPair(first: MapPoint, second: MapPoint): MapCircle {
  const x = (first.x + second.x) / 2;
  const y = (first.y + second.y) / 2;
  return { x, y, radius: Math.sqrt(squaredDistance({ x, y }, first)) };
}

function circleThroughTriple(first: MapPoint, second: MapPoint, third: MapPoint): MapCircle | null {
  const determinant = 2 * (
    first.x * (second.y - third.y)
    + second.x * (third.y - first.y)
    + third.x * (first.y - second.y)
  );
  if (Math.abs(determinant) <= CIRCLE_EPSILON) return null;

  const firstLength = first.x ** 2 + first.y ** 2;
  const secondLength = second.x ** 2 + second.y ** 2;
  const thirdLength = third.x ** 2 + third.y ** 2;
  const x = (
    firstLength * (second.y - third.y)
    + secondLength * (third.y - first.y)
    + thirdLength * (first.y - second.y)
  ) / determinant;
  const y = (
    firstLength * (third.x - second.x)
    + secondLength * (first.x - third.x)
    + thirdLength * (second.x - first.x)
  ) / determinant;
  return { x, y, radius: Math.sqrt(squaredDistance({ x, y }, first)) };
}

function smallestEnclosingCircle(points: MapPoint[]): MapCircle {
  let smallest: MapCircle | null = points.length === 1 ? { ...points[0], radius: 0 } : null;

  function consider(candidate: MapCircle | null) {
    if (
      candidate
      && (!smallest || candidate.radius < smallest.radius)
      && points.every((point) => contains(candidate, point))
    ) smallest = candidate;
  }

  for (let first = 0; first < points.length; first += 1) {
    for (let second = first + 1; second < points.length; second += 1) {
      consider(circleThroughPair(points[first], points[second]));
      for (let third = second + 1; third < points.length; third += 1) {
        consider(circleThroughTriple(points[first], points[second], points[third]));
      }
    }
  }

  // A minimum enclosing circle is always defined by one, two, or three points.
  return smallest ?? { ...points[0], radius: 0 };
}

function subtypeRegion(name: string, subtypeLocations: SpiritLocation[], allLocations: SpiritLocation[]): SubtypeRegion | null {
  const circle = smallestEnclosingCircle(subtypeLocations.map(({ coordinates }) => mapPoint(coordinates)));
  const radius = circle.radius + REGION_MARKER_CLEARANCE;
  const containsAnotherSubtype = allLocations.some((location) => (
    location.subcategory !== name
    && contains({ ...circle, radius }, mapPoint(location.coordinates))
  ));
  if (containsAnotherSubtype) return null;

  return {
    name,
    count: subtypeLocations.length,
    style: {
      left: `${circle.x * 50}%`,
      top: `${circle.y * 100}%`,
      width: `${radius * 100}%`,
      height: `${radius * 200}%`,
    },
  };
}

export function CategoryDistilleryAtlas({ categoryName, locations }: { categoryName: string; locations: SpiritLocation[] }) {
  const subcategories = useMemo(() => [...new Set(locations.map((location) => location.subcategory))], [locations]);
  const [filter, setFilter] = useState("All");
  const subtypeRegions = useMemo(() => {
    const subtypeLocations = subcategories.map((subcategory) => ({
      name: subcategory,
      locations: locations.filter((location) => location.subcategory === subcategory),
    }));
    const regions = subtypeLocations.flatMap(({ name, locations: matchingLocations }) => {
      const region = subtypeRegion(name, matchingLocations, locations);
      return region ? [region] : [];
    });
    if (filter !== "All") return regions.filter((region) => region.name === filter);
    const prominenceThreshold = Math.max(2, Math.ceil(Math.max(...subtypeLocations.map(({ locations: matchingLocations }) => matchingLocations.length)) * 0.15));
    return regions.filter(({ count }) => count >= prominenceThreshold).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filter, locations, subcategories]);
  const filtered = filter === "All" ? locations : locations.filter((location) => location.subcategory === filter);
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? "");
  const [atlasView, setAtlasView] = useState<AtlasView>({ zoom: 1, centerX: 0.5, centerY: 0.5 });
  const dragRef = useRef<{ pointerId: number; x: number; y: number } | null>(null);
  const selected = filtered.find((location) => location.id === selectedId) ?? filtered[0];
  const atlasZoomProgress = Math.log(atlasView.zoom) / Math.log(MAX_ATLAS_ZOOM);
  const atlasMarkerStyle = {
    "--atlas-marker-size": `${6 + atlasZoomProgress * 2}px`,
    "--atlas-marker-active-size": `${10 + atlasZoomProgress * 3}px`,
    "--atlas-marker-hit-size": `${18 + atlasZoomProgress * 4}px`,
  } as CSSProperties;

  function changeZoom(multiplier: number) {
    setAtlasView((current) => clampAtlasView({ ...current, zoom: current.zoom * multiplier }));
  }

  function resetView() {
    setAtlasView({ zoom: 1, centerX: 0.5, centerY: 0.5 });
  }

  function beginPan(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePan(event: React.PointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId || atlasView.zoom <= 1) return;
    const rectangle = event.currentTarget.getBoundingClientRect();
    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };
    setAtlasView((current) => clampAtlasView({
      ...current,
      centerX: current.centerX - deltaX / (Math.max(rectangle.width, 1) * current.zoom),
      centerY: current.centerY - deltaY / (Math.max(rectangle.height, 1) * current.zoom),
    }));
  }

  function endPan(event: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  }

  if (!locations.length) return null;

  return (
    <section className="category-distillery-atlas" id="distilleries" aria-labelledby="distillery-atlas-title">
      <div className="guide-section-title">
        <Factory aria-hidden="true" />
        <div><span>{locations.length} documented production sites</span><h3 id="distillery-atlas-title">Distillery map</h3></div>
      </div>
      <p className="distillery-atlas-intro">Explore the production sites in the {categoryName.toLowerCase()} chapter. Select a style to reduce the map, then choose a marker for its production story.</p>

      <div className="distillery-filter" aria-label="Filter distilleries by subtype">
        {["All", ...subcategories].map((subcategory) => (
          <button
            className={filter === subcategory ? "active" : ""}
            key={subcategory}
            onClick={() => {
              setFilter(subcategory);
              const first = subcategory === "All" ? locations[0] : locations.find((location) => location.subcategory === subcategory);
              if (first) setSelectedId(first.id);
            }}
            type="button"
          >{subcategory}<span>{subcategory === "All" ? locations.length : locations.filter((location) => location.subcategory === subcategory).length}</span></button>
        ))}
      </div>

      <div className="distillery-atlas-layout">
        <div className="distillery-world-map" role="group" aria-label={`${categoryName} distillery map with ${filtered.length} markers`}>
          <div
            className={`distillery-map-stage${atlasView.zoom > 1 ? " is-zoomed" : ""}`}
            style={atlasMarkerStyle}
            onPointerDown={beginPan}
            onPointerMove={movePan}
            onPointerUp={endPan}
            onPointerCancel={endPan}
            onWheel={(event) => {
              event.preventDefault();
              changeZoom(event.deltaY < 0 ? 1.25 : 0.8);
            }}
          >
            <div
              className="distillery-map-viewport"
              aria-hidden="true"
              style={{
                left: `${50 - atlasView.centerX * atlasView.zoom * 100}%`,
                top: `${50 - atlasView.centerY * atlasView.zoom * 100}%`,
                width: `${atlasView.zoom * 100}%`,
                height: `${atlasView.zoom * 100}%`,
              }}
            >
              <div className="distillery-map-grid" />
              <div
                className="distillery-map-land"
                style={{ backgroundImage: `url("${withBasePath("/world-equirectangular.svg")}")` }}
              />
              <div className="distillery-map-regions">
                {subtypeRegions.map((region) => (
                  <div className={filter === region.name ? "active" : ""} key={region.name} style={region.style}>
                    <span>{region.name}</span>
                  </div>
                ))}
              </div>
            </div>
            {filtered.map((location) => (
              <button
                aria-label={`${location.name}, ${location.place}`}
                aria-pressed={selected?.id === location.id}
                className={selected?.id === location.id ? "active" : ""}
                key={location.id}
                onClick={() => setSelectedId(location.id)}
                style={position(location.coordinates, atlasView)}
                title={location.name}
                type="button"
              ><span /></button>
            ))}
            <div className="map-zoom-controls" aria-label="Map zoom controls">
              <button type="button" onClick={() => changeZoom(1.5)} disabled={atlasView.zoom >= MAX_ATLAS_ZOOM} aria-label="Zoom in"><Plus aria-hidden="true" /></button>
              <button type="button" onClick={() => changeZoom(2 / 3)} disabled={atlasView.zoom <= 1} aria-label="Zoom out"><Minus aria-hidden="true" /></button>
              <button type="button" onClick={resetView} disabled={atlasView.zoom <= 1} aria-label="Reset map view"><RotateCcw aria-hidden="true" /></button>
            </div>
          </div>
          <div className="distillery-map-key"><span /> Prominent subtype regions</div>
          <div className="distillery-map-count"><strong>{filtered.length}</strong><span>{filter === "All" ? "sites shown" : filter}</span></div>
        </div>

        {selected && (
          <article className="distillery-map-detail">
            <div><MapPinned size={15} aria-hidden="true" /><span>{selected.place} · {selected.country}</span></div>
            <h4>{selected.name}</h4>
            <strong>{selected.descriptor}</strong>
            <p>{selected.note}</p>
            <ul>{selected.tags.map((tag) => <li key={tag}>{tag}</li>)}</ul>
            {selected.sourceUrl && <a href={selected.sourceUrl} target="_blank" rel="noreferrer">Visit source <ArrowUpRight size={13} /></a>}
          </article>
        )}
      </div>
    </section>
  );
}
