"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Share2,
  Sparkles,
} from "lucide-react";
import { categories } from "../data";
import { useLocale } from "../i18n";
import { LocaleSwitcher } from "../components/LocaleSwitcher";

type Answer = {
  label: string;
  note: string;
  scores: Record<string, number>;
};

type Question = {
  prompt: string;
  helper: string;
  answers: Answer[];
};

const questions: Question[] = [
  {
    prompt: "Which aroma pulls you closer?",
    helper: "Choose the direction that sounds most inviting—not the most impressive.",
    answers: [
      { label: "Smoke & toasted grain", note: "Bonfire, malt, char", scores: { whisky: 4, agave: 1 } },
      { label: "Juniper & fresh herbs", note: "Pine, citrus peel, garden", scores: { gin: 4, flavoured: 2 } },
      { label: "Ripe tropical fruit", note: "Banana, pineapple, brown sugar", scores: { rum: 4, brandy: 1 } },
      { label: "Earth & savory depth", note: "Roasted plants, grain, umami", scores: { agave: 3, asian: 4 } },
    ],
  },
  {
    prompt: "How should a drink feel?",
    helper: "Think about texture and intensity rather than alcohol strength.",
    answers: [
      { label: "Bright & lifted", note: "Crisp, aromatic, refreshing", scores: { gin: 3, vodka: 2, brandy: 1 } },
      { label: "Round & generous", note: "Soft fruit, warmth, texture", scores: { rum: 3, brandy: 3, whisky: 2 } },
      { label: "Lean & precise", note: "Clean lines, subtle detail", scores: { vodka: 4, gin: 1, asian: 1 } },
      { label: "Bold & surprising", note: "Fermented, bitter or savory", scores: { asian: 3, agave: 2, flavoured: 3 } },
    ],
  },
  {
    prompt: "Pick a cocktail family.",
    helper: "You do not need to know the recipe—follow the description.",
    answers: [
      { label: "Old Fashioned", note: "Spirit-forward, lightly sweet, aromatic", scores: { whisky: 4, brandy: 2, rum: 1 } },
      { label: "Daiquiri", note: "Rum, lime, sugar—clean and bright", scores: { rum: 4, agave: 1 } },
      { label: "Martini", note: "Cold, dry, botanical or crystalline", scores: { gin: 4, vodka: 3 } },
      { label: "Paloma", note: "Agave, citrus, salt, sparkling", scores: { agave: 4, gin: 1 } },
      { label: "Highball", note: "Long, refreshing, quietly complex", scores: { whisky: 2, asian: 3, vodka: 2 } },
      { label: "Negroni", note: "Bittersweet, herbal, structured", scores: { gin: 2, flavoured: 4 } },
    ],
  },
  {
    prompt: "Where do you land on sweetness?",
    helper: "Sweetness can come from sugar, oak, ripe fruit or aroma.",
    answers: [
      { label: "Bone dry", note: "Little obvious sweetness", scores: { gin: 3, vodka: 3, asian: 1 } },
      { label: "A gentle roundness", note: "Balanced, not dessert-like", scores: { whisky: 2, brandy: 3, agave: 2 } },
      { label: "Rich but balanced", note: "Caramel, ripe fruit, spice", scores: { rum: 3, whisky: 2, brandy: 2 } },
      { label: "Bittersweet", note: "Sugar with roots, bark and peel", scores: { flavoured: 4, gin: 1 } },
    ],
  },
  {
    prompt: "How adventurous should the first pour be?",
    helper: "There is no virtue in choosing the most challenging option.",
    answers: [
      { label: "Familiar and welcoming", note: "Recognizable flavors first", scores: { whisky: 2, rum: 2, vodka: 2 } },
      { label: "One step sideways", note: "A classic with a new accent", scores: { brandy: 2, gin: 2, agave: 2 } },
      { label: "Take me somewhere new", note: "Unfamiliar fermentation and aroma", scores: { asian: 4, flavoured: 2, agave: 2 } },
    ],
  },
];

const questionsZh: Question[] = [
  {
    prompt: "哪一種香氣最吸引你？",
    helper: "選擇最令你期待的方向，不必挑聽起來最厲害的。",
    answers: [
      { label: "煙燻與烘烤穀物", note: "營火、麥芽、炭烤", scores: { whisky: 4, agave: 1 } },
      { label: "杜松子與新鮮香草", note: "松針、柑橘皮、花園", scores: { gin: 4, flavoured: 2 } },
      { label: "成熟熱帶水果", note: "香蕉、鳳梨、黑糖", scores: { rum: 4, brandy: 1 } },
      { label: "大地與鮮味深度", note: "烘烤植物、穀物、鮮味", scores: { agave: 3, asian: 4 } },
    ],
  },
  {
    prompt: "你喜歡飲品帶來什麼口感？",
    helper: "想像質地與風味強度，而不是酒精濃度。",
    answers: [
      { label: "明亮輕盈", note: "清爽、芬芳、提神", scores: { gin: 3, vodka: 2, brandy: 1 } },
      { label: "圓潤豐滿", note: "柔和果香、溫暖、有質感", scores: { rum: 3, brandy: 3, whisky: 2 } },
      { label: "俐落精準", note: "乾淨線條、細緻變化", scores: { vodka: 4, gin: 1, asian: 1 } },
      { label: "大膽出奇", note: "發酵、苦味或鮮味", scores: { asian: 3, agave: 2, flavoured: 3 } },
    ],
  },
  {
    prompt: "選一種雞尾酒家族。",
    helper: "不必知道配方，跟著描述選就好。",
    answers: [
      { label: "Old Fashioned", note: "烈酒主導、微甜、芳香", scores: { whisky: 4, brandy: 2, rum: 1 } },
      { label: "Daiquiri", note: "蘭姆、萊姆、糖——乾淨明亮", scores: { rum: 4, agave: 1 } },
      { label: "Martini", note: "冰冷、乾爽、植物香或晶透感", scores: { gin: 4, vodka: 3 } },
      { label: "Paloma", note: "龍舌蘭、柑橘、鹽、氣泡", scores: { agave: 4, gin: 1 } },
      { label: "Highball", note: "修長清爽、低調而複雜", scores: { whisky: 2, asian: 3, vodka: 2 } },
      { label: "Negroni", note: "苦甜、草本、結構鮮明", scores: { gin: 2, flavoured: 4 } },
    ],
  },
  {
    prompt: "你偏好的甜度是？",
    helper: "甜感可能來自糖、橡木、成熟水果或香氣。",
    answers: [
      { label: "極乾", note: "幾乎沒有明顯甜味", scores: { gin: 3, vodka: 3, asian: 1 } },
      { label: "溫和圓潤", note: "平衡，不像甜點", scores: { whisky: 2, brandy: 3, agave: 2 } },
      { label: "濃郁但平衡", note: "焦糖、熟果、香料", scores: { rum: 3, whisky: 2, brandy: 2 } },
      { label: "苦甜", note: "糖與根莖、樹皮、果皮交織", scores: { flavoured: 4, gin: 1 } },
    ],
  },
  {
    prompt: "第一杯要多有冒險感？",
    helper: "不必勉強自己選最具挑戰性的答案。",
    answers: [
      { label: "熟悉又親切", note: "先從容易辨認的風味開始", scores: { whisky: 2, rum: 2, vodka: 2 } },
      { label: "稍微繞個彎", note: "經典風格，多一點新口音", scores: { brandy: 2, gin: 2, agave: 2 } },
      { label: "帶我去新地方", note: "陌生的發酵方式與香氣", scores: { asian: 4, flavoured: 2, agave: 2 } },
    ],
  },
];

const rationale: Record<string, string> = {
  whisky: "You leaned toward grain, oak, warmth and structured spirit-forward drinks.",
  brandy: "You favored rounded fruit, gentle richness and layered maturation.",
  rum: "Tropical fruit, generous texture and bright sour-style drinks kept recurring.",
  agave: "Roasted, earthy and citrus-led flavors point toward agave’s savory energy.",
  gin: "Fresh botanicals, lifted aromas and dry precision are your strongest signals.",
  vodka: "You value clean structure, restrained aroma and a polished, lean texture.",
  asian: "You showed curiosity for grain, savory depth and expressive fermentation.",
  flavoured: "Bittersweet herbs, spice and layered botanical flavors led your answers.",
};

const rationaleZh: Record<string, string> = {
  whisky: "你偏向穀物、橡木、溫暖感與以烈酒為主體的調酒。",
  brandy: "你喜歡圓潤果香、溫和濃郁感與層次豐富的熟成風味。",
  rum: "熱帶水果、豐滿質地與明亮酸味調酒一再出現在你的選擇中。",
  agave: "烘烤、大地與柑橘風味，指向龍舌蘭獨特的鮮味活力。",
  gin: "新鮮植物香、輕盈香氣與乾爽精準，是你最強的偏好訊號。",
  vodka: "你重視乾淨結構、克制香氣與俐落細緻的質地。",
  asian: "你對穀物、鮮味深度與富表現力的發酵風味充滿好奇。",
  flavoured: "苦甜草本、香料與多層植物風味主導了你的答案。",
};

export function TasteQuiz() {
  const { locale, t, categoryName, categoryTaste } = useLocale();
  const activeQuestions = locale === "zh-TW" ? questionsZh : questions;
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const complete = answers.length === activeQuestions.length;
  const results = useMemo(() => {
    const scores: Record<string, number> = Object.fromEntries(
      categories.map((category) => [category.id, 0]),
    );
    answers.forEach((answerIndex, questionIndex) => {
      const answer = activeQuestions[questionIndex]?.answers[answerIndex];
      if (!answer) return;
      Object.entries(answer.scores).forEach(([id, value]) => {
        scores[id] = (scores[id] ?? 0) + value;
      });
    });
    return categories
      .map((category) => ({ ...category, score: scores[category.id] ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [activeQuestions, answers]);

  useEffect(() => {
    if (!complete) return;
    localStorage.setItem(
      "wsh-taste-profile-v1",
      JSON.stringify({ categoryIds: results.map((result) => result.id), version: 1 }),
    );
  }, [complete, results]);

  function choose(index: number) {
    const next = [...answers.slice(0, step), index];
    setAnswers(next);
    if (step < activeQuestions.length - 1) setStep(step + 1);
  }

  function reset() {
    setStep(0);
    setAnswers([]);
    setCopied(false);
    localStorage.removeItem("wsh-taste-profile-v1");
  }

  async function share() {
    const names = results.map((item) => categoryName(item.id, item.name)).join(locale === "zh-TW" ? "、" : ", ");
    const text = t("quiz.shareText", { names });
    try {
      await navigator.clipboard.writeText(`${text} — ${window.location.origin}/discover`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="quiz-page">
      <div className="quiz-ambient" aria-hidden="true" />
      <div className="quiz-shell">
        <div className="standalone-toolbar">
          <Link className="back-link" href="/">
            <ArrowLeft size={15} /> {t("quiz.back")}
          </Link>
          <LocaleSwitcher compact />
        </div>

        {!complete ? (
          <>
            <header className="quiz-header">
              <p className="eyebrow">
                <span /> {t("quiz.eyebrow")}
              </p>
              <div className="quiz-progress-copy">
                <span>
                  {t("quiz.progress", { current: step + 1, total: activeQuestions.length })}
                </span>
                <strong>{Math.round(((step + 1) / activeQuestions.length) * 100)}%</strong>
              </div>
              <div className="quiz-progress" aria-hidden="true">
                <i style={{ width: `${((step + 1) / activeQuestions.length) * 100}%` }} />
              </div>
            </header>

            <section className="quiz-question" aria-labelledby="question-title">
              <p>{activeQuestions[step].helper}</p>
              <h1 id="question-title">{activeQuestions[step].prompt}</h1>
              <div className="answer-grid">
                {activeQuestions[step].answers.map((answer, index) => (
                  <button type="button" onClick={() => choose(index)} key={answer.label}>
                    <span>{String.fromCharCode(65 + index)}</span>
                    <strong>{answer.label}</strong>
                    <small>{answer.note}</small>
                    <ArrowRight size={17} />
                  </button>
                ))}
              </div>
            </section>

            <footer className="quiz-controls">
              <button
                type="button"
                onClick={() => setStep(Math.max(0, step - 1))}
                disabled={step === 0}
              >
                <ArrowLeft size={15} /> {t("common.previous")}
              </button>
              <p>{t("quiz.privacy")}</p>
            </footer>
          </>
        ) : (
          <section className="quiz-results" aria-labelledby="results-title">
            <div className="results-heading">
              <span className="result-spark">
                <Sparkles />
              </span>
              <p className="eyebrow centered">
                <span /> {t("quiz.resultsEyebrow")}
              </p>
              <h1 id="results-title">{t("quiz.resultsTitle")}</h1>
              <p>{t("quiz.resultsIntro")}</p>
            </div>
            <div className="result-cards">
              {results.map((result, index) => (
                <article
                  key={result.id}
                  style={{ "--category": result.color } as React.CSSProperties}
                >
                  <div className="result-rank">
                    {index === 0 ? <Check /> : index + 1}
                  </div>
                  <span>{index === 0 ? t("quiz.strongest") : index === 1 ? t("quiz.alternative") : t("quiz.adventurous")}</span>
                  <h2>{categoryName(result.id, result.name)}</h2>
                  <p>{locale === "zh-TW" ? rationaleZh[result.id] : rationale[result.id]}</p>
                  <div>
                    {categoryTaste(result.id, result.taste).slice(0, 3).map((taste) => (
                      <small key={taste}>{taste}</small>
                    ))}
                  </div>
                  <Link href={`/#explore`}>
                    {t("quiz.findAtlas")} <ArrowRight size={15} />
                  </Link>
                </article>
              ))}
            </div>
            <div className="result-actions">
              <button type="button" onClick={share}>
                <Share2 size={16} /> {copied ? t("quiz.copied") : t("quiz.share")}
              </button>
              <button type="button" onClick={reset}>
                <RotateCcw size={16} /> {t("quiz.retake")}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
