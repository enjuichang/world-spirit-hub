"use client";

import { ArrowUpRight, Factory, MapPinned } from "lucide-react";
import { useMemo, useState } from "react";
import type { SpiritLocation } from "../data";

function position([longitude, latitude]: [number, number]) {
  return { left: `${((longitude + 180) / 360) * 100}%`, top: `${((90 - latitude) / 180) * 100}%` };
}

type SubtypeRegion = {
  name: string;
  count: number;
  style: { left: string; top: string; width: string; height: string };
};

function subtypeRegion(name: string, locations: SpiritLocation[]): SubtypeRegion {
  const points = locations.map(({ coordinates }) => ({
    x: ((coordinates[0] + 180) / 360) * 100,
    y: ((90 - coordinates[1]) / 180) * 100,
  }));
  const xs = points.map(({ x }) => x);
  const ys = points.map(({ y }) => y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = Math.min(30, Math.max(6, maxX - minX + 4));
  const height = Math.min(32, Math.max(11, maxY - minY + 8));
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return {
    name,
    count: locations.length,
    style: {
      left: `${Math.max(0, Math.min(100 - width, centerX - width / 2))}%`,
      top: `${Math.max(0, Math.min(100 - height, centerY - height / 2))}%`,
      width: `${width}%`,
      height: `${height}%`,
    },
  };
}

export function CategoryDistilleryAtlas({ categoryName, locations }: { categoryName: string; locations: SpiritLocation[] }) {
  const subcategories = useMemo(() => [...new Set(locations.map((location) => location.subcategory))], [locations]);
  const [filter, setFilter] = useState("All");
  const subtypeRegions = useMemo(() => {
    const regions = subcategories.map((subcategory) =>
      subtypeRegion(subcategory, locations.filter((location) => location.subcategory === subcategory)),
    );
    if (filter !== "All") return regions.filter((region) => region.name === filter);
    return regions.sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filter, locations, subcategories]);
  const filtered = filter === "All" ? locations : locations.filter((location) => location.subcategory === filter);
  const [selectedId, setSelectedId] = useState(locations[0]?.id ?? "");
  const selected = filtered.find((location) => location.id === selectedId) ?? filtered[0];

  if (!locations.length) return null;

  return (
    <section className="category-distillery-atlas" id="distilleries" aria-labelledby="distillery-atlas-title">
      <div className="guide-section-title">
        <Factory aria-hidden="true" />
        <div><span>{locations.length} documented production sites</span><h3 id="distillery-atlas-title">Distillery map</h3></div>
      </div>
      <p className="distillery-atlas-intro">Explore the production landmarks in the {categoryName.toLowerCase()} chapter. Select a style to reduce the map, then choose a marker for its production story.</p>

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
          <div className="distillery-map-stage">
            <div className="distillery-map-grid" aria-hidden="true" />
            <div className="distillery-map-land" aria-hidden="true" />
            <div className="distillery-map-regions" aria-hidden="true">
              {subtypeRegions.map((region) => (
                <div className={filter === region.name ? "active" : ""} key={region.name} style={region.style}>
                  <span>{region.name}</span>
                </div>
              ))}
            </div>
            {filtered.map((location) => (
              <button
                aria-label={`${location.name}, ${location.place}`}
                aria-pressed={selected?.id === location.id}
                className={selected?.id === location.id ? "active" : ""}
                key={location.id}
                onClick={() => setSelectedId(location.id)}
                style={position(location.coordinates)}
                title={location.name}
                type="button"
              ><span /></button>
            ))}
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
