import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { categories, locations } from "../../data";
import { MarkdownArticle } from "../MarkdownArticle";
import { blogPosts, formatPostDate, getBlogPost } from "../posts";
import { ArticleLanguageControl } from "../ArticleLanguageControl";
import { PostConnectionProfiles } from "../PostConnectionProfiles";

type BlogPostPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = getBlogPost((await params).slug);
  if (!post) return {};
  const translations = post.translationKey
    ? blogPosts.filter((candidate) => candidate.translationKey === post.translationKey)
    : [post];
  return {
    title: post.title,
    description: post.description,
    other: { "content-language": post.language },
    alternates: {
      canonical: `/blog/${post.slug}`,
      languages: Object.fromEntries(
        translations.map((translation) => [translation.language, `/blog/${translation.slug}`]),
      ),
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = getBlogPost((await params).slug);
  if (!post) notFound();
  const spirit = categories.find((category) => category.id === post.spiritId);
  const distilleries = post.distilleryIds
    .map((id) => locations.find((location) => location.id === id))
    .filter((location) => location !== undefined);
  const translations = (post.translationKey
    ? blogPosts.filter((candidate) => candidate.translationKey === post.translationKey)
    : [post]
  ).map((translation) => ({ language: translation.language, slug: translation.slug }));

  return (
    <>
      <SiteHeader />
      <main className="post-page" lang={post.language} style={{ "--post-accent": spirit?.color ?? "var(--accent)" } as React.CSSProperties}>
        <header className="post-hero">
          <Link className="back-link" href={`/blog?language=${post.language}`} hrefLang={post.language}>
            <ArrowLeft size={15} /> {post.language === "zh-TW" ? "所有文章" : "All stories"}
          </Link>
          <div className="post-meta">
            <span>{post.language === "zh-TW" ? "繁體中文" : "English"}</span>
            <span aria-hidden="true">/</span>
            <time dateTime={post.date}>{formatPostDate(post.date, post.language)}</time>
            <span aria-hidden="true">/</span>
            <span>{post.author ?? "World Spirit Hub"}</span>
          </div>
          <ArticleLanguageControl currentLanguage={post.language} versions={translations} />
          <h1>{post.title}</h1>
          <p className="post-deck">{post.description}</p>
          {post.tags.length > 0 && (
            <ul className="post-tags" aria-label={post.language === "zh-TW" ? "文章主題" : "Article topics"}>
              {post.tags.map((tag) => <li key={tag}>{tag}</li>)}
            </ul>
          )}

        </header>

        <PostConnectionProfiles spirit={spirit} distilleries={distilleries} language={post.language} />

        <article className="post-body">
          <MarkdownArticle source={post.body} language={post.language} />
        </article>

        <nav className="post-end-nav" aria-label={post.language === "zh-TW" ? "專欄導覽" : "Journal navigation"}>
          <Compass aria-hidden="true" />
          <div><span>{post.language === "zh-TW" ? "繼續閱讀" : "Keep reading"}</span><strong>{post.language === "zh-TW" ? "更多地圖筆記" : "More notes from the atlas"}</strong></div>
          <Link href={`/blog?language=${post.language}`} hrefLang={post.language}>
            {post.language === "zh-TW" ? "瀏覽專欄" : "Browse the journal"} <ArrowRight size={15} />
          </Link>
        </nav>
      </main>
      <SiteFooter />
    </>
  );
}
