"use client";

import { ArrowRight, ArrowUpRight, BookOpen } from "lucide-react";
import { useEffect, useState } from "react";

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
        <span>In this chapter</span>
        <i aria-hidden="true" />
      </button>
      <div className="guide-aside-panel" id="guide-chapter-navigation" hidden={!isExpanded}>
        <div>
          <h3>Chapter sections</h3>
          <ul className="chapter-links">
            {sections.map((item) => <ChapterLink {...item} key={item.href} />)}
          </ul>
        </div>
        <div>
          <h3>Explore each subtype</h3>
          <ul className="chapter-links subtype-chapter-links">
            {subtypes.map((item) => <ChapterLink {...item} key={item.href} />)}
          </ul>
        </div>
        <div>
          <h3>How to read the cards</h3>
          <p className="aside-note">“Protected origin” ties a name to place. “Defined style” sets production rules without necessarily defining one place. “Traditional term” is recognized usage; “broad style” is a useful description, not one universal law.</p>
        </div>
        <a className="source-link" href={sourceUrl} target="_blank" rel="noreferrer"><BookOpen size={15} /> Primary study reference <ArrowUpRight size={14} /></a>
      </div>
    </aside>
  );
}

function ChapterLink({ href, label }: ChapterNavItem) {
  return <li><a href={href}><span>{label}</span><ArrowRight size={13} aria-hidden="true" /></a></li>;
}
