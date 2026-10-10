import { motion } from "motion/react";
import type { FactorResult, HealthBand } from "@sakasuru/financial-engine";
import { useI18n } from "@/lib/i18n";

/**
 * සකසුරු mark: a traditional clay savings pot (කැටය) drawn in modern geometry,
 * with a two-leaf sprout growing from the coin slot.
 */
export function LogoMark({ size = 40, inverted = false }: { size?: number; inverted?: boolean }) {
  const pot = inverted ? "#F5F8F5" : "#0E6B4F";
  const slot = inverted ? "#0E6B4F" : "#F5F8F5";
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <path d="M8 24c0-3.3 2.7-6 6-6h20c3.3 0 6 2.7 6 6v4c0 8.8-7.2 16-16 16S8 36.8 8 28z" fill={pot} />
      <rect x="15" y="12" width="18" height="6" rx="3" fill={pot} />
      <rect x="18" y="27" width="12" height="3" rx="1.5" fill={slot} />
      <path d="M24 24c0-6.5 4-10.5 11-11.5-1 6.6-4.6 10.6-11 11.5z" fill="#F2B705" />
      <path d="M24 24c0-5-3-8.4-8.6-9.4.6 5.2 3.4 8.6 8.6 9.4z" fill="#7BC4A4" />
    </svg>
  );
}

export function Logo({ inverted = false, size = 36 }: { inverted?: boolean; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} inverted={inverted} />
      <span className={`text-[22px] font-bold leading-none tracking-tight ${inverted ? "text-white" : "text-ink"}`} style={{ fontFamily: "Yaldevi, var(--font-sans)" }}>
        සකසුරු
      </span>
    </span>
  );
}

const FACTOR_ORDER = ["saving", "emergency", "debt", "budgeting", "spending", "goals", "knowledge", "protection"];

/**
 * The Financial Health Score as eight petals — one per scoring factor.
 * Each petal fills by the share of points earned, so the score's makeup is
 * visible at a glance (the scoring is never a black box).
 */
export function PetalScore({ score, band, factors, size = 196, onDark = false }: { score: number; band: HealthBand; factors: FactorResult[]; size?: number; onDark?: boolean }) {
  const { t } = useI18n();
  const ordered = FACTOR_ORDER.map((k) => factors.find((f) => f.key === k)).filter(Boolean) as FactorResult[];
  const c = 100;
  const inner = 46;
  const outer = 94;
  const petal = (i: number, fill: number) => {
    const span = (2 * Math.PI) / 8;
    const a0 = -Math.PI / 2 + i * span + 0.06;
    const a1 = a0 + span - 0.12;
    const r = inner + (outer - inner) * fill;
    const p = (rad: number, a: number) => `${c + rad * Math.cos(a)},${c + rad * Math.sin(a)}`;
    return `M${p(inner, a0)} L${p(r, a0)} A${r},${r} 0 0 1 ${p(r, a1)} L${p(inner, a1)} A${inner},${inner} 0 0 0 ${p(inner, a0)} Z`;
  };
  const ghost = onDark ? "rgba(255,255,255,0.14)" : "#E3EEE8";
  const fills = onDark ? ["#F2B705", "#FFFFFF"] : ["#0E6B4F", "#13895F"];
  return (
    <figure className="relative" style={{ width: size, height: size }} aria-label={`${t("health.title")}: ${score} / 100, ${t(`health.bands.${band}`)}`}>
      <svg viewBox="0 0 200 200" width={size} height={size} role="img">
        {ordered.map((f, i) => (
          <g key={f.key}>
            <path d={petal(i, 1)} fill={ghost} />
            <motion.path
              d={petal(i, f.max ? f.score / f.max : 0)}
              fill={i % 2 ? fills[1] : fills[0]}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.06, duration: 0.45 }}
              style={{ transformOrigin: "100px 100px" }}
            >
              <title>{`${t(`health.factors.${f.key}`)}: ${f.score}/${f.max}`}</title>
            </motion.path>
          </g>
        ))}
      </svg>
      <figcaption className="absolute inset-0 grid place-content-center text-center">
        <span className={`figure-xl text-[44px] font-bold ${onDark ? "text-white" : "text-ink"}`} style={{ fontSize: size * 0.22 }}>
          {score}
        </span>
        <span className={`text-xs font-semibold ${onDark ? "text-white/80" : "text-muted"}`}>/ 100</span>
      </figcaption>
    </figure>
  );
}
