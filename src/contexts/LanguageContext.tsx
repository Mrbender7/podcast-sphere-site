import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import translations, { type Language } from "@/i18n/translations";
import { syncLanguageToNative } from "@/plugins/PodcastAutoPlugin";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const VALID_LANGS: Language[] = ["fr", "en", "es", "de", "ja", "it", "nl", "pt", "pl", "zh", "tr", "ru", "id"];

function detectInitialLanguage(): Language {
  try {
    const stored = localStorage.getItem("podcastsphere_language");
    if (stored && VALID_LANGS.includes(stored as Language)) return stored as Language;
    const nav = navigator.language?.toLowerCase();
    if (nav?.startsWith("fr")) return "fr";
    if (nav?.startsWith("es")) return "es";
    if (nav?.startsWith("de")) return "de";
    if (nav?.startsWith("ja")) return "ja";
    if (nav?.startsWith("it")) return "it";
    if (nav?.startsWith("nl")) return "nl";
    if (nav?.startsWith("pt")) return "pt";
    if (nav?.startsWith("pl")) return "pl";
    if (nav?.startsWith("zh")) return "zh";
    if (nav?.startsWith("tr")) return "tr";
    if (nav?.startsWith("ru")) return "ru";
    if (nav?.startsWith("id") || nav?.startsWith("ms")) return "id";
    return "en";
  } catch {
    return "en";
  }
}

// Map internal lang codes to BCP-47 for html lang attribute
const HTML_LANG_MAP: Record<Language, string> = {
  fr: "fr", en: "en", es: "es", de: "de", ja: "ja",
  it: "it", nl: "nl", pt: "pt", pl: "pl", zh: "zh-CN",
  tr: "tr", ru: "ru", id: "id",
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(detectInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try { localStorage.setItem("podcastsphere_language", lang); } catch {}
  }, []);

  // Sync language to native for Android Auto localized labels
  useEffect(() => {
    syncLanguageToNative(language);
  }, [language]);

  // Update <html lang> and <title> dynamically
  useEffect(() => {
    document.documentElement.lang = HTML_LANG_MAP[language] || language;
    const t = translations[language];
    document.title = `Podcast Sphere — ${t["welcome.subtitle"] || "Podcasts"}`;
  }, [language]);

  const t = useCallback((key: string): string => {
    return translations[language][key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
