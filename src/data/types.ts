export const TAGS = ["math", "algebra", "statistics", "algorithms"] as const;

export type HandbookTag = (typeof TAGS)[number];

export type HandbookPageMeta = {
  slug: string;
  title: string;
  tags: HandbookTag[];
  file: string;
};

export type HandbookPageContent = HandbookPageMeta & {
  markdown: string;
};
