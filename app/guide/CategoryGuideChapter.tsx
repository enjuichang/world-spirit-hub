import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  Factory,
  Fingerprint,
  Scale,
  Sparkles,
  Tag,
} from "lucide-react";
import { locations, type SpiritCategory } from "../data";
import type { CategoryGuide } from "../guideData";
import { CategoryDistilleryAtlas } from "./CategoryDistilleryAtlas";
import { CategoryProgression } from "./CategoryProgression";
import { ChapterNavigator } from "./ChapterNavigator";
import { RegionMap } from "./RegionMap";
import { SubtypeComparison } from "./SubtypeComparison";
import { SubtypeDeepDive } from "./SubtypeDeepDive";
import { categoryProgressions } from "./categoryProgressions";
import { getSubtypeTargetId } from "./subtypeDeepDives";
import { withLabelDistilleries } from "./labelDistilleries";
import { getSubtypeClassification } from "./subtypeClassifications";

type CategoryGuideChapterProps = {
  category: SpiritCategory;
  guide: CategoryGuide;
  index: number;
  previous?: SpiritCategory;
  next?: SpiritCategory;
};

export function CategoryGuideChapter({ category, guide, index, previous, next }: CategoryGuideChapterProps) {
  const mappedLabels = withLabelDistilleries(
    category.id,
    guide.labelTerms.flatMap((term) => term.region ? [term.region] : []),
  );
  const categoryLocations = locations.filter((location) => location.categoryId === category.id);
  const progression = categoryProgressions[category.id] ?? [];
  const minimumMapRegion = category.id === "rum" ? "caribbean" as const : undefined;

  return (
    <>
      <header className="page-hero compact guide-chapter-hero" style={{ "--category": category.color } as React.CSSProperties}>
        <Link className="back-link" href="/guide"><ArrowLeft size={15} /> All spirit families</Link>
        <p className="eyebrow"><span /> Field guide · Chapter {String(index + 1).padStart(2, "0")}</p>
        <h1>{category.name}</h1>
        <p>{category.summary}</p>
        <nav className="guide-jump" aria-label="Spirit family chapters">
          <Link href="/guide">All chapters</Link>
          <span aria-hidden="true" />
          <strong>{category.short} · Current chapter</strong>
        </nav>
      </header>

      <div className="guide-entries">
        <article className="guide-entry guide-chapter-entry" style={{ "--category": category.color } as React.CSSProperties}>
          <div className="guide-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
          <div className="guide-main">
            <p className="guide-label">{category.short} · Spirit family</p>
            <h2>Read the category</h2>
            <p className="guide-summary">{guide.detail}</p>
            <div className="guide-taste-row">{category.taste.map((taste) => <span key={taste}>{taste}</span>)}</div>

            <section className="production-story" id="production" aria-labelledby={`${category.id}-production`}>
              <GuideTitle icon={<Factory />} kicker="Production infographic" id={`${category.id}-production`}>How it becomes spirit</GuideTitle>
              <ol className="process-flow">
                {guide.process.map((step, stepIndex) => (
                  <li key={step}><span>{String(stepIndex + 1).padStart(2, "0")}</span><strong>{step}</strong>{stepIndex < guide.process.length - 1 && <ArrowRight aria-hidden="true" />}</li>
                ))}
              </ol>
              <p>{category.production}</p>
            </section>

            <section className="branding-terms" id="branding-terms" aria-labelledby={`${category.id}-branding`}>
              <GuideTitle icon={<BookOpenText />} kicker={`${guide.brandingTerms.length} common distinctions`} id={`${category.id}-branding`}>Common terms on the bottle</GuideTitle>
              <p className="branding-intro">Brand language can describe law, method or simply a producer&apos;s positioning. These side-by-side definitions show what the familiar wording does—and does not—promise.</p>
              <div className="branding-term-grid">
                {guide.brandingTerms.map((item) => (
                  <article className="branding-term-card" key={`${item.term}-${item.contrast}`}>
                    <header><strong>{item.term}</strong><span>vs</span><strong>{item.contrast}</strong></header>
                    <p>{item.meaning}</p>
                    <footer><span>Read the label</span>{item.labelCue}</footer>
                  </article>
                ))}
              </div>
            </section>

            <section className="label-atlas" id="regional-labels" aria-labelledby={`${category.id}-labels`}>
              <GuideTitle icon={<Tag />} kicker="Bottle vocabulary" id={`${category.id}-labels`}>Regional names found on labels</GuideTitle>
              <div className="label-atlas-grid">
                <div className="label-term-list">
                  {guide.labelTerms.map((term) => <article key={term.term}><span>{term.place}</span><h4>{term.term}</h4><p>{term.meaning}</p></article>)}
                </div>
                {mappedLabels.length > 0 && <RegionMap regions={mappedLabels} label={`${category.name} production regions`} minimumRegion={minimumMapRegion} />}
              </div>
            </section>

            <section className="subtype-section" id="styles" aria-labelledby={`${category.id}-subtypes`}>
              <GuideTitle icon={<Sparkles />} kicker={`${guide.subtypes.length} styles decoded`} id={`${category.id}-subtypes`}>Subtype field cards</GuideTitle>
              <div className="subtype-card-grid">
                {guide.subtypes.map((subtype) => {
                  const classification = getSubtypeClassification(category.id, subtype.name);
                  const example = classification
                    ? categoryLocations.find((location) => location.id === classification.distilleryId)
                    : undefined;
                  const mappedRegion = subtype.region && example
                    ? { ...subtype.region, distillery: { name: example.name, point: example.coordinates } }
                    : subtype.region;

                  return (
                    <article className="subtype-card" key={subtype.name}>
                      <header><h4>{subtype.name}</h4><span className={`law-status ${subtype.lawStatus.toLowerCase().replaceAll(" ", "-")}`}>{subtype.lawStatus}</span></header>
                      {classification && <SubtypeFact icon={<Fingerprint />} title="Distinct classification">{classification.definition}</SubtypeFact>}
                      <SubtypeFact icon={<Scale />} title="The law">{subtype.law}</SubtypeFact>
                      <SubtypeFact icon={<Sparkles />} title="Signature style">{subtype.style}</SubtypeFact>
                      {example && <SubtypeFact icon={<Factory />} title="Distillery example"><strong className="subtype-example-name">{example.name}</strong>{example.place}, {example.country}. {example.descriptor}.</SubtypeFact>}
                      {mappedRegion && <div className="subtype-map-wrap"><RegionMap regions={[mappedRegion]} label={`${subtype.name} distribution`} compact minimumRegion={minimumMapRegion} /></div>}
                      <a className="subtype-explore-link" href={`#${getSubtypeTargetId(category.id, subtype.name)}`}>Explore regions & ingredients <ArrowRight size={13} /></a>
                    </article>
                  );
                })}
              </div>
            </section>

            <SubtypeDeepDive categoryId={category.id} subtypes={guide.subtypes} />
            {!!progression.length && <CategoryProgression categoryName={category.name} steps={progression} />}
            <div id="compare"><SubtypeComparison categoryId={category.id} categoryName={category.name} subtypes={guide.subtypes} /></div>
            <CategoryDistilleryAtlas categoryName={category.name} locations={categoryLocations} />
          </div>

          <ChapterNavigator
            sections={[
              { href: "#production", label: "How it's made" },
              { href: "#branding-terms", label: "Common bottle terms" },
              { href: "#regional-labels", label: "Regional label names" },
              { href: "#styles", label: "Subtype field cards" },
              { href: "#learning-path", label: "Intro to advanced" },
              { href: "#compare", label: "Compare styles" },
              { href: "#distilleries", label: "Distillery map" },
            ]}
            subtypes={guide.subtypes.map((subtype) => ({ href: `#${getSubtypeTargetId(category.id, subtype.name)}`, label: subtype.name }))}
            sourceUrl={category.sourceUrl}
          />
        </article>
      </div>

      <nav className="chapter-pagination" aria-label="Adjacent spirit family chapters">
        {previous ? <Link href={`/guide/${previous.id}`}><ArrowLeft size={16} /><span><small>Previous chapter</small>{previous.name}</span></Link> : <span />}
        {next ? <Link href={`/guide/${next.id}`}><span><small>Next chapter</small>{next.name}</span><ArrowRight size={16} /></Link> : <Link href="/guide"><span><small>Return to</small>All spirit families</span><ArrowRight size={16} /></Link>}
      </nav>
    </>
  );
}

function GuideTitle({ icon, kicker, id, children }: { icon: React.ReactNode; kicker: string; id: string; children: React.ReactNode }) {
  return <div className="guide-section-title">{icon}<div><span>{kicker}</span><h3 id={id}>{children}</h3></div></div>;
}

function SubtypeFact({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="subtype-fact">{icon}<div><strong>{title}</strong><p>{children}</p></div></div>;
}
