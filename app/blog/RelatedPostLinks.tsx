"use client";

import Link from "next/link";
import { ArrowRight, BookOpenText } from "lucide-react";
import { useMemo } from "react";
import { useLocale } from "../i18n";
import type { BlogPostSummary } from "./types";

export function RelatedPostLinks({
  posts,
  heading,
  compact = false,
}: {
  posts: BlogPostSummary[];
  heading: string;
  compact?: boolean;
}) {
  const { locale } = useLocale();
  const visiblePosts = useMemo(() => {
    const groups = new Map<string, BlogPostSummary[]>();
    for (const post of posts) {
      const key = post.translationKey ?? post.slug;
      groups.set(key, [...(groups.get(key) ?? []), post]);
    }
    return [...groups.values()].map(
      (group) => group.find((post) => post.language === locale) ?? group[0],
    );
  }, [locale, posts]);

  if (!visiblePosts.length) return null;

  return (
    <section className={`related-posts${compact ? " compact" : ""}`} aria-label={heading}>
      <header>
        <BookOpenText aria-hidden="true" />
        <div><span>{locale === "zh-TW" ? "來自專欄" : "From the journal"}</span><h3>{heading}</h3></div>
      </header>
      <div className="related-post-list">
        {visiblePosts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug}>
            <span>{post.title}</span>
            <small>{post.description}</small>
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
