import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "de" | "en";

const STORAGE_KEY = "sonntag.lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  /** Inline translator: pass German first, English second. */
  t: (de: string, en: string) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("de");

  // Hydrate from localStorage after mount to avoid SSR mismatch
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed === "de" || parsed === "en") setLangState(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(l));
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      lang,
      setLang,
      t: (de, en) => (lang === "en" ? en : de),
    }),
    [lang, setLang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback if used outside provider (e.g. SSR shell)
    return {
      lang: "de" as Lang,
      setLang: () => {},
      t: (de: string, _en: string) => de,
    };
  }
  return ctx;
}

/** Convenience: returns just the translator function. */
export function useT() {
  return useI18n().t;
}