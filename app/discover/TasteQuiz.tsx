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

export function TasteQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [copied, setCopied] = useState(false);

  const complete = answers.length === questions.length;
  const results = useMemo(() => {
    const scores: Record<string, number> = Object.fromEntries(
      categories.map((category) => [category.id, 0]),
    );
    answers.forEach((answerIndex, questionIndex) => {
      const answer = questions[questionIndex]?.answers[answerIndex];
      if (!answer) return;
      Object.entries(answer.scores).forEach(([id, value]) => {
        scores[id] = (scores[id] ?? 0) + value;
      });
    });
    return categories
      .map((category) => ({ ...category, score: scores[category.id] ?? 0 }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [answers]);

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
    if (step < questions.length - 1) setStep(step + 1);
  }

  function reset() {
    setStep(0);
    setAnswers([]);
    setCopied(false);
    localStorage.removeItem("wsh-taste-profile-v1");
  }

  async function share() {
    const text = `My World Spirit Hub matches: ${results.map((item) => item.name).join(", ")}`;
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
        <Link className="back-link" href="/">
          <ArrowLeft size={15} /> Back to the atlas
        </Link>

        {!complete ? (
          <>
            <header className="quiz-header">
              <p className="eyebrow">
                <span /> Find your spirit
              </p>
              <div className="quiz-progress-copy">
                <span>
                  Question {step + 1} of {questions.length}
                </span>
                <strong>{Math.round(((step + 1) / questions.length) * 100)}%</strong>
              </div>
              <div className="quiz-progress" aria-hidden="true">
                <i style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
              </div>
            </header>

            <section className="quiz-question" aria-labelledby="question-title">
              <p>{questions[step].helper}</p>
              <h1 id="question-title">{questions[step].prompt}</h1>
              <div className="answer-grid">
                {questions[step].answers.map((answer, index) => (
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
                <ArrowLeft size={15} /> Previous
              </button>
              <p>Answers stay on this device and can be cleared at any time.</p>
            </footer>
          </>
        ) : (
          <section className="quiz-results" aria-labelledby="results-title">
            <div className="results-heading">
              <span className="result-spark">
                <Sparkles />
              </span>
              <p className="eyebrow centered">
                <span /> Your taste route
              </p>
              <h1 id="results-title">Three doors worth opening.</h1>
              <p>
                These are starting points, not a verdict. Each match shows which
                preferences pulled it forward.
              </p>
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
                  <span>{index === 0 ? "Strongest match" : index === 1 ? "Approachable alternative" : "Adventurous choice"}</span>
                  <h2>{result.name}</h2>
                  <p>{rationale[result.id]}</p>
                  <div>
                    {result.taste.slice(0, 3).map((taste) => (
                      <small key={taste}>{taste}</small>
                    ))}
                  </div>
                  <Link href={`/#explore`}>
                    Find it on the atlas <ArrowRight size={15} />
                  </Link>
                </article>
              ))}
            </div>
            <div className="result-actions">
              <button type="button" onClick={share}>
                <Share2 size={16} /> {copied ? "Copied" : "Share my matches"}
              </button>
              <button type="button" onClick={reset}>
                <RotateCcw size={16} /> Retake
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

