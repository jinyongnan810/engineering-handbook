import { useLanguage } from "../context/LanguageContext";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className="inline-flex items-center rounded-full border border-neutral-200/80 bg-neutral-100 p-0.5 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-900"
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        aria-pressed={language === "en"}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
          language === "en"
            ? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLanguage("jp")}
        aria-pressed={language === "jp"}
        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-all duration-200 ${
          language === "jp"
            ? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
            : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
        }`}
      >
        JP
      </button>
    </div>
  );
}
