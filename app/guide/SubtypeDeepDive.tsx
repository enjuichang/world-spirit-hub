"use client";
/* eslint-disable @next/next/no-img-element -- Vinext's image optimizer cannot fetch project-local assets in the worker runtime. */

import { ArrowUpRight, FlaskConical, MapPinned, Sprout } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { SubtypeGuide } from "../guideData";
import { RegionMap } from "./RegionMap";
import { getSubtypeDeepDive, getSubtypeTargetId } from "./subtypeDeepDives";

export function SubtypeDeepDive({ categoryId, subtypes }: { categoryId: string; subtypes: SubtypeGuide[] }) {
  const [selectedName, setSelectedName] = useState(subtypes[0]?.name ?? "");

  useEffect(() => {
    function readHash() {
      const match = subtypes.find((subtype) => `#${getSubtypeTargetId(categoryId, subtype.name)}` === window.location.hash);
      if (match) setSelectedName(match.name);
    }
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [categoryId, subtypes]);

  const selected = subtypes.find((subtype) => subtype.name === selectedName) ?? subtypes[0];
  const deepDive = useMemo(() => selected ? getSubtypeDeepDive(categoryId, selected) : undefined, [categoryId, selected]);
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
            src={deepDive.ingredient.image}
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
        </div>
      </article>

      {!!deepDive.ingredient.varieties?.length && (
        <div className="ingredient-variety-grid" aria-label={`${selected.name} principal fruit and grape varieties`}>
          {deepDive.ingredient.varieties.map((variety) => (
            <article key={variety.name}>
              <img src={variety.image} alt={variety.imageAlt} width="960" height="720" />
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
          <RegionMap regions={deepDive.zones} label={`${selected.name} subregions`} focus={deepDive.mapFocus} />
          <div className="zone-list">
            {deepDive.zones.map((zone, index) => (
              <article key={`${zone.name}-${zone.distillery?.name ?? index}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h5>{zone.name}</h5>
                <strong>{zone.character}</strong>
                <p>{zone.detail}</p>
                {zone.distillery && (
                  <div className="zone-distillery">
                    {zone.distillery.image && (
                      <img src={zone.distillery.image} alt="" width="96" height="96" />
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
