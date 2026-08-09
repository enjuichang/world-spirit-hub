import type { Metadata } from "next";
import { TasteQuiz } from "./TasteQuiz";

export const metadata: Metadata = {
  title: "Find your spirit",
  description:
    "An explainable taste-profile quiz that suggests spirit families to explore.",
};

export default function DiscoverPage() {
  return <TasteQuiz />;
}

