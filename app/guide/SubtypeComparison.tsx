"use client";

import { ArrowLeftRight } from "lucide-react";
import { useId, useState } from "react";
import type { SubtypeGuide } from "../guideData";
import { getComparisonProfile } from "./comparisonData";
import { Bilingual, useLocale } from "../i18n";

type SubtypeComparisonProps = {
  categoryId: string;
  categoryName: string;
  subtypes: SubtypeGuide[];
};

export function SubtypeComparison({ categoryId, categoryName, subtypes }: SubtypeComparisonProps) {
  const { locale, term, placeName } = useLocale();
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
    { key: "ingredients", number: "01", label: locale === "zh-TW" ? "基礎原料" : "Base ingredients", left: term(leftProfile.ingredients), right: term(rightProfile.ingredients) },
    { key: "method", number: "02", label: locale === "zh-TW" ? "關鍵製法" : "Defining method", left: term(leftProfile.method), right: term(rightProfile.method) },
    { key: "aging", number: "03", label: locale === "zh-TW" ? "熟成與靜置" : "Aging & resting", left: term(leftProfile.aging), right: term(rightProfile.aging) },
    { key: "law", number: "04", label: locale === "zh-TW" ? "產地與規則" : "Origin & rules", left: term(left.law), right: term(right.law) },
    { key: "style", number: "05", label: locale === "zh-TW" ? "典型風格" : "Typical profile", left: term(left.style), right: term(right.style) },
  ];

  return (
    <section className="subtype-comparison" aria-labelledby={`${id}-title`}>
      <div className="comparison-heading">
        <div>
          <p className="guide-label"><Bilingual en="Side-by-side method" zh="並列比較" /></p>
          <h3 id={`${id}-title`}><Bilingual en={<>Compare {displayCategoryName} styles</>} zh={<>比較{categoryName}風格</>} /></h3>
        </div>
        <p><Bilingual en="Pick two subtypes and scan the five differences that matter most." zh="選擇兩個子類型，快速比較五項最重要的差異。" /></p>
      </div>

      <div className="comparison-selectors">
        <label>
          <span><Bilingual en="First subtype" zh="第一個子類型" /></span>
          <select value={left.name} onChange={(event) => setLeftName(event.target.value)}>
            {subtypes.map((subtype) => <option key={subtype.name} value={subtype.name} disabled={subtype.name === right.name}>{term(subtype.name)}</option>)}
          </select>
        </label>
        <span className="comparison-versus" aria-hidden="true"><ArrowLeftRight size={17} /></span>
        <label>
          <span><Bilingual en="Second subtype" zh="第二個子類型" /></span>
          <select value={right.name} onChange={(event) => setRightName(event.target.value)}>
            {subtypes.map((subtype) => <option key={subtype.name} value={subtype.name} disabled={subtype.name === left.name}>{term(subtype.name)}</option>)}
          </select>
        </label>
      </div>

      <div className="comparison-identities" aria-hidden="true">
        <div className="comparison-axis-heading">
          <span><Bilingual en="Compare by" zh="比較方式" /></span>
          <strong><Bilingual en="Five shared lenses" zh="五個共同面向" /></strong>
          <small><Bilingual en="Aligned row by row" zh="逐列對照" /></small>
        </div>
        {[left, right].map((subtype) => (
          <div key={subtype.name}>
            <span>{term(subtype.lawStatus)}</span>
            <strong>{term(subtype.name)}</strong>
            <small>{subtype.region ? placeName(subtype.region.name) : term("Style defined by method")}</small>
          </div>
        ))}
      </div>

      <div className="comparison-table" role="table" aria-label={locale === "zh-TW" ? `${term(left.name)}與${term(right.name)}比較` : `${left.name} and ${right.name} comparison`}>
        {rows.map((row) => (
          <div className="comparison-row" role="row" key={row.key}>
            <div className="comparison-axis" role="rowheader"><span>{row.number}</span>{row.label}</div>
            <p role="cell" title={row.left}>{toComparisonPhrase(row.left)}</p>
            <p role="cell" title={row.right}>{toComparisonPhrase(row.right)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function toComparisonPhrase(value: string) {
  const firstSentence = value.match(/^.*?[.!?。！？](?:\s|$)/)?.[0].trim() ?? value.trim();
  const firstClause = firstSentence.split(/[;—]/, 1)[0].trim();

  if (firstClause.length <= 92) return firstClause;

  const commaBreak = firstClause.slice(0, 93).lastIndexOf(",");
  if (commaBreak >= 42) return `${firstClause.slice(0, commaBreak).trim()}.`;

  const wordBreak = firstClause.slice(0, 90).lastIndexOf(" ");
  return `${firstClause.slice(0, wordBreak).trim()}…`;
}
