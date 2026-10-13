import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Send, Mic, Sparkles, ExternalLink, Trash2, ShieldCheck, Database } from "lucide-react";
import type { AiAnswerDTO } from "@sakasuru/validation";
import { api } from "@/lib/api-context";
import { useI18n } from "@/lib/i18n";
import { useSession } from "@/lib/api-context";
import { Button } from "@/components/ui";
import { LogoMark } from "@/components/brand";
import { cx } from "@/lib/util";

interface Msg {
  role: "user" | "assistant";
  content: string;
  answer?: AiAnswerDTO;
}

type SpeechRec = { lang: string; interimResults: boolean; onresult: (e: { results: { 0: { transcript: string } }[] }) => void; onend: () => void; start: () => void; stop: () => void };

/** Ask සකසුරු — verified-knowledge assistant with consent-gated personal insights. */
export function AskPage() {
  const { t, lang, date } = useI18n();
  const { me } = useSession();
  const nav = useNavigate();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const rec = useRef<SpeechRec | null>(null);
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // scroll APIs return Promises in newer browsers, so never return them from an effect
    end.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs, busy]);

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || busy) return;
    setInput("");
    const history = msgs.slice(-6).map((m) => ({ role: m.role, content: m.content }));
    setMsgs((m) => [...m, { role: "user", content: question }]);
    setBusy(true);
    try {
      const answer = await api.ask({ question, lang, history });
      setMsgs((m) => [...m, { role: "assistant", content: answer.answer, answer }]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: t("common.error") }]);
    } finally {
      setBusy(false);
    }
  };
  const submit = (e: FormEvent) => (e.preventDefault(), ask(input));

  const SR = (window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec }).SpeechRecognition ?? (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition;
  const toggleVoice = () => {
    if (!SR) return setVoiceError(t("ai.voiceUnsupported"));
    if (listening) return rec.current?.stop();
    const r = new SR();
    r.lang = lang === "si" ? "si-LK" : lang === "ta" ? "ta-LK" : "en-LK";
    r.interimResults = false;
    r.onresult = (e) => setInput((prev) => (prev ? prev + " " : "") + (e.results[0]?.[0]?.transcript ?? ""));
    r.onend = () => setListening(false);
    (r as unknown as { onerror: () => void }).onerror = () => (setListening(false), setVoiceError(t("ai.voiceUnsupported")));
    rec.current = r;
    setListening(true);
    r.start();
  };

  const suggestions = ["fd", "inflation", "saveFirst", "tbills", "lankaqr", "cantSave", "food"];
  const action = (a: string) => (a === "analyse" ? ask(t("ai.actions.analyse")) : a === "learnBudget" ? nav("/learn/lesson/budgeting-basics") : nav("/money?tab=budget"));

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <header className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-2xl bg-learn-50">
            <Sparkles className="size-6 text-accent-400" />
          </span>
          <div>
            <h1 className="text-2xl font-bold">{t("ai.title")}</h1>
            <p className="text-sm text-muted">{t("ai.subtitle")}</p>
          </div>
        </div>
        {msgs.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => (setMsgs([]), api.clearAiHistory().catch(() => undefined))}>
            <Trash2 className="size-4" /> {t("ai.clear")}
          </Button>
        )}
      </header>

      <p className="mt-4 flex gap-2 rounded-2xl bg-surface p-3 text-sm text-ink-soft">
        <ShieldCheck className="size-5 shrink-0 text-brand-600" /> {t("ai.disclaimer")}
      </p>
      {me && !me.consents.aiDataAccess && (
        <Link to="/profile/privacy" className="mt-2 flex gap-2 rounded-2xl bg-learn-50 p-3 text-sm text-learn-700">
          <Database className="size-5 shrink-0" /> {t("ai.personalOff")}
        </Link>
      )}

      <div className="mt-6 flex min-h-[40vh] flex-col gap-4" aria-live="polite">
        {msgs.length === 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button key={s} onClick={() => ask(t(`ai.suggestions.${s}`))} className="rounded-full border border-line bg-card px-4 py-2.5 text-left text-sm font-medium hover:border-brand-300">
                {t(`ai.suggestions.${s}`)}
              </button>
            ))}
          </div>
        )}
        {msgs.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="max-w-[85%] self-end rounded-[22px] rounded-br-md bg-brand-600 px-4 py-3 text-white">
              {m.content}
            </div>
          ) : (
            <div key={i} className="flex max-w-[92%] gap-3 self-start">
              <span className="mt-1 shrink-0">
                <LogoMark size={30} />
              </span>
              <div className={cx("rounded-[22px] rounded-tl-md border px-4 py-3", m.answer?.mode === "low-confidence" ? "border-amber-600/30 bg-amber-50" : "border-line bg-card")}>
                <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
                {m.answer && m.answer.usedFields.length > 0 && <p className="mt-2 text-xs text-muted">{t("ai.usingYourData", { fields: m.answer.usedFields.join(", ") })}</p>}
                {m.answer && m.answer.sources.length > 0 && (
                  <div className="mt-3 border-t border-line pt-2 text-xs text-muted">
                    {t("common.sources")}:{" "}
                    {m.answer.sources.map((s, k) => (
                      <span key={s.url}>
                        <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-0.5 font-semibold text-brand-800 hover:underline">
                          {s.name} <ExternalLink className="size-3" />
                        </a>
                        {k < m.answer!.sources.length - 1 ? ", " : ""}
                      </span>
                    ))}
                    {m.answer.sources[0]?.lastReviewed && <> · {t("common.lastReviewed", { date: date(m.answer.sources[0].lastReviewed) })}</>}
                  </div>
                )}
                {m.answer && (m.answer.actions.length > 0 || m.answer.relatedLesson) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.answer.actions.map((a) => (
                      <button key={a} onClick={() => action(a)} className="rounded-full bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-800">
                        {t(`ai.actions.${a}`)}
                      </button>
                    ))}
                    {m.answer.relatedLesson && !m.answer.actions.includes("learnBudget") && (
                      <Link to={`/learn/lesson/${m.answer.relatedLesson}`} className="rounded-full bg-learn-50 px-3 py-1.5 text-sm font-semibold text-learn-700">
                        📚 {t("learn.start")}
                      </Link>
                    )}
                  </div>
                )}
                <p className="mt-2 text-[11px] text-muted">{t("common.educationOnly")}</p>
              </div>
            </div>
          ),
        )}
        {busy && (
          <div className="flex gap-1.5 self-start rounded-full bg-card px-4 py-3" aria-label={t("common.loading")}>
            {[0, 1, 2].map((d) => (
              <span key={d} className="size-2 animate-bounce rounded-full bg-brand-300" style={{ animationDelay: `${d * 120}ms` }} />
            ))}
          </div>
        )}
        <div ref={end} />
      </div>

      {voiceError && <p className="mt-4 text-center text-sm text-muted" role="status">{voiceError}</p>}
      <form onSubmit={submit} className="sticky bottom-20 mt-6 flex items-center gap-2 rounded-full border border-line bg-card p-1.5 shadow-[var(--shadow-lift)] lg:bottom-6">
        <button type="button" onClick={toggleVoice} className={cx("grid size-11 shrink-0 place-items-center rounded-full", listening ? "bg-alert-50 text-alert-500" : "text-muted hover:bg-surface")} aria-label={listening ? t("ai.listening") : t("ai.voice")} aria-pressed={listening}>
          <Mic className="size-5" />
        </button>
        <label htmlFor="ask" className="sr-only">
          {t("ai.placeholder")}
        </label>
        <input id="ask" value={input} onChange={(e) => setInput(e.target.value)} placeholder={listening ? t("ai.listening") : t("ai.placeholder")} maxLength={1000} className="h-11 min-w-0 flex-1 bg-transparent px-1 focus:outline-none" autoComplete="off" />
        <button type="submit" disabled={!input.trim() || busy} className="grid size-11 shrink-0 place-items-center rounded-full bg-brand-600 text-white disabled:bg-brand-300" aria-label={t("ai.send")}>
          <Send className="size-5" />
        </button>
      </form>
    </div>
  );
}
