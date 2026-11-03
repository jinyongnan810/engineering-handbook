import type { Language } from "../i18n/translations";

export type { Language };

export type HandbookPageMeta = {
  slug: string;
  title: string;
  title_jp?: string;
  tag: string;
  tag_jp?: string;
  file: string;
};

export type HandbookPageContent = HandbookPageMeta & {
  markdown: string;
  lastEdited?: string | null;
};

export type PageDatesData = Record<
  string,
  {
    en?: string | null;
    jp?: string | null;
  }
>;

export type LinkPreviewData = {
  url: string;
  hostname: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
  favicon?: string;
};
