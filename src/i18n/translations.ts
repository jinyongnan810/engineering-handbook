export type Language = "en" | "jp";

export const tagTranslations: Record<string, { en: string; jp: string }> = {
  "Published Work": { en: "Published Work", jp: "公開作品" },
  AWS: { en: "AWS", jp: "AWS" },
  "Linear Algebra": { en: "Linear Algebra", jp: "線形代数" },
  Algorithms: { en: "Algorithms", jp: "アルゴリズム" },
  Statistics: { en: "Statistics", jp: "統計学" },
  Security: { en: "Security", jp: "セキュリティ" },
  Robotics: { en: "Robotics", jp: "ロボティクス" },
  "Artificial Intelligence": {
    en: "Artificial Intelligence",
    jp: "人工知能",
  },
  Others: { en: "Others", jp: "その他" },
};

export const translations = {
  en: {
    "site.title": "Engineering Handbook",
    "header.open_topics": "Open topic list",
    "header.close_topics": "Close topic list",
    "home.hero_title": "Kinn's Engineering Handbook",
    "home.hero_subtitle": "A Handbook for myself.",
    "home.article_single": "article",
    "home.article_plural": "articles",
    "sidebar.filter_placeholder": "Filter",
    "sidebar.filter_sr": "Filter topics",
    "sidebar.no_matches": "No matching topics.",
    "sidebar.nav_aria": "Topics",
    "topic.on_this_page": "On this page",
    "topic.not_found": "Topic not found",
    "topic.not_found_desc": "That handbook page does not exist.",
    "topic.loading": "Loading topic",
  },
  jp: {
    "site.title": "Engineering Handbook",
    "header.open_topics": "トピック一覧を開く",
    "header.close_topics": "トピック一覧を閉じる",
    "home.hero_title": "Kinn's Engineering Handbook",
    "home.hero_subtitle": "自分用のエンジニアリングハンドブック。",
    "home.article_single": "件の記事",
    "home.article_plural": "件の記事",
    "sidebar.filter_placeholder": "トピックを検索...",
    "sidebar.filter_sr": "トピックを検索",
    "sidebar.no_matches": "該当するトピックがありません。",
    "sidebar.nav_aria": "トピック",
    "topic.on_this_page": "目次",
    "topic.not_found": "トピックが見つかりません",
    "topic.not_found_desc": "お探しのハンドブックページは存在しません。",
    "topic.loading": "トピックを読み込み中",
  },
} as const;

export type TranslationKey = keyof (typeof translations)["en"];

export function getLocalizedTag(tag: string, lang: Language): string {
  const item = tagTranslations[tag];
  if (!item) {
    return tag;
  }
  return item[lang] ?? tag;
}
