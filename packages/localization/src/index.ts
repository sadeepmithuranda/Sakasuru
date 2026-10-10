import { en, type Dict } from "./en.js";
import { si } from "./si.js";
import { ta } from "./ta.js";

export type Lang = "si" | "ta" | "en";
export const LANGUAGES: { code: Lang; native: string; english: string; htmlLang: string }[] = [
  { code: "si", native: "සිංහල", english: "Sinhala", htmlLang: "si-LK" },
  { code: "ta", native: "தமிழ்", english: "Tamil", htmlLang: "ta-LK" },
  { code: "en", native: "English", english: "English", htmlLang: "en-LK" },
];

export const dictionaries: Record<Lang, Dict> = { en, si, ta };
export { en, si, ta, type Dict };

export type Params = Record<string, string | number>;

/** Look up a dotted key such as "home.income". Falls back to English, then to the key itself. */
export function lookup(dict: Dict, key: string): string | undefined {
  let cur: unknown = dict;
  for (const part of key.split(".")) {
    if (cur && typeof cur === "object" && part in (cur as Record<string, unknown>)) cur = (cur as Record<string, unknown>)[part];
    else return undefined;
  }
  return typeof cur === "string" ? cur : undefined;
}

export function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in params ? String(params[k]) : m));
}

export function translate(lang: Lang, key: string, params?: Params): string {
  const raw = lookup(dictionaries[lang], key) ?? lookup(en, key) ?? key;
  return interpolate(raw, params);
}

const CURRENCY_PREFIX: Record<Lang, string> = { en: "Rs.", si: "රු.", ta: "ரூ." };

/** "Rs. 25,000" / "රු. 25,000" / "ரூ. 25,000" */
export function formatMoney(amount: number, lang: Lang = "en", opts: { cents?: boolean; compact?: boolean } = {}): string {
  const neg = amount < 0;
  const abs = Math.abs(amount);
  let body: string;
  if (opts.compact && abs >= 1_000_000) body = (abs / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1).replace(/\.0$/, "") + "M";
  else if (opts.compact && abs >= 100_000) body = Math.round(abs / 1000) + "k";
  else {
    const showCents = opts.cents ?? !Number.isInteger(Math.round(abs * 100) / 100);
    body = abs.toLocaleString("en-US", { minimumFractionDigits: showCents ? 2 : 0, maximumFractionDigits: showCents ? 2 : 0 });
  }
  return `${neg ? "-" : ""}${CURRENCY_PREFIX[lang]} ${body}`;
}

/** DD/MM/YYYY — the Sri Lankan convention. Accepts ISO strings or Dates. */
export function formatDate(input: string | Date): string {
  const d = typeof input === "string" ? new Date(input.length === 10 ? input + "T00:00:00" : input) : input;
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Parse DD/MM/YYYY (or ISO) into yyyy-mm-dd; returns null when invalid. */
export function parseLocalDate(s: string): string | null {
  const t = s.trim();
  const m = t.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/);
  if (m) {
    const [, d, mo, y] = m;
    const iso = `${y}-${mo!.padStart(2, "0")}-${d!.padStart(2, "0")}`;
    const check = new Date(iso + "T00:00:00");
    return check.getDate() === Number(d) && check.getMonth() + 1 === Number(mo) ? iso : null;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  return null;
}

export function monthName(lang: Lang, monthIndex: number): string {
  return dictionaries[lang].months[monthIndex] ?? en.months[monthIndex] ?? "";
}

export function greetingKey(hour: number): "greeting.morning" | "greeting.afternoon" | "greeting.evening" {
  return hour < 12 ? "greeting.morning" : hour < 17 ? "greeting.afternoon" : "greeting.evening";
}
