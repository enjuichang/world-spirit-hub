"use client";

import Link from "next/link";
import { Compass, Martini } from "lucide-react";
import { useLocale } from "../i18n";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function SiteHeader() {
  const { t } = useLocale();

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label={`World Spirit Hub · ${t("common.backHome")}`}>
        <span className="brand-mark" aria-hidden="true">
          <Compass size={19} strokeWidth={1.6} />
        </span>
        <span>
          <span className="brand-name">World Spirit Hub</span>
          <span className="brand-kicker">{t("brand.kicker")}</span>
        </span>
      </Link>
      <nav className="site-nav" aria-label={t("nav.primary")}>
        <Link href="/#explore">{t("nav.explore")}</Link>
        <Link href="/guide">{t("nav.guide")}</Link>
        <Link href="/discover">{t("nav.discover")}</Link>
        <Link href="/bars">{t("nav.bars")}</Link>
        <Link href="/blog">{t("nav.journal")}</Link>
        <Link href="/about">{t("nav.about")}</Link>
      </nav>
      <div className="header-actions">
        <LocaleSwitcher />
        <Link className="header-cta" href="/discover">
          <Martini size={16} aria-hidden="true" />
          {t("nav.tasteProfile")}
        </Link>
      </div>
    </header>
  );
}
