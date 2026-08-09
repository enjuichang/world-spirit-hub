import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, BookOpen, Factory, MapPinned, Scale, Sparkles, Tag } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { categories } from "../data";
import { getCategoryGuide, guideSources } from "../guideData";
import { RegionMap } from "./RegionMap";
import { SubtypeComparison } from "./SubtypeComparison";

export const metadata: Metadata = {
  title: "Spirit guide",
  description: "A richly illustrated guide to the production, label language, law, style and geography of the world's spirit families.",
};

export default function GuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="guide-page">
        <header className="page-hero compact">
          <Link className="back-link" href="/#explore"><ArrowLeft size={15} /> Back to the atlas</Link>
          <p className="eyebrow"><span /> Field guide</p>
          <h1>Eight families. Hundreds of ways to make a spirit.</h1>
          <p>Read the production chain, decode the words printed on the bottle, and see where protected names belong. Every subtype pairs its legal identity with the style you can expect in the glass.</p>
          <nav className="guide-jump" aria-label="Jump to a spirit family">
            {categories.map((category) => <a key={category.id} href={`#${category.id}`}><i style={{ backgroundColor: category.color }} />{category.name}</a>)}
          </nav>
        </header>

        <div className="guide-entries">
          {categories.map((category, index) => {
            const guide = getCategoryGuide(category.id);
            if (!guide) return null;
            const mappedLabels = guide.labelTerms.flatMap((term) => term.region ? [term.region] : []);
            return (
              <article className="guide-entry" id={category.id} key={category.id} style={{ "--category": category.color } as React.CSSProperties}>
                <div className="guide-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
                <div className="guide-main">
                  <p className="guide-label">{category.short} · Spirit family</p>
                  <h2>{category.name}</h2>
                  <p className="guide-summary">{guide.detail}</p>
                  <div className="guide-taste-row">{category.taste.map((taste) => <span key={taste}>{taste}</span>)}</div>

                  <section className="production-story" aria-labelledby={`${category.id}-production`}>
                    <GuideTitle icon={<Factory />} kicker="Production infographic" id={`${category.id}-production`}>How it becomes spirit</GuideTitle>
                    <ol className="process-flow">
                      {guide.process.map((step, stepIndex) => (
                        <li key={step}><span>{String(stepIndex + 1).padStart(2, "0")}</span><strong>{step}</strong>{stepIndex < guide.process.length - 1 && <ArrowRight aria-hidden="true" />}</li>
                      ))}
                    </ol>
                    <p>{category.production}</p>
                  </section>

                  <section className="label-atlas" aria-labelledby={`${category.id}-labels`}>
                    <GuideTitle icon={<Tag />} kicker="Bottle vocabulary" id={`${category.id}-labels`}>Regional names found on labels</GuideTitle>
                    <div className="label-atlas-grid">
                      <div className="label-term-list">
                        {guide.labelTerms.map((term) => <article key={term.term}><span>{term.place}</span><h4>{term.term}</h4><p>{term.meaning}</p></article>)}
                      </div>
                      {mappedLabels.length > 0 && <RegionMap regions={mappedLabels} label={`${category.name} production regions`} />}
                    </div>
                  </section>

                  <section className="subtype-section" aria-labelledby={`${category.id}-subtypes`}>
                    <GuideTitle icon={<Sparkles />} kicker={`${guide.subtypes.length} styles decoded`} id={`${category.id}-subtypes`}>Subtype field cards</GuideTitle>
                    <div className="subtype-card-grid">
                      {guide.subtypes.map((subtype) => (
                        <article className="subtype-card" id={getSubtypeId(category.id, subtype.name)} key={subtype.name}>
                          <header><h4>{subtype.name}</h4><span className={`law-status ${subtype.lawStatus.toLowerCase().replaceAll(" ", "-")}`}>{subtype.lawStatus}</span></header>
                          <SubtypeFact icon={<Scale />} title="The law">{subtype.law}</SubtypeFact>
                          <SubtypeFact icon={<Sparkles />} title="Signature style">{subtype.style}</SubtypeFact>
                          {subtype.region && <div className="subtype-map-wrap"><MapPinned size={14} aria-hidden="true" /><RegionMap regions={[subtype.region]} label={`${subtype.name} distribution`} compact /></div>}
                        </article>
                      ))}
                    </div>
                  </section>

                  <SubtypeComparison categoryId={category.id} categoryName={category.name} subtypes={guide.subtypes} />
                </div>

                <aside className="guide-aside">
                  <div>
                    <h3>In this chapter</h3>
                    <ul className="chapter-links">
                      {guide.subtypes.map((subtype) => (
                        <li key={subtype.name}>
                          <a href={`#${getSubtypeId(category.id, subtype.name)}`}>
                            <span>{subtype.name}</span>
                            <ArrowRight size={13} aria-hidden="true" />
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div><h3>How to read the cards</h3><p className="aside-note">“Protected origin” ties a name to place. “Defined style” sets production rules without necessarily defining one place. “Traditional term” is recognized usage; “broad style” is a useful description, not one universal law.</p></div>
                  <a className="source-link" href={category.sourceUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /> Primary study reference <ArrowUpRight size={14} /></a>
                </aside>
              </article>
            );
          })}
        </div>

        <section className="guide-legal-note" aria-labelledby="guide-sources-title">
          <div><p className="eyebrow"><span /> Read with context</p><h2 id="guide-sources-title">A field guide, not a substitute for the current rulebook.</h2></div>
          <div><p>Spirit laws change by origin and sales market. The cards summarize defining ideas for education; producers and trade users should confirm the current specification before labeling or compliance work.</p><div className="guide-source-links">{guideSources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer">{source.label} <ArrowUpRight size={13} /></a>)}</div></div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function GuideTitle({ icon, kicker, id, children }: { icon: React.ReactNode; kicker: string; id: string; children: React.ReactNode }) {
  return <div className="guide-section-title">{icon}<div><span>{kicker}</span><h3 id={id}>{children}</h3></div></div>;
}

function SubtypeFact({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="subtype-fact">{icon}<div><strong>{title}</strong><p>{children}</p></div></div>;
}

function getSubtypeId(categoryId: string, subtypeName: string) {
  const slug = subtypeName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${categoryId}-${slug}`;
}
