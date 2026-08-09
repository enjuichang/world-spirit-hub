import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, BookOpen, MapPin } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { categories, locations } from "../data";

export const metadata: Metadata = {
  title: "Spirit guide",
  description:
    "A field guide to whisky, brandy, rum, agave spirits, gin, vodka, Asian grain spirits and liqueurs.",
};

export default function GuidePage() {
  return (
    <>
      <SiteHeader />
      <main className="guide-page">
        <header className="page-hero compact">
          <Link className="back-link" href="/#explore">
            <ArrowLeft size={15} /> Back to the atlas
          </Link>
          <p className="eyebrow">
            <span /> Field guide
          </p>
          <h1>Eight families. Hundreds of ways to make a spirit.</h1>
          <p>
            Start with the category, then read across production, taste, law,
            history and price. Protected names are explained in their own
            jurisdiction—not flattened into universal rules.
          </p>
          <nav className="guide-jump" aria-label="Jump to a spirit family">
            {categories.map((category) => (
              <a key={category.id} href={`#${category.id}`}>
                <i style={{ backgroundColor: category.color }} />
                {category.name}
              </a>
            ))}
          </nav>
        </header>

        <div className="guide-entries">
          {categories.map((category, index) => {
            const related = locations.filter(
              (location) => location.categoryId === category.id,
            );
            return (
              <article
                className="guide-entry"
                id={category.id}
                key={category.id}
                style={{ "--category": category.color } as React.CSSProperties}
              >
                <div className="guide-index">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <i />
                </div>
                <div className="guide-main">
                  <p className="guide-label">{category.short} · Spirit family</p>
                  <h2>{category.name}</h2>
                  <p className="guide-summary">{category.summary}</p>

                  <div className="guide-taste-row">
                    {category.taste.map((taste) => (
                      <span key={taste}>{taste}</span>
                    ))}
                  </div>

                  <div className="guide-facts">
                    <section>
                      <h3>Production & style</h3>
                      <p>{category.production}</p>
                    </section>
                    <section>
                      <h3>Law & labels</h3>
                      <p>{category.law}</p>
                    </section>
                    <section>
                      <h3>History in brief</h3>
                      <p>{category.history}</p>
                    </section>
                    <section>
                      <h3>What moves price</h3>
                      <p>{category.price}</p>
                    </section>
                  </div>
                </div>
                <aside className="guide-aside">
                  <div>
                    <h3>Styles to know</h3>
                    <ul>
                      {category.subcategories.map((subcategory) => (
                        <li key={subcategory}>{subcategory}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3>Atlas landmarks</h3>
                    <ul className="landmark-list">
                      {related.map((location) => (
                        <li key={location.id}>
                          <MapPin size={13} aria-hidden="true" />
                          <span>
                            {location.name}
                            <small>{location.place}</small>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a
                    className="source-link"
                    href={category.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <BookOpen size={15} /> Primary study reference
                    <ArrowUpRight size={14} />
                  </a>
                </aside>
              </article>
            );
          })}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

