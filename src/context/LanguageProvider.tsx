import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  translations,
  type Language,
  type TranslationKey,
} from "../i18n/translations";
import { LanguageContext } from "./LanguageContext";

const STORAGE_KEY = "handbook_lang";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") {
    return "en";
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "jp") {
    return stored;
  }

  if (window.navigator.language.startsWith("ja")) {
    return "jp";
  }

  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    try {
      window.localStorage.setItem(STORAGE_KEY, newLanguage);
    } catch {
      // Ignore localStorage errors (e.g. incognito/quota)
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language === "jp" ? "ja" : "en";
  }, [language]);

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = translations[language] ?? translations.en;
      return dict[key] ?? translations.en[key] ?? key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
