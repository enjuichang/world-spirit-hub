"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { useMemo } from "react";
import { Bilingual, useLocale } from "../i18n";
import type { BlogLanguage, BlogPostSummary } from "./types";

export type BlogIndexPost = BlogPostSummary & {
  accent: string;
  connectionLabel?: string;
};

function formatDate(date: string, language: BlogLanguage) {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

function uniqueStories(posts: BlogIndexPost[], preferredLanguage: BlogLanguage) {
  const groups = new Map<string, BlogIndexPost[]>();
  for (const post of posts) {
    const key = post.translationKey ?? post.slug;
    groups.set(key, [...(groups.get(key) ?? []), post]);
  }

  return [...groups.values()].map(
    (versions) => versions.find((post) => post.language === preferredLanguage)
      ?? versions.find((post) => post.language === "en-US")
      ?? versions[0],
  );
}

export function BlogPostGrid({
  posts,
  selectedLanguage,
  showAll,
}: {
  posts: BlogIndexPost[];
  selectedLanguage?: BlogLanguage;
  showAll: boolean;
}) {
  const { locale } = useLocale();
  const visiblePosts = useMemo(() => {
    if (selectedLanguage) return posts.filter((post) => post.language === selectedLanguage);
    if (showAll) return uniqueStories(posts, locale ?? "en-US");
    return posts.filter((post) => post.language === (locale ?? "en-US"));
  }, [locale, posts, selectedLanguage, showAll]);

  if (!visiblePosts.length) {
    const missingLanguage = selectedLanguage ?? locale ?? "en-US";
    return (
      <div className="blog-empty">
        <BookOpenText />
        <h3>
          <Bilingual
            en={`No ${missingLanguage === "zh-TW" ? "Traditional Chinese" : "English"} stories yet.`}
            zh={`目前沒有${missingLanguage === "zh-TW" ? "繁體中文" : "英文"}文章。`}
          />
        </h3>
        <p><Bilingual en={<>Add a Markdown file with <code>language: {missingLanguage}</code> to publish it here.</>} zh={<>加入含有 <code>language: {missingLanguage}</code> 的 Markdown 檔案，即可在此發布。</>} /></p>
      </div>
    );
  }

  return (
    <div className="post-grid">
      {visiblePosts.map((post, index) => (
        <article
          className="post-card"
          key={post.slug}
          lang={post.language}
          style={{ "--post-accent": post.accent } as React.CSSProperties}
        >
          <div className="post-card-topline">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <div>
              <span className="post-language">{post.language === "zh-TW" ? "繁體中文" : "English"}</span>
              <time dateTime={post.date}>{formatDate(post.date, post.language)}</time>
            </div>
          </div>
          {post.connectionLabel && <span className="post-spirit-label">{post.connectionLabel}</span>}
          <h3><Link href={`/blog/${post.slug}`} hrefLang={post.language}>{post.title}</Link></h3>
          <p>{post.description}</p>
          <div className="post-card-footer">
            <span>{post.author ?? "World Spirit Hub"}</span>
            <Link href={`/blog/${post.slug}`} hrefLang={post.language} aria-label={locale === "zh-TW" ? `閱讀${post.title}` : `Read ${post.title}`}>
              <Bilingual en="Read story" zh="閱讀文章" /> <ArrowRight size={15} />
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
