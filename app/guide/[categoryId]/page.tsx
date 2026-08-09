import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "../../components/SiteFooter";
import { SiteHeader } from "../../components/SiteHeader";
import { categories } from "../../data";
import { getCategoryGuide, guideSources } from "../../guideData";
import { CategoryGuideChapter } from "../CategoryGuideChapter";
import { GuideLegalNote } from "../GuideLegalNote";

type CategoryPageProps = { params: Promise<{ categoryId: string }> };

export function generateStaticParams() {
  return categories.map((category) => ({ categoryId: category.id }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { categoryId } = await params;
  const category = categories.find((item) => item.id === categoryId);
  if (!category) return {};
  return {
    title: `${category.name} guide`,
    description: `Production, common bottle terms, protected names and subtype comparisons for ${category.name}.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { categoryId } = await params;
  const index = categories.findIndex((category) => category.id === categoryId);
  const category = categories[index];
  const guide = getCategoryGuide(categoryId);
  if (!category || !guide) notFound();

  return (
    <>
      <SiteHeader />
      <main className="guide-page">
        <CategoryGuideChapter category={category} guide={guide} index={index} previous={categories[index - 1]} next={categories[index + 1]} />
        <GuideLegalNote sources={guideSources} />
      </main>
      <SiteFooter />
    </>
  );
}
