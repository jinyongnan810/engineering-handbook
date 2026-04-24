import pageIndex from "../../content/index.json";
import type { HandbookPageContent, HandbookPageMeta } from "./types";

const markdownModules = import.meta.glob("../../content/topics/*.md", {
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

export function getAllPageMetas() {
  return metas;
}

export function getDefaultPageSlug() {
  return metas[0]?.slug ?? "";
}

export function getPageBySlug(
  slug: string,
): Promise<HandbookPageContent | null> {
  const cachedPage = pageContentCache.get(slug);

  if (cachedPage) {
    return cachedPage;
  }

  const pagePromise = (async () => {
    const meta = metas.find((item) => item.slug === slug);

    if (!meta) {
      return null;
    }

    const markdown = await getTextModule(
      markdownModules,
      getContentPath(meta.file),
    );

    return {
      ...meta,
      markdown,
    };
  })();

  pageContentCache.set(slug, pagePromise);
  return pagePromise;
}
