export type HandbookPageMeta = {
  slug: string;
  title: string;
  tag: string;
  file: string;
};

export type HandbookPageContent = HandbookPageMeta & {
  markdown: string;
};
