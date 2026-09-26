import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { categories, locations } from "../data";
import { blogPostSummaries } from "./posts";
import type { BlogLanguage } from "./types";
import { BlogLanguageFilter } from "./BlogLanguageFilter";
import { Bilingual } from "../i18n";
import { BlogPostGrid, type BlogIndexPost } from "./BlogPostGrid";

export const metadata: Metadata = {
  title: "Journal",
  description: "Field notes, stories and practical ways to understand the world of spirits.",
};

type BlogPageProps = { searchParams: Promise<{ language?: string }> };

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const requestedLanguage = (await searchParams).language;
  const selectedLanguage = (["en-US", "zh-TW"] as const).some((language) => language === requestedLanguage)
    ? requestedLanguage as BlogLanguage
    : undefined;
  const showAll = requestedLanguage === "all";
  const languageCounts = {
    "en-US": blogPostSummaries.filter((post) => post.language === "en-US").length,
    "zh-TW": blogPostSummaries.filter((post) => post.language === "zh-TW").length,
  };
  const uniqueStoryCount = new Set(
    blogPostSummaries.map((post) => post.translationKey ?? post.slug),
  ).size;
  const indexPosts: BlogIndexPost[] = blogPostSummaries.map((post) => {
    const spirit = categories.find((category) => category.id === post.spiritId);
    const distilleries = post.distilleryIds
      .map((id) => locations.find((location) => location.id === id))
      .filter((location) => location !== undefined);
    return {
      ...post,
      accent: spirit?.color ?? "var(--accent)",
      connectionLabel: distilleries.length > 0
        ? `${distilleries[0].name}${distilleries.length > 1 ? ` +${distilleries.length - 1}` : ""}`
        : spirit ? `${spirit.short} · ${spirit.name}` : undefined,
    };
  });

  return (
    <>
      <SiteHeader />
      <main className="blog-page">
        <header className="blog-index-hero">
          <Link className="back-link" href="/">
            <ArrowLeft size={15} /> <Bilingual en="Back home" zh="返回首頁" />
          </Link>
          <div className="blog-hero-grid">
            <div>
              <p className="eyebrow"><span /> <Bilingual en="The journal" zh="烈酒專欄" /></p>
              <h1><Bilingual en="Stories from inside the bottle." zh="來自酒瓶裡的故事。" /></h1>
            </div>
            <p>
              <Bilingual en="Field notes on production, place, labels and the people behind the world’s spirits—connected to the atlas when the story calls for it." zh="記錄世界烈酒背後的製程、地方、酒標與人物；故事需要時，也會與地圖彼此連結。" />
            </p>
          </div>
        </header>

        <section className="blog-index" aria-labelledby="latest-stories">
          <div className="blog-index-heading">
            <p className="eyebrow"><span /> <Bilingual en="Latest entries" zh="最新文章" /></p>
            <h2 id="latest-stories"><Bilingual en="Read the journal" zh="閱讀專欄" /></h2>
          </div>
          <BlogLanguageFilter
            counts={languageCounts}
            totalCount={uniqueStoryCount}
            selectedLanguage={selectedLanguage}
            showAll={showAll}
          />
          <BlogPostGrid posts={indexPosts} selectedLanguage={selectedLanguage} showAll={showAll} />
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
