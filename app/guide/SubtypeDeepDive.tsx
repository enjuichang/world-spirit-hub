"use client";
/* eslint-disable @next/next/no-img-element -- Vinext's image optimizer cannot fetch project-local assets in the worker runtime. */

import { ArrowUpRight, FlaskConical, MapPinned, Sprout } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { MapRegion, SubtypeGuide } from "../guideData";
import { withBasePath } from "../publicPath";
import { RegionMap } from "./RegionMap";
import { getSubtypeDeepDive, getSubtypeTargetId } from "./subtypeDeepDives";

export function SubtypeDeepDive({ categoryId, subtypes }: { categoryId: string; subtypes: SubtypeGuide[] }) {
  const [selectedName, setSelectedName] = useState(subtypes[0]?.name ?? "");
  const [selectedZoneName, setSelectedZoneName] = useState<string | null>(null);
  const zoneCardRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    function readHash() {
      const match = subtypes.find((subtype) => `#${getSubtypeTargetId(categoryId, subtype.name)}` === window.location.hash);
      if (match) {
        setSelectedName(match.name);
        setSelectedZoneName(null);
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

  function showZoneCard(regionName: string) {
    const zoneName = deepDive?.zones.find((zone) => (
      zone.name === regionName
      || (deepDive.mapDisplay === "deduped-cities" && zone.name.split(",")[0].trim() === regionName)
    ))?.name ?? regionName;
    setSelectedZoneName(zoneName);
    window.requestAnimationFrame(() => {
      const card = zoneCardRefs.current.get(zoneName);
      if (!card) return;
      card.focus({ preventScroll: true });
      card.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center",
      });
    });
  }

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
            onRegionSelect={showZoneCard}
          />
          <div className="zone-list">
            {deepDive.zones.map((zone, index) => (
              <article
                className={selectedZoneName === zone.name ? "is-selected" : undefined}
                key={`${zone.name}-${zone.distillery?.name ?? index}`}
                ref={(element) => {
                  if (element) zoneCardRefs.current.set(zone.name, element);
                  else zoneCardRefs.current.delete(zone.name);
                }}
                tabIndex={-1}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h5>{zone.name}</h5>
                <strong>{zone.character}</strong>
                <p>{zone.detail}</p>
                {zone.distillery && (
                  <div className="zone-distillery">
                    {zone.distillery.image && (
                      <img src={withBasePath(zone.distillery.image)} alt="" width="96" height="96" />
                    )}
                    <div><small>Representative distillery</small><b>{zone.distillery.name}</b></div>
                  </div>
                )}
                {zone.source && <a className="zone-source" href={zone.source.url} target="_blank" rel="noreferrer">{zone.source.label}<ArrowUpRight size={11} /></a>}
              </article>
            ))}
          </div>
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
