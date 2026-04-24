import pageIndex from "../../content/index.json";
import type { HandbookPageContent, HandbookPageMeta } from "./types";

const markdownModules = import.meta.glob("../../content/pages/*/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const pythonModules = import.meta.glob("../../content/pages/*/*.py", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

const metas = pageIndex as HandbookPageMeta[];
const pageContentCache = new Map<string, Promise<HandbookPageContent | null>>();

function getContentPath(folder: string, fileName: string) {
  return `../../content/${folder}/${fileName}`;
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

    const [whyItMatters, learningGoals, learningMemo, pythonExample] =
      await Promise.all([
        getTextModule(
          markdownModules,
          getContentPath(meta.folder, "why-it-matters.md"),
        ),
        getTextModule(
          markdownModules,
          getContentPath(meta.folder, "learning-goals.md"),
        ),
        getTextModule(
          markdownModules,
          getContentPath(meta.folder, "learning-memo.md"),
        ),
        getTextModule(pythonModules, getContentPath(meta.folder, "example.py")),
      ]);

    return {
      ...meta,
      whyItMatters,
      learningGoals,
      learningMemo,
      pythonExample,
    };
  })();

  pageContentCache.set(slug, pagePromise);
  return pagePromise;
}
