import { describe, expect, it } from "vitest";
import { en, si, ta, translate, formatMoney, formatDate, parseLocalDate, lookup } from "./index.js";

function keys(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj)) return [prefix];
  if (obj && typeof obj === "object") return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  return [prefix];
}
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join(",");

describe("dictionaries", () => {
  const enKeys = keys(en);
  it("Sinhala and Tamil have every key", () => {
    expect(keys(si)).toEqual(enKeys);
    expect(keys(ta)).toEqual(enKeys);
  });
  it("no empty strings", () => {
    for (const k of enKeys) {
      const v = lookup(si, k);
      if (v !== undefined) expect(v.trim(), `si:${k}`).not.toBe("");
      const w = lookup(ta, k);
      if (w !== undefined) expect(w.trim(), `ta:${k}`).not.toBe("");
    }
  });
  it("placeholders match across languages", () => {
    for (const k of enKeys) {
      const e = lookup(en, k);
      if (e === undefined) continue;
      expect(placeholders(lookup(si, k)!), `si:${k}`).toBe(placeholders(e));
      expect(placeholders(lookup(ta, k)!), `ta:${k}`).toBe(placeholders(e));
    }
  });
});

describe("helpers", () => {
  it("translates with params and falls back", () => {
    expect(translate("en", "goals.monthsLeft", { n: 4 })).toBe("4 months left");
    expect(translate("si", "goals.monthsLeft", { n: 4 })).toBe("මාස 4ක් ඉතිරියි");
    expect(translate("ta", "nope.missing")).toBe("nope.missing");
  });
  it("formats rupees per language", () => {
    expect(formatMoney(25000)).toBe("Rs. 25,000");
    expect(formatMoney(25000, "si")).toBe("රු. 25,000");
    expect(formatMoney(1250.5, "ta")).toBe("ரூ. 1,250.50");
    expect(formatMoney(1_250_000, "en", { compact: true })).toBe("Rs. 1.3M");
  });
  it("uses DD/MM/YYYY", () => {
    expect(formatDate("2026-10-05")).toBe("05/10/2026");
    expect(parseLocalDate("5/10/2026")).toBe("2026-10-05");
    expect(parseLocalDate("31/02/2026")).toBeNull();
  });
});
