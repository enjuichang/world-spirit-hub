"use client";

import Link from "next/link";
import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "../i18n";
import type { BlogLanguage } from "./types";

type ArticleVersion = {
  language: BlogLanguage;
  slug: string;
};

export function ArticleLanguageControl({
  currentLanguage,
  versions,
}: {
  currentLanguage: BlogLanguage;
  versions: ArticleVersion[];
}) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const preferredVersion = versions.find((version) => version.language === locale);

  useEffect(() => {
    if (!preferredVersion || preferredVersion.language === currentLanguage) return;
    const timer = window.setTimeout(() => {
      router.replace(`/blog/${preferredVersion.slug}`);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [currentLanguage, preferredVersion, router]);

  if (versions.length < 2) return null;

  return (
    <nav className="article-language-control" aria-label={currentLanguage === "zh-TW" ? "文章語言" : "Article language"}>
      <Languages size={15} aria-hidden="true" />
      <span>{currentLanguage === "zh-TW" ? "閱讀語言" : "Read in"}</span>
      {versions.map((version) => (
        <Link
          href={`/blog/${version.slug}`}
          hrefLang={version.language}
          aria-current={version.language === currentLanguage ? "page" : undefined}
          key={version.language}
          onClick={() => setLocale(version.language)}
        >
          {version.language === "zh-TW" ? "繁體中文" : "English"}
        </Link>
      ))}
    </nav>
  );
}
