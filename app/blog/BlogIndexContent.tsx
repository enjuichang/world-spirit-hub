"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import type { BlogLanguage } from "./types";
import { BlogLanguageFilter } from "./BlogLanguageFilter";
import { BlogPostGrid, type BlogIndexPost } from "./BlogPostGrid";

type BlogIndexContentProps = {
  counts: Record<BlogLanguage, number>;
  totalCount: number;
  posts: BlogIndexPost[];
};

function QueryAwareBlogIndex({ counts, totalCount, posts }: BlogIndexContentProps) {
  const searchParams = useSearchParams();
  const requestedLanguage = searchParams.get("language");
  const selectedLanguage = (requestedLanguage === "en-US" || requestedLanguage === "zh-TW")
    ? requestedLanguage
    : undefined;
  const showAll = requestedLanguage === "all";

  return (
    <>
      <BlogLanguageFilter
        counts={counts}
        totalCount={totalCount}
        selectedLanguage={selectedLanguage}
        showAll={showAll}
      />
      <BlogPostGrid posts={posts} selectedLanguage={selectedLanguage} showAll={showAll} />
    </>
  );
}

export function BlogIndexContent(props: BlogIndexContentProps) {
  return (
    <Suspense fallback={<BlogPostGrid posts={props.posts} showAll />}>
      <QueryAwareBlogIndex {...props} />
    </Suspense>
  );
}
