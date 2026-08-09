import { ArrowRight, GlassWater, Route } from "lucide-react";
import type { ProgressionStep } from "./categoryProgressions";

export function CategoryProgression({ categoryName, steps }: { categoryName: string; steps: ProgressionStep[] }) {
  return (
    <section className="category-progression" id="learning-path" aria-labelledby="learning-path-title">
      <div className="guide-section-title">
        <Route aria-hidden="true" />
        <div><span>Guided tasting sequence</span><h3 id="learning-path-title">From introductory to advanced</h3></div>
      </div>
      <p className="progression-intro">A four-pour route through {categoryName.toLowerCase()}. “Advanced” means more intense or information-dense—not objectively better. Start with small pours, add water where useful, and compare slowly.</p>
      <ol className="progression-track">
        {steps.map((step, index) => (
          <li key={step.spirit}>
            <header><span>{String(index + 1).padStart(2, "0")}</span><small>{step.level}</small></header>
            <h4>{step.spirit}</h4>
            <div className="progression-serve"><GlassWater size={13} aria-hidden="true" />{step.serve}</div>
            <p>{step.lesson}</p>
            <footer><span>Look for</span>{step.lookFor}</footer>
            {index < steps.length - 1 && <ArrowRight aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </section>
  );
}
