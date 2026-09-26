"use client";

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
import { blogPostSummaries } from "../blog/generated-post-summaries";
import { RelatedPostLinks } from "../blog/RelatedPostLinks";
import { Bilingual, useLocale } from "../i18n";

type CategoryGuideChapterProps = {
  category: SpiritCategory;
  guide: CategoryGuide;
  index: number;
  previous?: SpiritCategory;
  next?: SpiritCategory;
};

export function CategoryGuideChapter({ category, guide, index, previous, next }: CategoryGuideChapterProps) {
  const { locale, category: localizeCategory, term, guideOverview } = useLocale();
  const localizedCategory = localizeCategory(category);
  const localizedGuideOverview = guideOverview(category.id, guide.detail, guide.process);
  const mappedLabels = withLabelDistilleries(
    category.id,
    guide.labelTerms.flatMap((term) => term.region ? [term.region] : []),
  );
  const categoryLocations = locations.filter((location) => location.categoryId === category.id);
  const progression = categoryProgressions[category.id] ?? [];
  const minimumMapRegion = category.id === "rum" ? "caribbean" as const : undefined;
  const relatedPosts = blogPostSummaries.filter((post) => post.spiritId === category.id);

  return (
    <>
      <header className="page-hero compact guide-chapter-hero" style={{ "--category": category.color } as React.CSSProperties}>
        <Link className="back-link" href="/guide"><ArrowLeft size={15} /> <Bilingual en="All spirit families" zh="所有烈酒家族" /></Link>
        <p className="eyebrow"><span /> <Bilingual en="Field guide" zh="風土指南" /> · <Bilingual en="Chapter" zh="第" /> {String(index + 1).padStart(2, "0")} <Bilingual en="" zh="章" /></p>
        <h1>{localizedCategory.name}</h1>
        <p>{localizedCategory.summary}</p>
        <nav className="guide-jump" aria-label={locale === "zh-TW" ? "烈酒家族章節" : "Spirit family chapters"}>
          <Link href="/guide"><Bilingual en="All chapters" zh="所有章節" /></Link>
          <span aria-hidden="true" />
          <strong>{category.short} · <Bilingual en="Current chapter" zh="目前章節" /></strong>
        </nav>
      </header>

      <div className="guide-entries">
        <article className="guide-entry guide-chapter-entry" style={{ "--category": category.color } as React.CSSProperties}>
          <div className="guide-index"><span>{String(index + 1).padStart(2, "0")}</span><i /></div>
          <div className="guide-main">
            <p className="guide-label">{category.short} · <Bilingual en="Spirit family" zh="烈酒家族" /></p>
            <h2><Bilingual en="Read the category" zh="讀懂這個類別" /></h2>
            <p className="guide-summary">{localizedGuideOverview.detail}</p>
            <div className="guide-taste-row">{localizedCategory.taste.map((taste) => <span key={taste}>{taste}</span>)}</div>

            <section className="production-story" id="production" aria-labelledby={`${category.id}-production`}>
              <GuideTitle icon={<Factory />} kicker={<Bilingual en="Production infographic" zh="製程圖解" />} id={`${category.id}-production`}><Bilingual en="How it becomes spirit" zh="它如何成為烈酒" /></GuideTitle>
              <ol className="process-flow">
                {localizedGuideOverview.process.map((step, stepIndex) => (
                  <li key={step}><span>{String(stepIndex + 1).padStart(2, "0")}</span><strong>{step}</strong>{stepIndex < localizedGuideOverview.process.length - 1 && <ArrowRight aria-hidden="true" />}</li>
                ))}
              </ol>
              <p>{localizedCategory.production}</p>
            </section>

            <section className="branding-terms" id="branding-terms" aria-labelledby={`${category.id}-branding`}>
              <GuideTitle icon={<BookOpenText />} kicker={<Bilingual en={`${guide.brandingTerms.length} common distinctions`} zh={`${guide.brandingTerms.length} 組常見用語辨析`} />} id={`${category.id}-branding`}><Bilingual en="Common terms on the bottle" zh="酒瓶上的常見用語" /></GuideTitle>
              <p className="branding-intro"><Bilingual en="Brand language can describe law, method or simply a producer's positioning. These side-by-side definitions show what the familiar wording does—and does not—promise." zh="品牌用語可能描述法規、製法，也可能只是生產者的市場定位。並列定義能說明熟悉的字眼究竟承諾了什麼，又沒有承諾什麼。" /></p>
              <div className="branding-term-grid">
                {guide.brandingTerms.map((item) => (
                  <article className="branding-term-card" key={`${item.term}-${item.contrast}`}>
                    <header><strong>{item.term}</strong><span>vs</span><strong>{item.contrast}</strong></header>
                    <p>{item.meaning}</p>
                    <footer><span><Bilingual en="Read the label" zh="閱讀酒標" /></span>{item.labelCue}</footer>
                  </article>
                ))}
              </div>
            </section>

            <section className="label-atlas" id="regional-labels" aria-labelledby={`${category.id}-labels`}>
              <GuideTitle icon={<Tag />} kicker={<Bilingual en="Bottle vocabulary" zh="酒瓶詞彙" />} id={`${category.id}-labels`}><Bilingual en="Regional names found on labels" zh="酒標上的產區名稱" /></GuideTitle>
              <div className="label-atlas-grid">
                <div className="label-term-list">
                  {guide.labelTerms.map((labelTerm) => <article key={labelTerm.term}><span>{term(labelTerm.place)}</span><h4>{term(labelTerm.term)}</h4><p>{labelTerm.meaning}</p></article>)}
                </div>
                {mappedLabels.length > 0 && <RegionMap regions={mappedLabels} label={locale === "zh-TW" ? `${localizedCategory.name}生產地區` : `${category.name} production regions`} minimumRegion={minimumMapRegion} />}
              </div>
            </section>

            <section className="subtype-section" id="styles" aria-labelledby={`${category.id}-subtypes`}>
              <GuideTitle icon={<Sparkles />} kicker={<Bilingual en={`${guide.subtypes.length} styles decoded`} zh={`解讀 ${guide.subtypes.length} 種風格`} />} id={`${category.id}-subtypes`}><Bilingual en="Subtype field cards" zh="子類型風土卡" /></GuideTitle>
              <div className="subtype-card-grid">
                {guide.subtypes.map((subtype) => {
                  const classification = getSubtypeClassification(category.id, subtype.name);
                  const example = classification
                    ? categoryLocations.find((location) => location.id === classification.distilleryId)
                    : undefined;
                  const mappedRegion = subtype.region && example
                    ? { ...subtype.region, distillery: { name: example.name, point: example.coordinates } }
                    : subtype.region;
                  const subtypeMinimumRegion = mappedRegion?.name === "Scandinavia" ? "europe" as const : minimumMapRegion;

                  return (
                    <article className="subtype-card" key={subtype.name}>
                      <header><h4>{term(subtype.name)}</h4><span className={`law-status ${subtype.lawStatus.toLowerCase().replaceAll(" ", "-")}`}>{term(subtype.lawStatus)}</span></header>
                      {classification && <SubtypeFact icon={<Fingerprint />} title={locale === "zh-TW" ? "獨立分類" : "Distinct classification"}>{classification.definition}</SubtypeFact>}
                      <SubtypeFact icon={<Scale />} title={locale === "zh-TW" ? "法規" : "The law"}>{subtype.law}</SubtypeFact>
                      <SubtypeFact icon={<Sparkles />} title={locale === "zh-TW" ? "代表風格" : "Signature style"}>{subtype.style}</SubtypeFact>
                      {example && <SubtypeFact icon={<Factory />} title={locale === "zh-TW" ? "酒廠實例" : "Distillery example"}><strong className="subtype-example-name">{example.name}</strong>{term(example.place)}, {term(example.country)}. {example.descriptor}.</SubtypeFact>}
                      {mappedRegion && <div className="subtype-map-wrap"><RegionMap regions={[mappedRegion]} label={locale === "zh-TW" ? `${term(subtype.name)}分布` : `${subtype.name} distribution`} compact minimumRegion={subtypeMinimumRegion} frameLabel={mappedRegion.name === "Scandinavia" ? (locale === "zh-TW" ? "歐洲" : "Europe") : undefined} /></div>}
                      <a className="subtype-explore-link" href={`#${getSubtypeTargetId(category.id, subtype.name)}`}><Bilingual en="Explore regions & ingredients" zh="探索產區與原料" /> <ArrowRight size={13} /></a>
                    </article>
                  );
                })}
              </div>
            </section>

            <SubtypeDeepDive categoryId={category.id} subtypes={guide.subtypes} />
            {!!progression.length && <CategoryProgression categoryName={localizedCategory.name} steps={progression} />}
            <div id="compare"><SubtypeComparison categoryId={category.id} categoryName={localizedCategory.name} subtypes={guide.subtypes} /></div>
            <CategoryDistilleryAtlas categoryName={localizedCategory.name} locations={categoryLocations} />
            <RelatedPostLinks posts={relatedPosts} heading={locale === "zh-TW" ? `與${localizedCategory.name}相關的故事` : `Stories connected to ${category.name}`} />
          </div>

          <ChapterNavigator
            sections={[
              { href: "#production", label: locale === "zh-TW" ? "如何製成" : "How it's made" },
              { href: "#branding-terms", label: locale === "zh-TW" ? "常見酒瓶用語" : "Common bottle terms" },
              { href: "#regional-labels", label: locale === "zh-TW" ? "產區酒標名稱" : "Regional label names" },
              { href: "#styles", label: locale === "zh-TW" ? "子類型風土卡" : "Subtype field cards" },
              { href: "#learning-path", label: locale === "zh-TW" ? "從入門到進階" : "Intro to advanced" },
              { href: "#compare", label: locale === "zh-TW" ? "比較風格" : "Compare styles" },
              { href: "#distilleries", label: locale === "zh-TW" ? "酒廠地圖" : "Distillery map" },
            ]}
            subtypes={guide.subtypes.map((subtype) => ({ href: `#${getSubtypeTargetId(category.id, subtype.name)}`, label: subtype.name }))}
            sourceUrl={category.sourceUrl}
          />
        </article>
      </div>

      <nav className="chapter-pagination" aria-label={locale === "zh-TW" ? "相鄰烈酒家族章節" : "Adjacent spirit family chapters"}>
        {previous ? <Link href={`/guide/${previous.id}`}><ArrowLeft size={16} /><span><small><Bilingual en="Previous chapter" zh="上一章" /></small>{localizeCategory(previous).name}</span></Link> : <span />}
        {next ? <Link href={`/guide/${next.id}`}><span><small><Bilingual en="Next chapter" zh="下一章" /></small>{localizeCategory(next).name}</span><ArrowRight size={16} /></Link> : <Link href="/guide"><span><small><Bilingual en="Return to" zh="返回" /></small><Bilingual en="All spirit families" zh="所有烈酒家族" /></span><ArrowRight size={16} /></Link>}
      </nav>
    </>
  );
}

function GuideTitle({ icon, kicker, id, children }: { icon: React.ReactNode; kicker: React.ReactNode; id: string; children: React.ReactNode }) {
  return <div className="guide-section-title">{icon}<div><span>{kicker}</span><h3 id={id}>{children}</h3></div></div>;
}

function SubtypeFact({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <div className="subtype-fact">{icon}<div><strong>{title}</strong><p>{children}</p></div></div>;
}
