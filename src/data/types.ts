export const TAGS = ["math", "algebra", "statistics", "algorithms"] as const;

export type HandbookTag = (typeof TAGS)[number];

export type HandbookPageMeta = {
  slug: string;
  title: string;
  tags: HandbookTag[];
  folder: string;
};

export type HandbookPageContent = HandbookPageMeta & {
  whyItMatters: string;
  learningGoals: string;
  learningMemo: string;
  pythonExample: string;
};
