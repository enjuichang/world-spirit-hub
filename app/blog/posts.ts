import { blogPosts } from "./generated-posts";
import { blogPostSummaries } from "./generated-post-summaries";

export { blogPosts, blogPostSummaries };

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getPostsForSpirit(spiritId: string) {
  return blogPostSummaries.filter((post) => post.spiritId === spiritId);
}

export function getPostsForDistillery(distilleryId: string) {
  return blogPostSummaries.filter((post) => post.distilleryIds.includes(distilleryId));
}

export function formatPostDate(date: string, language: "en-US" | "zh-TW" = "en-US") {
  return new Intl.DateTimeFormat(language, {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
