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
import { categories } from "./data";
import { SpiritExplorer } from "./SpiritExplorer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <SpiritExplorer />

        <section className="editorial-section" aria-labelledby="families-title">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">
                <span /> Eight doors into the atlas
              </p>
              <h2 id="families-title">Know the family. Then question the label.</h2>
            </div>
            <p>
              A category name is only the beginning. Raw material, place,
              method and law explain why two bottles under one heading can feel
              worlds apart.
            </p>
          </div>

          <div className="family-grid">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                className="family-card"
                href={`/guide#${category.id}`}
                style={{ "--category": category.color } as React.CSSProperties}
              >
                <span className="family-number">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="family-glyph">{category.short}</span>
                <h3>{category.name}</h3>
                <p>{category.summary}</p>
                <span className="family-link">
                  Open field guide <ArrowRight size={15} />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="method-strip" aria-labelledby="method-title">
          <div className="method-intro">
            <p className="eyebrow light">
              <span /> Read any spirit
            </p>
            <h2 id="method-title">Four questions unlock the glass.</h2>
            <p>
              The atlas organizes every category around the same causal chain,
              so tasting notes become explanations—not just adjectives.
            </p>
            <Link className="text-link" href="/guide">
              Enter the complete spirit guide <ArrowRight size={16} />
            </Link>
          </div>
          <ol className="method-steps">
            <li>
              <span>01</span>
              <FlaskConical aria-hidden="true" />
              <strong>What went in?</strong>
              <p>Grain, fruit, cane, agave, botanicals—and how they were prepared.</p>
            </li>
            <li>
              <span>02</span>
              <ScanSearch aria-hidden="true" />
              <strong>What happened?</strong>
              <p>Fermentation, distillation, maturation, blending and finishing.</p>
            </li>
            <li>
              <span>03</span>
              <MapPinned aria-hidden="true" />
              <strong>Where is it from?</strong>
              <p>Climate, local practice, protected origin and cultural context.</p>
            </li>
            <li>
              <span>04</span>
              <BookOpenText aria-hidden="true" />
              <strong>What can it be called?</strong>
              <p>Legal category, age statement, production terms and label clues.</p>
            </li>
          </ol>
        </section>

        <section className="future-section" aria-labelledby="next-title">
          <div className="future-copy">
            <p className="eyebrow">
              <span /> Your next route
            </p>
            <h2 id="next-title">From what you taste to where you go.</h2>
            <p>
              Build a taste profile, discover the spirit families that match it,
              then find award-recognized cocktail bars near you.
            </p>
          </div>
          <Link className="future-card taste" href="/discover">
            <span>01 · Taste profile</span>
            <h3>Find your spirit</h3>
            <p>Six quick preferences. Three explainable matches.</p>
            <ArrowRight />
          </Link>
          <Link className="future-card bars" href="/bars">
            <span>02 · Bar atlas</span>
            <h3>Find a remarkable bar</h3>
            <p>Distance plus current, dated editorial credentials.</p>
            <Compass />
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

