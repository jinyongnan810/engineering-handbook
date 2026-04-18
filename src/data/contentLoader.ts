import pageIndex from "../../content/index.json";
import type { HandbookPageContent, HandbookPageMeta } from "./types";

const markdownModules = import.meta.glob("../../content/pages/*/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const pythonModules = import.meta.glob("../../content/pages/*/*.py", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const metas = pageIndex as HandbookPageMeta[];

function getContentPath(folder: string, fileName: string) {
  return `../../content/${folder}/${fileName}`;
}

function getTextModule(modules: Record<string, string>, path: string) {
  return modules[path] ?? "";
}

export function getAllPageMetas() {
  return metas;
}

export function getPageBySlug(slug: string): HandbookPageContent | null {
  const meta = metas.find((item) => item.slug === slug);

  if (!meta) {
    return null;
  }

  return {
    ...meta,
    whyItMatters: getTextModule(
      markdownModules,
      getContentPath(meta.folder, "why-it-matters.md"),
    ),
    learningGoals: getTextModule(
      markdownModules,
      getContentPath(meta.folder, "learning-goals.md"),
    ),
    learningMemo: getTextModule(
      markdownModules,
      getContentPath(meta.folder, "learning-memo.md"),
    ),
    pythonExample: getTextModule(
      pythonModules,
      getContentPath(meta.folder, "example.py"),
    ),
  };
}
