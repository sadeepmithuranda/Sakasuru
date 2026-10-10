import { Decimal } from "decimal.js";

/**
 * All monetary maths runs through decimal.js so that values like
 * 0.1 + 0.2 never drift. Results are rounded to cents (2 dp, half-up)
 * only at the boundary, when they are returned to callers.
 */
Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

export type Numeric = number | string | Decimal;

export const D = (v: Numeric): Decimal => new Decimal(v);

/** Round to cents and return a JS number for display / JSON. */
export const toMoney = (v: Numeric): number => D(v).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();

/** Round a ratio to a percentage with 1 dp. */
export const toPercent = (v: Numeric): number => D(v).times(100).toDecimalPlaces(1, Decimal.ROUND_HALF_UP).toNumber();

export const sum = (values: Numeric[]): Decimal => values.reduce<Decimal>((acc, v) => acc.plus(D(v)), D(0));

export function assertNonNegative(name: string, v: Numeric): void {
  if (D(v).isNegative()) throw new RangeError(`${name} must not be negative`);
}

/**
 * Format a value as Sri Lankan rupees, e.g. "Rs. 25,000" or "Rs. 1,250.50".
 * Decimals are shown only when the value has cents.
 */
export function formatLKR(v: Numeric, opts: { withCents?: boolean } = {}): string {
  const d = D(v);
  const negative = d.isNegative();
  const abs = d.abs().toDecimalPlaces(2);
  const showCents = opts.withCents ?? !abs.isInteger();
  const [whole, cents] = abs.toFixed(showCents ? 2 : 0).split(".");
  const grouped = (whole ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${negative ? "-" : ""}Rs. ${grouped}${cents ? "." + cents : ""}`;
}

export { Decimal };
