// Browser-safe mirror of the server engine's key shape. Keys the reader pastes
// stay in their own browser and are only forwarded to our server function for
// the duration of one generation call.

export type AiKeys = {
  searchProvider?: "tavily" | "serper" | "brave" | "none";
  searchKey?: string;
  geminiKey?: string;
  geminiModel?: string;
  openaiKey?: string;
  openaiModel?: string;
};

export const SEARCH_PROVIDERS: { value: NonNullable<AiKeys["searchProvider"]>; label: string; help: string }[] = [
  { value: "none", label: "No web search", help: "Skip straight to the model's own knowledge" },
  { value: "tavily", label: "Tavily", help: "tavily.com — free tier, best for research" },
  { value: "serper", label: "Serper (Google)", help: "serper.dev — free 2,500 queries" },
  { value: "brave", label: "Brave Search", help: "brave.com/search/api — free tier" },
];

export function describeLadder(keys: AiKeys): string[] {
  const steps: string[] = [];
  if (keys.searchProvider && keys.searchProvider !== "none" && keys.searchKey) {
    steps.push(`1. Web search via ${keys.searchProvider} → researched facts`);
  } else {
    steps.push("1. Web search — not configured (skipped)");
  }
  if (keys.geminiKey) steps.push(`2. Your Gemini key (${keys.geminiModel || "gemini-2.5-flash"})`);
  if (keys.openaiKey) steps.push(`${keys.geminiKey ? 3 : 2}. Your OpenAI key (${keys.openaiModel || "gpt-4o-mini"})`);
  steps.push(`${steps.length + 1}. Lovable AI — always-on fallback`);
  return steps;
}
