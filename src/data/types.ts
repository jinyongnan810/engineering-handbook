export type HandbookPageMeta = {
  slug: string;
  title: string;
  tag: string;
  file: string;
};

export type HandbookPageContent = HandbookPageMeta & {
  markdown: string;
};

export type LinkPreviewData = {
  url: string;
  hostname: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
};
