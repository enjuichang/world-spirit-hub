"use client";

import { ArrowLeftRight } from "lucide-react";
import { useId, useState } from "react";
import type { SubtypeGuide } from "../guideData";
import { getComparisonProfile } from "./comparisonData";

type SubtypeComparisonProps = {
  categoryId: string;
  categoryName: string;
  subtypes: SubtypeGuide[];
};

export function SubtypeComparison({ categoryId, categoryName, subtypes }: SubtypeComparisonProps) {
  const id = useId();
  const [leftName, setLeftName] = useState(subtypes[0]?.name ?? "");
  const [rightName, setRightName] = useState(subtypes[1]?.name ?? subtypes[0]?.name ?? "");

  const left = subtypes.find((subtype) => subtype.name === leftName) ?? subtypes[0];
  const right = subtypes.find((subtype) => subtype.name === rightName) ?? subtypes[1] ?? subtypes[0];
  const leftProfile = left ? getComparisonProfile(categoryId, left.name) : undefined;
  const rightProfile = right ? getComparisonProfile(categoryId, right.name) : undefined;
  const displayCategoryName = categoryId === "asian" ? categoryName : categoryName.toLocaleLowerCase();

  if (!left || !right || !leftProfile || !rightProfile) return null;

  const rows = [
    { key: "ingredients", number: "01", label: "Base ingredients", left: leftProfile.ingredients, right: rightProfile.ingredients },
    { key: "method", number: "02", label: "Defining method", left: leftProfile.method, right: rightProfile.method },
    { key: "aging", number: "03", label: "Aging & resting", left: leftProfile.aging, right: rightProfile.aging },
    { key: "law", number: "04", label: "Origin & rules", left: left.law, right: right.law },
    { key: "style", number: "05", label: "Typical profile", left: left.style, right: right.style },
  ];

  return (
    <section className="subtype-comparison" aria-labelledby={`${id}-title`}>
      <div className="comparison-heading">
        <div>
          <p className="guide-label">Side-by-side method</p>
          <h3 id={`${id}-title`}>Compare {displayCategoryName} styles</h3>
        </div>
        <p>Select any two subtypes. Every pair is read through the same five lenses.</p>
      </div>

      <div className="comparison-selectors">
        <label>
          <span>First subtype</span>
          <select value={left.name} onChange={(event) => setLeftName(event.target.value)}>
            {subtypes.map((subtype) => <option key={subtype.name} value={subtype.name} disabled={subtype.name === right.name}>{subtype.name}</option>)}
          </select>
        </label>
        <span className="comparison-versus" aria-hidden="true"><ArrowLeftRight size={17} /></span>
        <label>
          <span>Second subtype</span>
          <select value={right.name} onChange={(event) => setRightName(event.target.value)}>
            {subtypes.map((subtype) => <option key={subtype.name} value={subtype.name} disabled={subtype.name === left.name}>{subtype.name}</option>)}
          </select>
        </label>
      </div>

      <div className="comparison-identities" aria-hidden="true">
        {[left, right].map((subtype) => (
          <div key={subtype.name}>
            <span>{subtype.lawStatus}</span>
            <strong>{subtype.name}</strong>
            <small>{subtype.region?.name ?? "Style defined by method"}</small>
          </div>
        ))}
      </div>

      <div className="comparison-table" role="table" aria-label={`${left.name} and ${right.name} comparison`}>
        {rows.map((row) => (
          <div className="comparison-row" role="row" key={row.key}>
            <div className="comparison-axis" role="rowheader"><span>{row.number}</span>{row.label}</div>
            <p role="cell">{row.left}</p>
            <p role="cell">{row.right}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
