import pageIndex from "../../content/index.json";
import { getLocalizedTag, type Language } from "../i18n/translations";
import type { HandbookPageContent, HandbookPageMeta } from "./types";

const markdownModules = import.meta.glob("../../content/topics/**/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const metas = pageIndex as HandbookPageMeta[];
const pageContentCache = new Map<string, Promise<HandbookPageContent | null>>();

function getContentPath(file: string) {
  return `../../content/${file}`;
}

async function getTextModule(
  modules: Record<string, () => Promise<string>>,
  path: string,
) {
  const loader = modules[path];

  if (!loader) {
    return "";
  }

  return loader();
}

export function getAllPageMetas(): HandbookPageMeta[] {
  return metas;
}

export function getDefaultPageSlug(): string {
  return metas[0]?.slug ?? "";
}

export function getPageTitle(
  meta: HandbookPageMeta,
  language: Language = "en",
): string {
  if (language === "jp" && meta.title_jp) {
    return meta.title_jp;
  }
  return meta.title;
}

export function getPageTag(
  meta: HandbookPageMeta,
  language: Language = "en",
): string {
  return getLocalizedTag(meta.tag, language);
}

export function getPageBySlug(
  slug: string,
  language: Language = "en",
): Promise<HandbookPageContent | null> {
  const cacheKey = `${slug}:${language}`;
  const cachedPage = pageContentCache.get(cacheKey);

  if (cachedPage) {
    return cachedPage;
  }

  const pagePromise = (async () => {
    const meta = metas.find((item) => item.slug === slug);

    if (!meta) {
      return null;
    }

    let markdown = "";

    if (language === "jp") {
      const jpFile = meta.file.replace(/\.md$/, "_jp.md");
      const jpPath = getContentPath(jpFile);
      if (markdownModules[jpPath]) {
        markdown = await getTextModule(markdownModules, jpPath);
      }
    }

    // Fallback to English/default if not found or if language is "en"
    if (!markdown) {
      markdown = await getTextModule(
        markdownModules,
        getContentPath(meta.file),
      );
    }

    return {
      ...meta,
      title: getPageTitle(meta, language),
      markdown,
    };
  })();

  pageContentCache.set(cacheKey, pagePromise);
  return pagePromise;
}
