import type { Metadata } from "next";
import { BarFinder } from "./BarFinder";

export const metadata: Metadata = {
  title: "Credentialed bar atlas",
  description:
    "Discover nearby cocktail bars with dated recognition from leading editorial rankings.",
};

export default function BarsPage() {
  return <BarFinder />;
}

