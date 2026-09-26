import Link from "next/link";
import {
  ArrowRight,
  BookOpenText,
  Compass,
  FlaskConical,
  MapPinned,
  ScanSearch,
} from "lucide-react";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { categories, getLocation } from "./data";
import { SpiritExplorer } from "./SpiritExplorer";
import { LocalizedCategoryText, LocalizedText } from "./i18n";

type HomeProps = { searchParams: Promise<{ distillery?: string }> };

export default async function Home({ searchParams }: HomeProps) {
  const requestedDistillery = (await searchParams).distillery;
  const initialDistilleryId = requestedDistillery && getLocation(requestedDistillery)
    ? requestedDistillery
    : undefined;

  return (
    <>
      <SiteHeader />
      <main>
        <SpiritExplorer initialDistilleryId={initialDistilleryId} />

        <section className="editorial-section" aria-labelledby="families-title">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">
                <span /> <LocalizedText message="home.familiesEyebrow" />
              </p>
              <h2 id="families-title"><LocalizedText message="home.familiesTitle" /></h2>
            </div>
            <p><LocalizedText message="home.familiesIntro" /></p>
          </div>

          <div className="family-grid">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                className="family-card"
                href={`/guide/${category.id}`}
                style={{ "--category": category.color } as React.CSSProperties}
              >
                <span className="family-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="family-glyph">{category.short}</span>
                <h3><LocalizedCategoryText id={category.id} field="name" fallback={category.name} /></h3>
                <p><LocalizedCategoryText id={category.id} field="summary" fallback={category.summary} /></p>
                <span className="family-link">
                  <LocalizedText message="home.openGuide" /> <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="method-strip" aria-labelledby="method-title">
          <div className="method-intro">
            <p className="eyebrow light">
              <span /> <LocalizedText message="home.methodEyebrow" />
            </p>
            <h2 id="method-title"><LocalizedText message="home.methodTitle" /></h2>
            <p><LocalizedText message="home.methodIntro" /></p>
            <Link className="text-link" href="/guide">
              <LocalizedText message="home.enterGuide" /> <ArrowRight size={16} />
            </Link>
          </div>
          <ol className="method-steps">
            <li>
              <span>01</span>
              <FlaskConical aria-hidden="true" />
              <strong><LocalizedText message="home.method1Title" /></strong>
              <p><LocalizedText message="home.method1Body" /></p>
            </li>
            <li>
              <span>02</span>
              <ScanSearch aria-hidden="true" />
              <strong><LocalizedText message="home.method2Title" /></strong>
              <p><LocalizedText message="home.method2Body" /></p>
            </li>
            <li>
              <span>03</span>
              <MapPinned aria-hidden="true" />
              <strong><LocalizedText message="home.method3Title" /></strong>
              <p><LocalizedText message="home.method3Body" /></p>
            </li>
            <li>
              <span>04</span>
              <BookOpenText aria-hidden="true" />
              <strong><LocalizedText message="home.method4Title" /></strong>
              <p><LocalizedText message="home.method4Body" /></p>
            </li>
          </ol>
        </section>

        <section className="future-section" aria-labelledby="next-title">
          <div className="future-copy">
            <p className="eyebrow">
              <span /> <LocalizedText message="home.routeEyebrow" />
            </p>
            <h2 id="next-title"><LocalizedText message="home.routeTitle" /></h2>
            <p><LocalizedText message="home.routeIntro" /></p>
          </div>
          <Link className="future-card taste" href="/discover">
            <span><LocalizedText message="home.tasteLabel" /></span>
            <h3><LocalizedText message="home.tasteTitle" /></h3>
            <p><LocalizedText message="home.tasteBody" /></p>
            <ArrowRight />
          </Link>
          <Link className="future-card bars" href="/bars">
            <span><LocalizedText message="home.barsLabel" /></span>
            <h3><LocalizedText message="home.barsTitle" /></h3>
            <p><LocalizedText message="home.barsBody" /></p>
            <Compass />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
