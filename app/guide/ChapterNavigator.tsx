"use client";

import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { Bilingual, useLocale } from "../i18n";

type ChapterNavItem = {
  href: string;
  label: string;
};

export function ChapterNavigator({
  sections,
  subtypes,
  sourceUrl,
}: {
  sections: ChapterNavItem[];
  subtypes: ChapterNavItem[];
  sourceUrl: string;
}) {
  const { term } = useLocale();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isPinnedOpen, setIsPinnedOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    function readScrollPosition() {
      const nextHasScrolled = window.scrollY > 24;
      setHasScrolled(nextHasScrolled);
      if (nextHasScrolled) setIsPinnedOpen(false);
    }

    readScrollPosition();
    window.addEventListener("scroll", readScrollPosition, { passive: true });
    return () => window.removeEventListener("scroll", readScrollPosition);
  }, []);

  const isExpanded = !hasScrolled || isPinnedOpen || isHovered || hasFocus;

  return (
    <aside
      className={`guide-aside ${hasScrolled ? "is-condensed" : "is-initial"} ${isExpanded ? "is-expanded" : "is-collapsed"}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocusCapture={() => setHasFocus(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHasFocus(false);
      }}
    >
      <button
        className="guide-aside-toggle"
        type="button"
        aria-expanded={isExpanded}
        aria-controls="guide-chapter-navigation"
        onClick={() => {
          if (hasScrolled) setIsPinnedOpen((open) => !open);
        }}
      >
        <BookOpen size={15} />
        <span><Bilingual en="In this chapter" zh="本章內容" /></span>
        <i aria-hidden="true" />
      </button>
      <div className="guide-aside-panel" id="guide-chapter-navigation" hidden={!isExpanded}>
        <div>
          <h3><Bilingual en="Chapter sections" zh="章節段落" /></h3>
          <ul className="chapter-links">
            {sections.map((item) => <ChapterLink {...item} key={item.href} />)}
          </ul>
        </div>
        <div>
          <h3><Bilingual en="Explore each subtype" zh="探索各子類型" /></h3>
          <ul className="chapter-links subtype-chapter-links">
            {subtypes.map((item) => <ChapterLink {...item} label={term(item.label)} key={item.href} />)}
          </ul>
        </div>
        <div>
          <h3><Bilingual en="How to read the cards" zh="如何閱讀卡片" /></h3>
          <p className="aside-note"><Bilingual en="“Protected origin” ties a name to place. “Defined style” sets production rules without necessarily defining one place. “Traditional term” is recognized usage; “broad style” is a useful description, not one universal law." zh="「受保護產地」把名稱與地方綁定；「法定風格」規定製程，但不一定限定單一產地；「傳統用語」是公認用法；「廣義風格」是有用的描述，而非全球一致法規。" /></p>
        </div>
        <a className="source-link" href={sourceUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /> <Bilingual en="Primary study reference" zh="主要研讀來源" /> <ArrowUpRight size={14} /></a>
      </div>
    </aside>
  );
}

function ChapterLink({ href, label }: ChapterNavItem) {
  return <li><a href={href}><span>{label}</span><ArrowRight size={13} aria-hidden="true" /></a></li>;
}
