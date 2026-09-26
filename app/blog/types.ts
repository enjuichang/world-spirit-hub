export type BlogLanguage = "en-US" | "zh-TW";

export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  author?: string;
  language: BlogLanguage;
  translationKey?: string;
  spiritId?: string;
  distilleryIds: string[];
  tags: string[];
  body: string;
};

export type BlogPostSummary = Omit<BlogPost, "body">;
