// Server-only AI engine for AnyBook.
//
// Fallback ladder, in order:
//   1. Web search (user's search API key) -> research context, then user's model
//   2. User's own model key (Gemini / OpenAI-compatible) with no research
//   3. Lovable AI (built in, always available)

import type { BookSource } from "./book-types";

export type AiKeys = {
  searchProvider?: "tavily" | "serper" | "brave" | "none" | undefined;
  searchKey?: string | undefined;
  geminiKey?: string | undefined;
  geminiModel?: string | undefined;
  openaiKey?: string | undefined;
  openaiModel?: string | undefined;
};

export type GenerationResult = {
  text: string;
  provider: string;
  sources: BookSource[];
  notes: string[];
};

const LOVABLE_MODEL = "openai/gpt-5.6-sol";

/* ------------------------------- web search ------------------------------- */

export async function research(
  query: string,
  keys: AiKeys,
): Promise<{ context: string; sources: BookSource[]; note: string }> {
  const provider = keys.searchProvider ?? "none";
  if (provider === "none" || !keys.searchKey) {
    return { context: "", sources: [], note: "web search skipped (no key)" };
  }
  try {
    if (provider === "tavily") return await tavily(query, keys.searchKey);
    if (provider === "serper") return await serper(query, keys.searchKey);
    if (provider === "brave") return await brave(query, keys.searchKey);
  } catch (error) {
    return {
      context: "",
      sources: [],
      note: `web search failed (${(error as Error).message}) — falling back`,
    };
  }
  return { context: "", sources: [], note: "web search skipped" };
}

async function tavily(query: string, key: string) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      api_key: key,
      query,
      search_depth: "advanced",
      max_results: 8,
      include_answer: true,
    }),
  });
  if (!res.ok) throw new Error(`tavily ${res.status}`);
  const data = (await res.json()) as {
    answer?: string;
    results?: { title: string; url: string; content: string }[];
  };
  const results = data.results ?? [];
  return {
    context: [data.answer ?? "", ...results.map((r) => `${r.title}: ${r.content}`)]
      .filter(Boolean)
      .join("\n\n")
      .slice(0, 12_000),
    sources: results.map((r) => ({ title: r.title, url: r.url })),
    note: `web search: tavily (${results.length} sources)`,
  };
}

async function serper(query: string, key: string) {
  const res = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: { "content-type": "application/json", "X-API-KEY": key },
    body: JSON.stringify({ q: query, num: 10 }),
  });
  if (!res.ok) throw new Error(`serper ${res.status}`);
  const data = (await res.json()) as {
    organic?: { title: string; link: string; snippet?: string }[];
  };
  const results = data.organic ?? [];
  return {
    context: results.map((r) => `${r.title}: ${r.snippet ?? ""}`).join("\n\n").slice(0, 12_000),
    sources: results.map((r) => ({ title: r.title, url: r.link })),
    note: `web search: serper (${results.length} sources)`,
  };
}

async function brave(query: string, key: string) {
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
    { headers: { Accept: "application/json", "X-Subscription-Token": key } },
  );
  if (!res.ok) throw new Error(`brave ${res.status}`);
  const data = (await res.json()) as {
    web?: { results?: { title: string; url: string; description?: string }[] };
  };
  const results = data.web?.results ?? [];
  return {
    context: results.map((r) => `${r.title}: ${r.description ?? ""}`).join("\n\n").slice(0, 12_000),
    sources: results.map((r) => ({ title: r.title, url: r.url })),
    note: `web search: brave (${results.length} sources)`,
  };
}

/* --------------------------------- models --------------------------------- */

async function callGemini(system: string, user: string, keys: AiKeys): Promise<string> {
  const model = keys.geminiModel?.trim() || "gemini-2.5-flash";
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
    {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": keys.geminiKey! },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: "user", parts: [{ text: user }] }],
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!text.trim()) throw new Error("gemini returned empty text");
  return text;
}

async function callOpenAiCompatible(
  system: string,
  user: string,
  apiKey: string,
  model: string,
  baseUrl: string,
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: { "content-type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });
  if (!res.ok) throw new Error(`${baseUrl} ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("model returned empty text");
  return text;
}

/**
 * Runs the full ladder and reports which rung produced the answer.
 */
export async function generate(
  system: string,
  user: string,
  keys: AiKeys,
  options: { researchQuery?: string | undefined } = {},
): Promise<GenerationResult> {
  const notes: string[] = [];
  let sources: BookSource[] = [];
  let context = "";

  if (options.researchQuery) {
    const found = await research(options.researchQuery, keys);
    notes.push(found.note);
    sources = found.sources;
    context = found.context;
  }

  const prompt = context
    ? `${user}\n\n---\nVERIFIED WEB RESEARCH (use these facts, cite where relevant):\n${context}`
    : user;

  const attempts: { label: string; run: () => Promise<string> }[] = [];
  if (keys.geminiKey?.trim()) {
    attempts.push({
      label: `your Gemini key (${keys.geminiModel?.trim() || "gemini-2.5-flash"})`,
      run: () => callGemini(system, prompt, keys),
    });
  }
  if (keys.openaiKey?.trim()) {
    attempts.push({
      label: `your OpenAI key (${keys.openaiModel?.trim() || "gpt-4o-mini"})`,
      run: () =>
        callOpenAiCompatible(
          system,
          prompt,
          keys.openaiKey!,
          keys.openaiModel?.trim() || "gpt-4o-mini",
          "https://api.openai.com/v1",
        ),
    });
  }
  attempts.push({
    label: "Lovable AI (built-in fallback)",
    run: () => {
      const apiKey = process.env["LOVABLE_API_KEY"];
      if (!apiKey) throw new Error("LOVABLE_API_KEY missing");
      return callOpenAiCompatible(
        system,
        prompt,
        apiKey,
        LOVABLE_MODEL,
        "https://ai.gateway.lovable.dev/v1",
      );
    },
  });

  let lastError: Error | undefined;
  for (const attempt of attempts) {
    try {
      const text = await attempt.run();
      notes.push(`wrote with ${attempt.label}`);
      return { text, provider: attempt.label, sources, notes };
    } catch (error) {
      lastError = error as Error;
      notes.push(`${attempt.label} failed: ${lastError.message}`);
    }
  }
  throw new Error(`All AI providers failed. ${lastError?.message ?? ""}`);
}

export function extractJson<T>(text: string): T {
  const cleaned = text
    .replace(/^```(?:json)?/gm, "")
    .replace(/```$/gm, "")
    .trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const candidate = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  return JSON.parse(candidate) as T;
}
