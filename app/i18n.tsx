"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  defaultLocale,
  isLocale,
  type Locale,
  type MessageKey,
  resolveBrowserLocale,
  translate,
  type TranslationVariables,
  zhCategories,
  zhGuideOverviews,
  localizeTerm,
  localizeProperName,
  localizePlaceName,
} from "./locale-data";
import type { SpiritCategory } from "./data";

const STORAGE_KEY = "wsh-locale";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: MessageKey, variables?: TranslationVariables) => string;
  categoryName: (id: string, fallback: string) => string;
  categorySummary: (id: string, fallback: string) => string;
  categoryTaste: (id: string, fallback: string[]) => string[];
  category: (value: SpiritCategory) => SpiritCategory;
  term: (value: string) => string;
  properName: (value: string) => string;
  placeName: (value: string) => string;
  guideOverview: (categoryId: string, detail: string, process: string[]) => { detail: string; process: string[] };
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const preferredLocale = isLocale(saved) ? saved : resolveBrowserLocale(navigator.language);
    queueMicrotask(() => setLocaleState(preferredLocale));
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
  }, [locale]);

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);
    localStorage.setItem(STORAGE_KEY, nextLocale);
    document.cookie = `wsh-locale=${nextLocale}; Path=/; Max-Age=31536000; SameSite=Lax`;
  }

  const value = useMemo<LocaleContextValue>(() => ({
    locale,
    setLocale,
    t: (key, variables) => translate(locale, key, variables),
    categoryName: (id, fallback) => locale === "zh-TW" ? zhCategories[id]?.name ?? fallback : fallback,
    categorySummary: (id, fallback) => locale === "zh-TW" ? zhCategories[id]?.summary ?? fallback : fallback,
    categoryTaste: (id, fallback) => locale === "zh-TW" ? zhCategories[id]?.taste ?? fallback : fallback,
    category: (category) => locale === "zh-TW" && zhCategories[category.id]
      ? { ...category, ...zhCategories[category.id] }
      : category,
    term: (value) => localizeTerm(locale, value),
    properName: (value) => localizeProperName(locale, value),
    placeName: (value) => localizePlaceName(locale, value),
    guideOverview: (categoryId, detail, process) => locale === "zh-TW" && zhGuideOverviews[categoryId]
      ? zhGuideOverviews[categoryId]
      : { detail, process },
  }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) throw new Error("useLocale must be used within LocaleProvider");
  return context;
}

export function LocalizedText({
  message,
  variables,
}: {
  message: MessageKey;
  variables?: TranslationVariables;
}) {
  const { t } = useLocale();
  return <>{t(message, variables)}</>;
}

export function Bilingual({ en, zh }: { en: React.ReactNode; zh: React.ReactNode }) {
  const { locale } = useLocale();
  return <>{locale === "zh-TW" ? zh : en}</>;
}

export function LocalizedCategoryText({
  id,
  fallback,
  field,
}: {
  id: string;
  fallback: string;
  field: "name" | "summary";
}) {
  const { categoryName, categorySummary } = useLocale();
  return <>{field === "name" ? categoryName(id, fallback) : categorySummary(id, fallback)}</>;
}
