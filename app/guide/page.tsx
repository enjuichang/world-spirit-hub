import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText, Factory, GitCompareArrows, Tags } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { categories } from "../data";
import { getCategoryGuide, guideSources } from "../guideData";
import { GuideLegalNote } from "./GuideLegalNote";

export const metadata: Metadata = {
  title: "Spirit guide",
  description: "Eight dedicated guides to the production, branding terms, law, style and geography of the world's spirit families.",
};

export default function GuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="guide-page">
        <header className="page-hero compact">
          <Link className="back-link" href="/#explore"><ArrowLeft size={15} /> Back to the atlas</Link>
          <p className="eyebrow"><span /> Field guide</p>
          <h1>Eight families. Eight chapters of their own.</h1>
          <p>Choose a spirit family for its production chain, common bottle terms, protected regional names and style comparisons. Each chapter lives on a dedicated page, so you can read one subject at a time.</p>
        </header>

        <section className="guide-directory" aria-labelledby="guide-directory-title">
          <div className="guide-directory-heading">
            <div><p className="guide-label">Chapter index</p><h2 id="guide-directory-title">Choose a spirit family</h2></div>
            <p>Every page follows the same reading path: method, label language, geography, law and taste.</p>
          </div>
          <div className="guide-directory-grid">
            {categories.map((category, index) => {
              const guide = getCategoryGuide(category.id);
              if (!guide) return null;
              return (
                <Link className="guide-directory-card" href={`/guide/${category.id}`} key={category.id} style={{ "--category": category.color } as React.CSSProperties}>
                  <header><span>{String(index + 1).padStart(2, "0")}</span><i>{category.short}</i></header>
                  <h3>{category.name}</h3>
                  <p>{category.summary}</p>
                  <ul aria-label={`${category.name} chapter contents`}>
                    <li><Factory size={13} /> {guide.process.length}-step production story</li>
                    <li><BookOpenText size={13} /> {guide.brandingTerms.length} branding distinctions</li>
                    <li><Tags size={13} /> {guide.labelTerms.length} regional label terms</li>
                    <li><GitCompareArrows size={13} /> {guide.subtypes.length} styles to compare</li>
                  </ul>
                  <span className="directory-card-link">Open chapter <ArrowRight size={15} /></span>
                </Link>
              );
            })}
          </div>
        </section>

        <GuideLegalNote sources={guideSources} />
      </main>
      <SiteFooter />
    </>
  );
}
