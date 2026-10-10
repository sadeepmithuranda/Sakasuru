import { D } from "@sakasuru/financial-engine";

/** NUMERIC columns arrive as strings; convert at the edge for JSON responses. */
export const num = (v: string | number | null | undefined): number => (v === null || v === undefined ? 0 : Number(v));
export const numOrNull = (v: string | number | null | undefined): number | null => (v === null || v === undefined ? null : Number(v));
/** Serialise to a NUMERIC-safe string with 2dp using decimal arithmetic. */
export const dec = (n: number | string): string => D(n).toFixed(2);
