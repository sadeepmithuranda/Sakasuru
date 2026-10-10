import { eq, sql } from "drizzle-orm";
import { KNOWLEDGE, searchKnowledge, type KnowledgeEntry } from "@sakasuru/content";
import { dictionaries, translate, formatMoney, type Lang } from "@sakasuru/localization";
import { getCategory, D, toPercent } from "@sakasuru/financial-engine";
import type { AiAnswerDTO, AskInput } from "@sakasuru/validation";
import { schema } from "../../db/client.js";
import type { AppContext } from "../../lib/context.js";
import { getConsents } from "../me/service.js";
import { transactionsInRange } from "../finance/service.js";
import { num } from "../../lib/money.js";

const PERSONAL = [
  /how much (did|have) i|how much .* (i|my)\b|analy[sz]e my|my spending|did i spend|have i spent|where (did|does) my money|why am i spending|my (income|expenses|savings rate)/i,
  /මම .*කීයද|මගේ වියදම්|වියදම් විශ්ලේෂණය|මගේ මුදල් කොහේ|මම කොපමණ/,
  /நான் .*எவ்வளவு|என் செலவ|செலவுகளை ஆய்வு|என் பணம் எங்கே|எவ்வளவு செலவழித்தேன்/,
];

export const isPersonalQuestion = (q: string) => PERSONAL.some((r) => r.test(q));

/** Find which spending group (food, transport, …) the question mentions, in any language. */
function detectGroup(q: string): string | null {
  const lower = q.toLowerCase();
  const extra: Record<string, string[]> = {
    food: ["food", "grocer", "rice", "eating", "delivery", "හාල්", "කෑම", "சாப்பாடு", "அரிசி"],
    transport: ["transport", "bus", "train", "fuel", "petrol", "three-wheeler", "tuk", "බස්", "ඉන්ධන", "பேருந்து", "எரிபொருள்"],
    utilities: ["electricity", "water", "internet", "reload", "විදුලි", "மின்சார"],
    entertainment: ["entertainment", "movies", "විනෝද", "பொழுதுபோக்கு"],
    shopping: ["shopping", "clothes", "සාප්පු", "கொள்முதல்"],
    subscriptions: ["subscription", "netflix", "දායකත්ව", "சந்தா"],
  };
  for (const lang of ["en", "si", "ta"] as Lang[]) {
    for (const [group, name] of Object.entries(dictionaries[lang].groups)) if (lower.includes(name.toLowerCase())) return group;
  }
  for (const [group, words] of Object.entries(extra)) if (words.some((w) => lower.includes(w))) return group;
  return null;
}

const SYSTEM_PROMPT = (lang: Lang) => `You are සකසුරු AI, a financial EDUCATION assistant for people in Sri Lanka.
Rules you must follow:
- Answer ONLY using the verified context provided. If the context does not answer the question, reply exactly with: "${translate(lang, "ai.lowConfidence")}"
- Never tell the user to buy a specific stock, take a specific loan, or invest money in a specific product. Explain risks, benefits and factors to consider instead.
- Clearly present this as educational information, not professional financial advice.
- Do not state current interest rates, tax rates or other changing figures unless they appear in the context; point to the official source.
- Be warm, simple and non-judgmental. Never shame the user about spending.
- Reply in ${lang === "si" ? "Sinhala" : lang === "ta" ? "Tamil" : "English"}, in under 180 words, using Sri Lankan rupee formatting (Rs.).`;

async function bumpTopic(ctx: AppContext, topic: string) {
  await ctx.db
    .insert(schema.aiTopicStats)
    .values({ topic, count: 1 })
    .onConflictDoUpdate({ target: schema.aiTopicStats.topic, set: { count: sql`${schema.aiTopicStats.count} + 1` } });
}

/** Personal insights computed on the server; only aggregates for this question are used, and nothing is sent to an external model. */
async function personalAnswer(ctx: AppContext, userId: string, q: string, lang: Lang): Promise<AiAnswerDTO> {
  const now = ctx.now();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const rows = await transactionsInRange(ctx, userId, `${month}-01`, `${month}-${lastDay}`);
  const expenses = rows.filter((r) => r.type === "expense" && r.categoryKey !== "savings" && r.categoryKey !== "investments");
  const income = rows.filter((r) => r.type === "income").reduce((a, r) => a.plus(r.amount), D(0));
  const money = (n: number) => formatMoney(n, lang);
  if (!expenses.length) return { answer: translate(lang, "ai.personal.noData"), mode: "personal", sources: [], usedFields: [], relatedLesson: null, actions: [] };

  const group = detectGroup(q);
  if (group) {
    const total = expenses.filter((e) => getCategory(e.categoryKey).group === group).reduce((a, r) => a + num(r.amount), 0);
    return {
      answer: translate(lang, "ai.personal.spentCategory", { amount: money(total), category: translate(lang, `groups.${group}`) }),
      mode: "personal",
      sources: [],
      usedFields: [`expenses.${group}.${month}`],
      relatedLesson: null,
      actions: [],
    };
  }
  const spent = expenses.reduce((a, r) => a + num(r.amount), 0);
  const byGroup = new Map<string, number>();
  for (const e of expenses) byGroup.set(getCategory(e.categoryKey).group, (byGroup.get(getCategory(e.categoryKey).group) ?? 0) + num(e.amount));
  const top = [...byGroup.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
  const parts = [translate(lang, "ai.personal.spentTotal", { amount: money(spent), income: money(income.toNumber()) })];
  if (income.gt(0)) parts.push(translate(lang, "ai.personal.savingRate", { rate: Math.max(0, Math.round(toPercent(income.minus(spent).div(income)))) }));
  parts.push(translate(lang, "ai.personal.topCategories", { list: top.map(([g, v]) => `${translate(lang, `groups.${g}`)} (${money(v)})`).join(", ") }));
  return { answer: parts.join(" "), mode: "personal", sources: [], usedFields: [`expenses.total.${month}`, `income.total.${month}`, `expenses.topGroups.${month}`], relatedLesson: "budgeting-basics", actions: ["learnBudget", "createBudget"] };
}

function knowledgeAnswer(entry: KnowledgeEntry, lang: Lang): AiAnswerDTO {
  return {
    answer: entry.answer[lang],
    mode: "knowledge",
    sources: entry.sources.map((s) => ({ ...s, lastReviewed: entry.lastReviewed })),
    usedFields: [],
    relatedLesson: entry.relatedLesson ?? null,
    actions: entry.id === "budgeting" ? ["analyse", "learnBudget", "createBudget"] : [],
  };
}

export async function answerQuestion(ctx: AppContext, userId: string | null, input: AskInput): Promise<AiAnswerDTO> {
  const { question, lang } = input;
  let result: AiAnswerDTO;

  if (isPersonalQuestion(question)) {
    const consents = userId ? await getConsents(ctx, userId) : null;
    result = consents?.aiDataAccess
      ? await personalAnswer(ctx, userId!, question, lang)
      : { answer: translate(lang, "ai.personalOff"), mode: "personal", sources: [], usedFields: [], relatedLesson: null, actions: [] };
    await bumpTopic(ctx, "personal-insight");
  } else {
    const hits = searchKnowledge(KNOWLEDGE, question, 3);
    if (!hits.length) {
      result = { answer: translate(lang, "ai.lowConfidence"), mode: "low-confidence", sources: [], usedFields: [], relatedLesson: null, actions: [] };
      await bumpTopic(ctx, "unanswered");
    } else {
      const top = hits[0]!.entry;
      await bumpTopic(ctx, top.id);
      result = knowledgeAnswer(top, lang);
      if (ctx.ai) {
        const context = hits.map((h) => `### ${h.entry.question.en}\n${h.entry.answer[lang]}\nSources: ${h.entry.sources.map((s) => `${s.name} (${s.url})`).join("; ")}`).join("\n\n");
        try {
          const history = (input.history ?? []).slice(-6);
          const text = await ctx.ai.complete(SYSTEM_PROMPT(lang), [...history, { role: "user", content: `Verified context:\n${context}\n\nQuestion: ${question}` }]);
          result = { ...result, answer: text, mode: "llm", sources: hits.flatMap((h) => h.entry.sources.map((s) => ({ ...s, lastReviewed: h.entry.lastReviewed }))).filter((s, i, a) => a.findIndex((x) => x.url === s.url) === i) };
        } catch {
          // Provider unavailable: the verified knowledge answer is already in `result`.
        }
      }
    }
  }

  if (userId) await saveHistory(ctx, userId, question, result);
  return result;
}

async function saveHistory(ctx: AppContext, userId: string, question: string, result: AiAnswerDTO) {
  const consents = await getConsents(ctx, userId);
  if (!consents.aiHistory) return;
  let [conv] = await ctx.db.select().from(schema.aiConversations).where(eq(schema.aiConversations.userId, userId)).limit(1);
  if (!conv) [conv] = await ctx.db.insert(schema.aiConversations).values({ userId }).returning();
  await ctx.db.insert(schema.aiMessages).values([
    { conversationId: conv!.id, role: "user", contentEnc: ctx.cipher.encrypt(question)! },
    { conversationId: conv!.id, role: "assistant", contentEnc: ctx.cipher.encrypt(result.answer)!, mode: result.mode, sources: result.sources },
  ]);
}

export async function getHistory(ctx: AppContext, userId: string) {
  const [conv] = await ctx.db.select().from(schema.aiConversations).where(eq(schema.aiConversations.userId, userId)).limit(1);
  if (!conv) return [];
  const msgs = await ctx.db.select().from(schema.aiMessages).where(eq(schema.aiMessages.conversationId, conv.id)).orderBy(schema.aiMessages.createdAt);
  return msgs.map((m) => ({ role: m.role, content: ctx.cipher.decrypt(m.contentEnc) ?? "", mode: m.mode, sources: m.sources, createdAt: m.createdAt.toISOString() }));
}
