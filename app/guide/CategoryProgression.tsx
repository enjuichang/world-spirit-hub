"use client";

import { ArrowRight, GlassWater, Route } from "lucide-react";
import type { ProgressionStep } from "./categoryProgressions";
import { Bilingual, useLocale } from "../i18n";

export function CategoryProgression({ categoryName, steps }: { categoryName: string; steps: ProgressionStep[] }) {
  const { locale, term } = useLocale();
  return (
    <section className="category-progression" id="learning-path" aria-labelledby="learning-path-title">
      <div className="guide-section-title">
        <Route aria-hidden="true" />
        <div><span><Bilingual en="Guided tasting sequence" zh="引導式品飲順序" /></span><h3 id="learning-path-title"><Bilingual en="From introductory to advanced" zh="從入門走向進階" /></h3></div>
      </div>
      <p className="progression-intro"><Bilingual en={<>A four-pour route through {categoryName.toLowerCase()}. “Advanced” means more intense or information-dense—not objectively better. Start with small pours, add water where useful, and compare slowly.</>} zh={<>以四杯酒探索{categoryName}。「進階」代表風味更強烈或資訊量更高，不等於客觀上更好。先從少量開始，適時加水，慢慢比較。</>} /></p>
      <ol className="progression-track">
        {steps.map((step, index) => (
          <li key={step.spirit}>
            <header><span>{String(index + 1).padStart(2, "0")}</span><small>{locale === "zh-TW" ? ({ Introductory: "入門", Developing: "發展", Intermediate: "中階", Advanced: "進階" } as Record<string, string>)[step.level] ?? step.level : step.level}</small></header>
            <h4>{term(step.spirit)}</h4>
            <div className="progression-serve"><GlassWater size={13} aria-hidden="true" />{term(step.serve)}</div>
            <p>{term(step.lesson)}</p>
            <footer><span><Bilingual en="Look for" zh="留意" /></span>{term(step.lookFor)}</footer>
            {index < steps.length - 1 && <ArrowRight aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </section>
  );
}
