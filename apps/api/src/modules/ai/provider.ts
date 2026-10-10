export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AiProvider {
  name: string;
  complete(system: string, messages: ChatMessage[]): Promise<string>;
}

/** Anthropic Messages API provider. Only receives verified knowledge-base context — never user financial data. */
export class AnthropicProvider implements AiProvider {
  name = "anthropic";
  constructor(
    private apiKey: string,
    private model: string,
    private timeoutMs = 20_000,
  ) {}

  async complete(system: string, messages: ChatMessage[]): Promise<string> {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        signal: ctrl.signal,
        headers: { "content-type": "application/json", "x-api-key": this.apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: this.model, max_tokens: 700, temperature: 0.2, system, messages }),
      });
      if (!res.ok) throw new Error(`AI provider error ${res.status}`);
      const data = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = data.content?.filter((c) => c.type === "text").map((c) => c.text ?? "").join("").trim();
      if (!text) throw new Error("Empty AI response");
      return text;
    } finally {
      clearTimeout(timer);
    }
  }
}
