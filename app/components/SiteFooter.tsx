"use client";

import Link from "next/link";
import { useLocale } from "../i18n";

export function SiteFooter() {
  const { t } = useLocale();

  return (
    <footer className="site-footer">
      <div>
        <p className="footer-brand">World Spirit Hub</p>
        <p className="footer-note">
          {t("footer.note")}
        </p>
      </div>
      <div className="footer-links">
        <Link href="/guide">{t("nav.guide")}</Link>
        <Link href="/blog">{t("nav.journal")}</Link>
        <Link href="/about#sources">{t("footer.sources")}</Link>
        <Link href="/about#corrections">{t("footer.corrections")}</Link>
      </div>
      <p className="footer-meta">{t("footer.meta")}</p>
    </footer>
  );
}
