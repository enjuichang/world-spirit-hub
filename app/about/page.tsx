import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, Scale, ShieldCheck } from "lucide-react";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { Bilingual } from "../i18n";

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
            <ArrowLeft size={15} /> <Bilingual en="Back home" zh="返回首頁" />
          </Link>
          <p className="eyebrow">
            <span /> <Bilingual en="Method before mythology" zh="先談方法，再談傳說" />
          </p>
          <h1><Bilingual en="A transparent atlas for a complicated world." zh="為複雜世界打造的透明地圖集。" /></h1>
          <p><Bilingual en="World Spirit Hub is an independent educational project. It uses brand examples to illuminate categories, never as paid rankings or implied endorsements." zh="World Spirit Hub 是獨立教育計畫。我們以品牌實例說明類別，絕不將其當作付費排名或暗示背書。" /></p>
        </header>

        <section className="principle-grid">
          <article>
            <ShieldCheck />
            <h2><Bilingual en="Source the claim" zh="每項主張都有來源" /></h2>
            <p><Bilingual en="Laws and protected terms come first from regulators and official specifications. Producer sites support facts about their own locations and methods—not category-wide superlatives." zh="法規與受保護用語優先採用主管機關與官方規範。生產者網站只用來支持其地點與製法事實，不作整個類別的最高級評斷。" /></p>
          </article>
          <article>
            <Scale />
            <h2><Bilingual en="Separate fact from taste" zh="區分事實與品味" /></h2>
            <p><Bilingual en="Legal definitions, production choices and coordinates are objective records. Flavor profiles and price bands are framed as guidance, not universal scores." zh="法定定義、製程選擇與座標屬客觀記錄；風味輪廓與價格帶只作參考，不是放諸四海皆準的評分。" /></p>
          </article>
          <article>
            <Check />
            <h2><Bilingual en="Date what changes" zh="為會變動的資料標示日期" /></h2>
            <p><Bilingual en="Laws, operating status, prices and awards can expire. Important records carry a source year or review date and should be checked before travel or purchase." zh="法規、營運狀態、價格與獎項都可能過時。重要資料附上來源年份或審閱日期，旅行或購買前仍應再次確認。" /></p>
          </article>
        </section>

        <section className="about-copy" id="sources">
          <div>
            <p className="eyebrow">
              <span /> <Bilingual en="Source ladder" zh="來源優先順序" />
            </p>
            <h2><Bilingual en="What we trust—and for what." zh="我們信任哪些來源，以及各自的用途。" /></h2>
          </div>
          <ol>
            <li>
              <span>01</span>
              <div>
                <strong><Bilingual en="Laws, regulators and geographic indications" zh="法規、主管機關與地理標示" /></strong>
                <p><Bilingual en="For definitions, production requirements and labeling." zh="用於定義、製程要求與標示規則。" /></p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong><Bilingual en="Official trade and appellation bodies" zh="官方產業與產區機構" /></strong>
                <p><Bilingual en="For regional context and current category guidance." zh="用於產區脈絡與現行類別指引。" /></p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong><Bilingual en="Recognized educational references" zh="公認教育參考資料" /></strong>
                <p><Bilingual en="For a consistent global framework and production theory." zh="用於一致的全球架構與製程理論。" /></p>
              </div>
            </li>
            <li>
              <span>04</span>
              <div>
                <strong><Bilingual en="Producers, archives and specialist publications" zh="生產者、檔案與專業出版品" /></strong>
                <p><Bilingual en="For location-specific history, methods and context." zh="用於特定地點的歷史、製法與脈絡。" /></p>
              </div>
            </li>
          </ol>
        </section>

        <section className="source-register">
          <div className="section-heading-row">
            <div>
              <p className="eyebrow">
                <span /> <Bilingual en="Core references" zh="核心參考資料" />
              </p>
              <h2><Bilingual en="Current baselines used in this edition." zh="本版採用的現行基準。" /></h2>
            </div>
          </div>
          <div className="source-cards">
            <a
              href="https://www.wsetglobal.com/qualifications/wset-level-3-award-in-spirits"
              target="_blank"
              rel="noreferrer"
            >
              <span><Bilingual en="Category framework" zh="類別架構" /></span>
              <strong>WSET Level 3 Award in Spirits</strong>
              <small><Bilingual en="2025 Issue 3 baseline" zh="2025 年第 3 版基準" /></small>
              <ArrowUpRight />
            </a>
            <a
              href="https://www.theworlds50best.com/bars/best-in-the-world/voting/the-voting-system"
              target="_blank"
              rel="noreferrer"
            >
              <span><Bilingual en="Annual ranking methodology" zh="年度排名方法" /></span>
              <strong>The World’s 50 Best Bars</strong>
              <small><Bilingual en="Credential displayed with year" zh="評選資料標示年份" /></small>
              <ArrowUpRight />
            </a>
            <a
              href="https://talesofthecocktail.org/events/spirited-awards/"
              target="_blank"
              rel="noreferrer"
            >
              <span><Bilingual en="Industry awards" zh="業界獎項" /></span>
              <strong>Spirited Awards</strong>
              <small><Bilingual en="Winner/finalist status kept distinct" zh="得獎與入圍狀態分開呈現" /></small>
              <ArrowUpRight />
            </a>
            <a
              href="https://www.thepinnacleguide.com/about-the-pinnacle-guide/"
              target="_blank"
              rel="noreferrer"
            >
              <span><Bilingual en="Reviewed recognition" zh="經審核認可" /></span>
              <strong>The Pinnacle Guide</strong>
              <small><Bilingual en="PIN level and validity required" zh="必須標示 PIN 等級與有效狀態" /></small>
              <ArrowUpRight />
            </a>
          </div>
        </section>

        <section className="corrections" id="corrections">
          <p className="eyebrow light">
            <span /> <Bilingual en="Corrections" zh="內容更正" />
          </p>
          <h2><Bilingual en="Spotted something that needs another look?" zh="發現需要重新查證的內容嗎？" /></h2>
          <p><Bilingual en="Include the page, disputed claim, and a primary or authoritative source. Until a contact channel is connected, corrections can be submitted through the project repository owner." zh="請附上頁面、待查證主張與第一手或權威來源。在聯絡管道完成前，可透過專案儲存庫擁有者提交更正。" /></p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
