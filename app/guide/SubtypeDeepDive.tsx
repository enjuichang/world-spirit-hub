"use client";
/* eslint-disable @next/next/no-img-element -- Vinext's image optimizer cannot fetch project-local assets in the worker runtime. */

import { ArrowUpRight, FlaskConical, MapPinned, Sprout } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MapRegion, SubtypeGuide } from "../guideData";
import { withBasePath } from "../publicPath";
import { RegionMap } from "./RegionMap";
import { getSubtypeDeepDive, getSubtypeTargetId } from "./subtypeDeepDives";

export function SubtypeDeepDive({ categoryId, subtypes }: { categoryId: string; subtypes: SubtypeGuide[] }) {
  const [selectedName, setSelectedName] = useState(subtypes[0]?.name ?? "");
  const [selectedZoneName, setSelectedZoneName] = useState<string | null>(null);
  const [previewZoneName, setPreviewZoneName] = useState<string | null>(null);
  const zonePanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    function readHash() {
      const match = subtypes.find((subtype) => `#${getSubtypeTargetId(categoryId, subtype.name)}` === window.location.hash);
      if (match) {
        setSelectedName(match.name);
        setSelectedZoneName(null);
        setPreviewZoneName(null);
      }
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [categoryId, subtypes]);

  const selected = subtypes.find((subtype) => subtype.name === selectedName) ?? subtypes[0];
  const deepDive = useMemo(() => selected ? getSubtypeDeepDive(categoryId, selected) : undefined, [categoryId, selected]);
  const mapRegions = useMemo<MapRegion[]>(() => {
    if (!deepDive || deepDive.mapDisplay !== "deduped-cities") return deepDive?.zones ?? [];

    const cities = new Map<string, { name: string; points: Array<[number, number]>; kind: MapRegion["kind"] }>();
    deepDive.zones.forEach((zone) => {
      const name = zone.name.split(",")[0].trim();
      const key = name.toLocaleLowerCase();
      const city = cities.get(key) ?? { name, points: [], kind: zone.kind };
      city.points.push(zone.point);
      cities.set(key, city);
    });

    return [...cities.values()].map((city) => ({
      name: city.name,
      point: [
        city.points.reduce((total, point) => total + point[0], 0) / city.points.length,
        city.points.reduce((total, point) => total + point[1], 0) / city.points.length,
      ],
      kind: city.kind,
    }));
  }, [deepDive]);

  const activeZoneName = previewZoneName ?? selectedZoneName;
  const selectedZones = useMemo(() => {
    if (!deepDive || !activeZoneName) return [];
    return deepDive.zones.filter((zone) => (
      zone.name === activeZoneName
      || (deepDive.mapDisplay === "deduped-cities" && zone.name.split(",")[0].trim() === activeZoneName)
    ));
  }, [activeZoneName, deepDive]);

  const previewZoneCard = useCallback((regionName: string) => {
    setPreviewZoneName(regionName);
  }, []);

  const clearZonePreview = useCallback(() => {
    setPreviewZoneName(null);
  }, []);

  const showZoneCard = useCallback((regionName: string) => {
    setSelectedZoneName(regionName);
    setPreviewZoneName(null);
    window.requestAnimationFrame(() => {
      const panel = zonePanelRef.current;
      if (!panel) return;
      panel.focus({ preventScroll: true });
      if (window.matchMedia("(max-width: 1180px)").matches) {
        panel.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        });
      }
    });
  }, []);

  if (!selected || !deepDive) return null;

  return (
    <section className="subtype-deep-dive" aria-labelledby={`${categoryId}-deep-title`}>
      <div className="deep-dive-anchors" aria-hidden="true">
        {subtypes.map((subtype) => <span id={getSubtypeTargetId(categoryId, subtype.name)} key={subtype.name} />)}
      </div>

      <header className="deep-dive-header">
        <div>
          <p className="guide-label">Subtype atlas</p>
          <h3 id={`${categoryId}-deep-title`}>{selected.name}, up close</h3>
          <p>{deepDive.introduction}</p>
        </div>
        <label>
          <span>Explore another subtype</span>
          <select
            value={selected.name}
            onChange={(event) => {
              const next = event.target.value;
              setSelectedName(next);
              setSelectedZoneName(null);
              setPreviewZoneName(null);
              window.history.replaceState(null, "", `#${getSubtypeTargetId(categoryId, next)}`);
            }}
          >
            {subtypes.map((subtype) => <option value={subtype.name} key={subtype.name}>{subtype.name}</option>)}
          </select>
        </label>
      </header>

      <article className={`ingredient-profile${!deepDive.ingredient.varieties?.length ? " has-image" : ""}`}>
        {!deepDive.ingredient.varieties?.length && (deepDive.ingredient.image ? (
          <img
            src={withBasePath(deepDive.ingredient.image)}
            alt={deepDive.ingredient.imageAlt ?? deepDive.ingredient.name}
            width="1536"
            height="1024"
          />
        ) : (
          <div className="ingredient-visual" aria-hidden="true">
            <Sprout />
            <span>{selected.name}</span>
            <strong>{deepDive.ingredient.name}</strong>
          </div>
        ))}
        <div className="ingredient-copy">
          <span><Sprout size={15} /> Raw ingredient</span>
          <h4>{deepDive.ingredient.name}</h4>
          {deepDive.ingredient.scientificName && <em>{deepDive.ingredient.scientificName}</em>}
          <p>{deepDive.ingredient.description}</p>
          <small>{deepDive.ingredient.fact}</small>
          {deepDive.ingredient.credit && (
            <a href={deepDive.ingredient.credit.url} target="_blank" rel="noreferrer">
              {deepDive.ingredient.credit.label}<ArrowUpRight size={11} />
            </a>
          )}
        </div>
      </article>

      {!!deepDive.ingredient.varieties?.length && (
        <div className="ingredient-variety-grid" aria-label={`${selected.name} principal fruit and grape varieties`}>
          {deepDive.ingredient.varieties.map((variety) => (
            <article key={variety.name}>
              <img src={withBasePath(variety.image)} alt={variety.imageAlt} width="960" height="720" />
              <div>
                <span>{variety.role}</span>
                <h5>{variety.name}</h5>
                {variety.scientificName && <em>{variety.scientificName}</em>}
                <p>{variety.description}</p>
                {variety.credit && (variety.credit.url
                  ? <a href={variety.credit.url} target="_blank" rel="noreferrer">{variety.credit.label}<ArrowUpRight size={11} /></a>
                  : <small>{variety.credit.label}</small>)}
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="subregion-heading">
        <MapPinned aria-hidden="true" />
        <div><span>Regional lens</span><h4>{deepDive.mapTitle}</h4><p>{deepDive.mapNote}</p></div>
      </div>

      {deepDive.zones.length ? (
        <div className="subregion-layout">
          <RegionMap
            regions={mapRegions}
            label={`${selected.name} subregions`}
            focus={deepDive.mapFocus}
            immersive
            displayMode={deepDive.mapDisplay === "deduped-cities" ? "cities" : "regions"}
            minimumRegion={categoryId === "rum" ? "caribbean" : undefined}
            geographicLabels={deepDive.mapGeographicLabels}
            onRegionSelect={showZoneCard}
            onRegionPreview={previewZoneCard}
            onRegionPreviewEnd={clearZonePreview}
            selectedRegion={selectedZoneName ?? undefined}
            showDistilleryMarkers={false}
          />
          <aside
            className={`zone-panel${selectedZones.length ? " has-selection" : ""}`}
            ref={zonePanelRef}
            tabIndex={-1}
            aria-live="polite"
            aria-label="Selected place details"
          >
            <header className="zone-panel-header">
              <span>{selectedZones.length ? "Selected place" : "Explore the map"}</span>
              <h5>{activeZoneName ?? "Choose a city or region"}</h5>
              <p>{selectedZones.length
                ? `${selectedZones.length} ${selectedZones.length === 1 ? "field card" : "field cards"}`
                : "Hover over or select a city or outlined subregion to see what makes it distinctive and its notable producers."}</p>
            </header>
            {selectedZones.length ? (
              <div className="zone-list">
                {selectedZones.map((zone) => {
                  const index = deepDive.zones.indexOf(zone);
                  return (
                    <article className="is-selected" key={`${zone.name}-${zone.distillery?.name ?? index}`}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <h5>{zone.name}</h5>
                      <small className="zone-signature-label">Famous style · what makes it unique</small>
                      <strong>{zone.character}</strong>
                      <p>{zone.detail}</p>
                      {zone.distillery && (
                        <div className="zone-distillery">
                          {zone.distillery.image && (
                            <img src={withBasePath(zone.distillery.image)} alt={`${zone.distillery.name} bottle`} width="96" height="96" />
                          )}
                          <div><small>Notable distillery</small><b>{zone.distillery.name}</b></div>
                        </div>
                      )}
                      {zone.source && <a className="zone-source" href={zone.source.url} target="_blank" rel="noreferrer">{zone.source.label}<ArrowUpRight size={11} /></a>}
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="zone-panel-empty" aria-hidden="true"><MapPinned /></div>
            )}
          </aside>
        </div>
      ) : (
        <div className="method-led-note"><FlaskConical /><strong>No honest regional subdivision</strong><p>{deepDive.mapNote}</p></div>
      )}

      {deepDive.styles?.length && (
        <div className="deep-style-section">
          <div className="subregion-heading"><FlaskConical aria-hidden="true" /><div><span>Styles within the subtype</span><h4>What changes in the glass</h4></div></div>
          <div className="deep-style-grid">
            {deepDive.styles.map((style) => <article key={style.name}><h5>{style.name}</h5><strong>{style.character}</strong><p>{style.detail}</p></article>)}
          </div>
        </div>
      )}

      {deepDive.source && <a className="deep-dive-source" href={deepDive.source.url} target="_blank" rel="noreferrer">Methodology source · {deepDive.source.label}<ArrowUpRight size={14} /></a>}
    </section>
  );
}
