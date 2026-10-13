import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { cx } from "@/lib/util";

/* ---------------------------------- Button ---------------------------------- */
type Variant = "primary" | "secondary" | "ghost" | "danger" | "quiet";
export function Button({ variant = "primary", size = "md", loading, className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: "sm" | "md" | "lg"; loading?: boolean }) {
  const styles: Record<Variant, string> = {
    primary: "bg-brand-600 text-white hover:bg-brand-deep disabled:bg-brand-300",
    secondary: "bg-brand-50 text-brand-800 hover:bg-brand-100",
    ghost: "bg-transparent text-brand-800 hover:bg-brand-50",
    danger: "bg-danger text-white hover:brightness-95",
    quiet: "bg-card text-ink border border-line hover:border-brand-300",
  };
  const sizes = { sm: "h-9 px-3.5 text-sm", md: "h-11 px-5 text-[15px]", lg: "h-13 px-6 text-base" };
  return (
    <button {...rest} disabled={rest.disabled || loading} className={cx("inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed", styles[variant], sizes[size], className)}>
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

/** Destructive action with an in-page second tap instead of window.confirm(). */
export function ConfirmButton({ onConfirm, label, confirmLabel, className, iconOnly, children }: { onConfirm: () => void; label: string; confirmLabel: string; className?: string; iconOnly?: boolean; children?: ReactNode }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      aria-label={armed ? confirmLabel : label}
      className={cx("inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors", armed ? "bg-danger px-3 text-white" : "", className)}
    >
      {armed ? <span className="whitespace-nowrap text-sm">{confirmLabel}</span> : iconOnly ? children : <>{children} {label}</>}
    </button>
  );
}

/* ---------------------------------- Fields ---------------------------------- */
export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string | null; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-ink-soft">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted">{hint}</p>}
      {error && (
        <p className="text-xs font-medium text-alert-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase = "h-12 w-full rounded-[var(--radius-field)] border border-line bg-card px-3.5 text-[15px] text-ink placeholder:text-muted/70 focus:border-brand-500 focus:outline-none focus:ring-3 focus:ring-brand-100";

export function TextInput({ label, hint, error, className, ...rest }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string | null }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      <input id={id} {...rest} className={cx(inputBase, className)} />
    </Field>
  );
}

/** Rupee amount input: numeric keypad on phones, Rs. prefix, no floats until submit. */
export function MoneyInput({ label, value, onChange, hint, error, autoFocus, big }: { label: string; value: string; onChange: (v: string) => void; hint?: string; error?: string | null; autoFocus?: boolean; big?: boolean }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} error={error} htmlFor={id}>
      <div className={cx("flex items-center rounded-[var(--radius-field)] border border-line bg-card focus-within:border-brand-500 focus-within:ring-3 focus-within:ring-brand-100", big ? "h-20 px-4" : "h-12 px-3.5")}>
        <span className={cx("mr-2 font-semibold text-muted", big ? "text-2xl" : "text-[15px]")}>Rs.</span>
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          autoFocus={autoFocus}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").replace(/(\.\d{2})\d+/, "$1"))}
          className={cx("figure w-full bg-transparent text-ink focus:outline-none", big ? "text-4xl font-semibold" : "text-[15px]")}
          placeholder="0"
        />
      </div>
    </Field>
  );
}

export function SelectInput({ label, hint, children, className, ...rest }: SelectHTMLAttributes<HTMLSelectElement> & { label: string; hint?: string }) {
  const id = useId();
  return (
    <Field label={label} hint={hint} htmlFor={id}>
      <select id={id} {...rest} className={cx(inputBase, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7d73%22 stroke-width=%223%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[right_14px_center] bg-no-repeat pr-10", className)}>
        {children}
      </select>
    </Field>
  );
}

export function Toggle({ checked, onChange, label, description, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; disabled?: boolean }) {
  const id = useId();
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div>
        <label htmlFor={id} className="font-semibold text-ink">
          {label}
        </label>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cx("relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60", checked ? "bg-brand-600" : "bg-line")}
      >
        <span className={cx("absolute left-0 top-1 size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-6" : "translate-x-1")} />
      </button>
    </div>
  );
}

/** Segmented control for short, mutually exclusive choices. */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-0.5 rounded-[22px] bg-brand-50 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={cx("flex-1 basis-auto whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold transition-colors", value === o.value ? "bg-card text-brand-800 shadow-sm" : "text-ink-soft hover:text-ink")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Chip({ selected, onClick, children }: { selected?: boolean; onClick?: () => void; children: ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={cx("inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 py-2.5 text-left text-[15px] font-medium transition-colors", selected ? "border-brand-500 bg-brand-50 text-brand-800" : "border-line bg-card text-ink hover:border-brand-300")}
    >
      {children}
    </button>
  );
}

/* ---------------------------------- Tabs ---------------------------------- */
export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string }[] }) {
  return (
    <div role="tablist" className="scrollbar-none -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cx("relative whitespace-nowrap px-3 pb-3 pt-2 text-[15px] font-semibold", value === t.value ? "text-brand-800" : "text-muted hover:text-ink")}
        >
          {t.label}
          {value === t.value && <motion.span layoutId="tab-underline" className="absolute inset-x-2 -bottom-px h-[3px] rounded-full bg-brand-600" />}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------- Progress ---------------------------------- */
export function ProgressBar({ value, tone = "brand", label }: { value: number; tone?: "brand" | "accent" | "alert" | "amber" | "learn"; label?: string }) {
  const colors = { brand: "bg-brand-500", accent: "bg-accent-400", alert: "bg-danger", amber: "bg-amber-600", learn: "bg-learn-500" };
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-brand-50" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value)} aria-label={label}>
      <div className={cx("h-full rounded-full transition-[width] duration-700", colors[tone])} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}

/* ---------------------------------- Sheet (dialog) ---------------------------------- */
export function Sheet({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    setTimeout(() => ref.current?.querySelector<HTMLElement>("input,select,textarea,button:not([data-close])")?.focus(), 50);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus();
    };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
          <motion.div className="absolute inset-0 bg-black/55" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            ref={ref}
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className={cx("safe-bottom relative max-h-[92vh] w-full overflow-y-auto rounded-t-[var(--radius-panel)] bg-surface p-5 sm:rounded-[var(--radius-panel)]", wide ? "sm:max-w-2xl" : "sm:max-w-md")}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-xl font-bold">{title}</h2>
              <button data-close onClick={onClose} className="grid size-10 place-items-center rounded-full hover:bg-brand-50" aria-label="Close">
                <X className="size-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

/* ---------------------------------- States ---------------------------------- */
export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-line px-6 py-10 text-center">
      <div className="text-4xl" aria-hidden>
        {icon}
      </div>
      <p className="font-bold">{title}</p>
      {body && <p className="max-w-sm text-sm text-muted">{body}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded-2xl bg-brand-50", className)} aria-hidden />;
}

export function ErrorState({ message, onRetry, retryLabel }: { message: string; onRetry?: () => void; retryLabel: string }) {
  return (
    <div className="rounded-[var(--radius-card)] bg-alert-50 p-5 text-alert-500" role="alert">
      <p className="font-semibold">{message}</p>
      {onRetry && (
        <Button variant="quiet" size="sm" className="mt-3" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

/* ---------------------------------- Toast ---------------------------------- */
const ToastCtx = createContext<(msg: string, tone?: "ok" | "error") => void>(() => undefined);
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "error"; id: number } | null>(null);
  const show = useCallback((msg: string, tone: "ok" | "error" = "ok") => {
    const id = Date.now();
    setToast({ msg, tone, id });
    setTimeout(() => setToast((t) => (t?.id === id ? null : t)), 3200);
  }, []);
  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex justify-center px-4 lg:bottom-8">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 16, opacity: 0 }}
              className={cx("pointer-events-auto rounded-full px-5 py-3 text-sm font-semibold text-white shadow-lg", toast.tone === "ok" ? "bg-inverse text-on-inverse" : "bg-danger")}
            >
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------------------------------- Layout bits ---------------------------------- */
export function PageHeader({ title, subtitle, action, back }: { title: string; subtitle?: string; action?: ReactNode; back?: ReactNode }) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {back}
        <h1 className="text-[28px] font-bold leading-tight tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function Section({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("mt-8", className)}>
      {(title || action) && (
        <div className="mb-3 flex items-baseline justify-between gap-3">
          {title && <h2 className="text-lg font-bold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Card({ children, className, tone = "white" }: { children: ReactNode; className?: string; tone?: "white" | "brand" | "learn" | "accent" | "alert" | "amber" }) {
  const tones = { white: "bg-card border border-line", brand: "bg-brand-50", learn: "bg-learn-50", accent: "bg-accent-100", alert: "bg-alert-50", amber: "bg-amber-50" };
  return <div className={cx("rounded-[var(--radius-card)] p-4", tones[tone], className)}>{children}</div>;
}
