import { monthKeyOf } from "@sakasuru/financial-engine";

export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");
export const todayIso = () => {
  const d = new Date();
  return `${monthKeyOf(d)}-${String(d.getDate()).padStart(2, "0")}`;
};
export const thisMonth = () => monthKeyOf(new Date());
export const clamp = (n: number, a: number, b: number) => Math.min(Math.max(n, a), b);
export function downloadJson(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
