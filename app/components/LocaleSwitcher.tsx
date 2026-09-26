"use client";

import { Languages } from "lucide-react";
import { useLocale } from "../i18n";

export function LocaleSwitcher({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className={`locale-switcher${compact ? " compact" : ""}`} role="group" aria-label={t("locale.label")}>
      <Languages size={15} aria-hidden="true" />
      <button
        type="button"
        className={locale === "en-US" ? "active" : ""}
        onClick={() => setLocale("en-US")}
        aria-pressed={locale === "en-US"}
        title={t("locale.english")}
      >
        EN
      </button>
      <span aria-hidden="true">/</span>
      <button
        type="button"
        className={locale === "zh-TW" ? "active" : ""}
        onClick={() => setLocale("zh-TW")}
        aria-pressed={locale === "zh-TW"}
        title={t("locale.chinese")}
      >
        繁中
      </button>
    </div>
  );
}
