"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLocale } from "../i18n";
import type { BlogLanguage } from "./types";

const options: { value: BlogLanguage; label: string }[] = [
  { value: "en-US", label: "English" },
  { value: "zh-TW", label: "繁體中文" },
];

export function BlogLanguageFilter({
  counts,
  totalCount,
  selectedLanguage,
  showAll,
}: {
  counts: Record<BlogLanguage, number>;
  totalCount: number;
  selectedLanguage?: BlogLanguage;
  showAll: boolean;
}) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();

  useEffect(() => {
    if (showAll || selectedLanguage === locale) return;
    const timer = window.setTimeout(() => {
      router.replace(`/blog?language=${locale}`, { scroll: false });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [locale, router, selectedLanguage, showAll]);

  return (
    <nav className="blog-language-filter" aria-label={locale === "zh-TW" ? "依語言篩選專欄" : "Filter journal by language"}>
      <Link href="/blog?language=all" aria-current={showAll ? "page" : undefined}>
        {locale === "zh-TW" ? "全部" : "All"} <span>{totalCount}</span>
      </Link>
      {options.map((option) => (
        <Link
          href={`/blog?language=${option.value}`}
          aria-current={selectedLanguage === option.value ? "page" : undefined}
          hrefLang={option.value}
          key={option.value}
          onClick={() => setLocale(option.value)}
        >
          {option.label} <span>{counts[option.value]}</span>
        </Link>
      ))}
    </nav>
  );
}
