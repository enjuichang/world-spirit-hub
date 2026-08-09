import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Scale, ShieldCheck } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "About & methodology",
  description:
    "How World Spirit Hub researches, classifies and reviews spirits and cocktail-bar credentials.",
};

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="about-page">
        <header className="page-hero compact">
          <Link className="back-link" href="/">
            <ArrowLeft size={15} /> Back home
          </Link>
          <p className="eyebrow">
            <span /> Method before mythology
          </p>
          <h1>A transparent atlas for a complicated world.</h1>
          <p>
            World Spirit Hub is an independent educational project. It uses
            brand examples to illuminate categories, never as paid rankings or
            implied endorsements.
          </p>
        </header>

        <section className="principle-grid">
          <article>
            <ShieldCheck />
            <h2>Source the claim</h2>
            <p>
              Laws and protected terms come first from regulators and official
              specifications. Producer sites support facts about their own
              locations and methods—not category-wide superlatives.
            </p>
          </article>
          <article>
            <Scale />
            <h2>Separate fact from taste</h2>
            <p>
              Legal definitions, production choices and coordinates are
              objective records. Flavor profiles and price bands are framed as
              guidance, not universal scores.
            </p>
          </article>
          <article>
            <Check />
            <h2>Date what changes</h2>
            <p>
              Laws, operating status, prices and awards can expire. Important
              records carry a source year or review date and should be checked
              before travel or purchase.
            </p>
          </article>
        </section>

        <section className="about-copy" id="sources">
          <div>
            <p className="eyebrow">
              <span /> Source ladder
            </p>
            <h2>What we trust—and for what.</h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong>Laws, regulators and geographic indications</strong>
                <p>For definitions, production requirements and labeling.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>Official trade and appellation bodies</strong>
                <p>For regional context and current category guidance.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>Recognized educational references</strong>
                <p>For a consistent global framework and production theory.</p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <strong>Producers, archives and specialist publications</strong>
                <p>For location-specific history, methods and context.</p>
              </div>
            </li>
          </ol>
        </section>

        <section className="source-register">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">
                <span /> Core references
              </p>
              <h2>Current baselines used in this edition.</h2>
            </div>
          </div>
          <div className="source-cards">
            <a
              href="https://www.wsetglobal.com/qualifications/wset-level-3-award-in-spirits"
              target="_blank"
              rel="noreferrer"
            >
              <span>Category framework</span>
              <strong>WSET Level 3 Award in Spirits</strong>
              <small>2025 Issue 3 baseline</small>
              <ArrowUpRight />
            </a>
            <a
              href="https://www.theworlds50best.com/bars/best-in-the-world/voting/the-voting-system"
              target="_blank"
              rel="noreferrer"
            >
              <span>Annual ranking methodology</span>
              <strong>The World’s 50 Best Bars</strong>
              <small>Credential displayed with year</small>
              <ArrowUpRight />
            </a>
            <a
              href="https://talesofthecocktail.org/events/spirited-awards/"
              target="_blank"
              rel="noreferrer"
            >
              <span>Industry awards</span>
              <strong>Spirited Awards</strong>
              <small>Winner/finalist status kept distinct</small>
              <ArrowUpRight />
            </a>
            <a
              href="https://www.thepinnacleguide.com/about-the-pinnacle-guide/"
              target="_blank"
              rel="noreferrer"
            >
              <span>Reviewed recognition</span>
              <strong>The Pinnacle Guide</strong>
              <small>PIN level and validity required</small>
              <ArrowUpRight />
            </a>
          </div>
        </section>

        <section className="corrections" id="corrections">
          <p className="eyebrow light">
            <span /> Corrections
          </p>
          <h2>Spotted something that needs another look?</h2>
          <p>
            Include the page, disputed claim, and a primary or authoritative
            source. Until a contact channel is connected, corrections can be
            submitted through the project repository owner.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

