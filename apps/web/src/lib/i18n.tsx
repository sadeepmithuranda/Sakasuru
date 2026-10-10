import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { translate, formatMoney, formatDate, monthName, LANGUAGES, type Lang, type Params } from "@sakasuru/localization";

interface I18n {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, params?: Params) => string;
  money: (n: number, opts?: { compact?: boolean; cents?: boolean }) => string;
  date: (iso: string) => string;
  month: (key: string) => string;
  /** pick the right language from a trilingual content object */
  pick: (l: { en: string; si: string; ta: string } | Record<string, string>) => string;
}

const Ctx = createContext<I18n | null>(null);
const STORAGE = "sakasuru:lang";

export function readStoredLang(): Lang | null {
  try {
    const v = localStorage.getItem(STORAGE);
    return v === "si" || v === "ta" || v === "en" ? v : null;
  } catch {
    return null;
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readStoredLang() ?? "si");
  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE, l);
    } catch {
      /* ignore */
    }
  };
  useEffect(() => {
    document.documentElement.lang = LANGUAGES.find((x) => x.code === lang)?.htmlLang ?? "si-LK";
  }, [lang]);
  const value = useMemo<I18n>(
    () => ({
      lang,
      setLang,
      t: (key, params) => translate(lang, key, params),
      money: (n, opts) => formatMoney(n, lang, opts),
      date: (iso) => formatDate(iso),
      month: (key) => {
        const [y, m] = key.split("-").map(Number);
        return `${monthName(lang, (m ?? 1) - 1)} ${y}`;
      },
      pick: (l) => (l as Record<string, string>)[lang] || (l as Record<string, string>).en || "",
    }),
    [lang],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useI18n outside provider");
  return v;
}
