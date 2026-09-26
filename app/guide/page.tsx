import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenText, Factory, GitCompareArrows, Tags } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { categories } from "../data";
import { getCategoryGuide, guideSources } from "../guideData";
import { GuideLegalNote } from "./GuideLegalNote";
import { Bilingual, LocalizedCategoryText } from "../i18n";

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
          <Link className="back-link" href="/#explore"><ArrowLeft size={15} /> <Bilingual en="Back to the atlas" zh="返回地圖" /></Link>
          <p className="eyebrow"><span /> <Bilingual en="Field guide" zh="風土指南" /></p>
          <h1><Bilingual en="Eight families. Eight chapters of their own." zh="八個烈酒家族，各有專屬篇章。" /></h1>
          <p><Bilingual en="Choose a spirit family for its production chain, common bottle terms, protected regional names and style comparisons. Each chapter lives on a dedicated page, so you can read one subject at a time." zh="選擇一個烈酒家族，了解其製程、常見酒標用語、受保護的地名與風格比較。每個章節都有獨立頁面，讓你一次專注一個主題。" /></p>
        </header>

        <section className="guide-directory" aria-labelledby="guide-directory-title">
          <div className="guide-directory-heading">
            <div><p className="guide-label"><Bilingual en="Chapter index" zh="章節索引" /></p><h2 id="guide-directory-title"><Bilingual en="Choose a spirit family" zh="選擇烈酒家族" /></h2></div>
            <p><Bilingual en="Every page follows the same reading path: method, label language, geography, law and taste." zh="每頁都依循同一閱讀路徑：製法、酒標語言、地理、法規與風味。" /></p>
          </div>
          <div className="guide-directory-grid">
            {categories.map((category, index) => {
              const guide = getCategoryGuide(category.id);
              if (!guide) return null;
              return (
                <Link className="guide-directory-card" href={`/guide/${category.id}`} key={category.id} style={{ "--category": category.color } as React.CSSProperties}>
                  <header><span>{String(index + 1).padStart(2, "0")}</span><i>{category.short}</i></header>
                  <h3><LocalizedCategoryText id={category.id} field="name" fallback={category.name} /></h3>
                  <p><LocalizedCategoryText id={category.id} field="summary" fallback={category.summary} /></p>
                  <ul aria-label={`${category.name} chapter contents`}>
                    <li><Factory size={13} /> <Bilingual en={`${guide.process.length}-step production story`} zh={`${guide.process.length} 步製程故事`} /></li>
                    <li><BookOpenText size={13} /> <Bilingual en={`${guide.brandingTerms.length} branding distinctions`} zh={`${guide.brandingTerms.length} 組品牌用語辨析`} /></li>
                    <li><Tags size={13} /> <Bilingual en={`${guide.labelTerms.length} regional label terms`} zh={`${guide.labelTerms.length} 個產區酒標用語`} /></li>
                    <li><GitCompareArrows size={13} /> <Bilingual en={`${guide.subtypes.length} styles to compare`} zh={`${guide.subtypes.length} 種風格比較`} /></li>
                  </ul>
                  <span className="directory-card-link"><Bilingual en="Open chapter" zh="開啟章節" /> <ArrowRight size={15} /></span>
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
