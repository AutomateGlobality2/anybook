import { generate, extractJson, type AiKeys } from "./ai-engine.server";
import type { BookPlan, BookSource } from "./book-types";

const STYLE_GUIDE: Record<string, string> = {
  faithful:
    "Reconstruct the real, existing book as faithfully and completely as possible: same structure, same chapter order, same arguments, same tone and voice, same examples. Where exact wording is protected, reproduce the substance chapter by chapter in the author's voice so nothing is lost.",
  novel: "Write as literary fiction: scenes, dialogue, sensory detail, character arcs, chapter cliffhangers.",
  textbook:
    "Write as an academic textbook: learning objectives, definitions, worked examples, diagrams described in text, chapter summary, exercises with answers.",
  guide: "Write as a practical guide: short sections, numbered steps, checklists, pitfalls, templates.",
  biography: "Write as a researched biography: chronological, dated, factual, with context and quoted sources.",
  children: "Write for young readers: simple sentences, warm voice, short chapters, gentle lessons.",
};

function systemPrompt(language: string, style: string): string {
  return [
    "You are AnyBook, a master book-writing engine. You produce complete, publication-quality books.",
    `Write in ${language}.`,
    STYLE_GUIDE[style] ?? STYLE_GUIDE["guide"],
    "Never mention that you are an AI. Never leave placeholders, TODOs, or 'this chapter would cover'. Write real, finished prose.",
  ].join(" ");
}

type PlanInput = {
  title: string;
  author?: string | undefined;
  style: string;
  language: string;
  chapters: number;
  notes?: string | undefined;
  keys: AiKeys;
};

export async function planBookImpl(input: PlanInput): Promise<BookPlan> {
  const user = [
    `Book requested: "${input.title}"${input.author ? ` by ${input.author}` : ""}.`,
    input.notes ? `Reader's extra instructions: ${input.notes}` : "",
    `Produce a complete plan with exactly ${input.chapters} chapters.`,
    "If this is a real, existing book, identify the real author, real publication year, and the real chapter structure, and use them.",
    "Return ONLY JSON of this exact shape:",
    `{"title":"...","author":"...","subject":"...","description":"2-4 sentence back-cover blurb","isReal":true|false,"chapters":[{"title":"...","summary":"2-3 sentences of exactly what this chapter contains"}]}`,
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generate(systemPrompt(input.language, input.style), user, input.keys, {
    researchQuery: `"${input.title}" ${input.author ?? ""} book chapters summary contents author`,
  });

  const parsed = extractJson<{
    title?: string;
    author?: string | undefined;
    subject?: string;
    description?: string;
    isReal?: boolean;
    chapters?: { title?: string; summary?: string }[];
  }>(result.text);

  const outline = (parsed.chapters ?? [])
    .slice(0, input.chapters)
    .map((chapter, index) => ({
      title: chapter.title?.trim() || `Chapter ${index + 1}`,
      summary: chapter.summary?.trim() || "",
    }));

  while (outline.length < input.chapters) {
    outline.push({ title: `Chapter ${outline.length + 1}`, summary: "" });
  }

  return {
    meta: {
      title: parsed.title?.trim() || input.title,
      author: parsed.author?.trim() || input.author || "AnyBook Press",
      subject: parsed.subject?.trim() || input.title,
      description: parsed.description?.trim() || "",
      language: input.language,
      style: input.style as BookPlan["meta"]["style"],
      isReal: Boolean(parsed.isReal),
    },
    outline,
    sources: dedupeSources(result.sources),
    provider: `${result.provider} · ${result.notes.join(" | ")}`,
  };
}

type ChapterInput = {
  bookTitle: string;
  author?: string | undefined;
  style: string;
  language: string;
  words: number;
  index: number;
  total: number;
  chapterTitle: string;
  chapterSummary: string;
  previousSummary?: string | undefined;
  outline: string[];
  keys: AiKeys;
};

export async function writeChapterImpl(input: ChapterInput): Promise<{
  content: string;
  provider: string;
  sources: BookSource[];
}> {
  const user = [
    `Book: "${input.bookTitle}"${input.author ? ` by ${input.author}` : ""}.`,
    `Full outline: ${input.outline.map((t, i) => `${i + 1}. ${t}`).join(" | ")}`,
    input.previousSummary ? `What happened so far: ${input.previousSummary}` : "",
    `Now write chapter ${input.index + 1} of ${input.total}: "${input.chapterTitle}".`,
    input.chapterSummary ? `This chapter must cover: ${input.chapterSummary}` : "",
    `Target length: about ${input.words} words. Write the full chapter word by word, complete and finished.`,
    "Format as Markdown. Do NOT repeat the chapter heading — start directly with the prose. Use ### for internal sections only when it genuinely helps.",
  ]
    .filter(Boolean)
    .join("\n");

  const result = await generate(systemPrompt(input.language, input.style), user, input.keys, {
    ...(input.index % 3 === 0
      ? { researchQuery: `"${input.bookTitle}" ${input.chapterTitle} details facts` }
      : {}),
  });

  return {
    content: result.text.trim(),
    provider: result.provider,
    sources: dedupeSources(result.sources),
  };
}

function dedupeSources(sources: BookSource[]): BookSource[] {
  const seen = new Set<string>();
  return sources.filter((source) => {
    if (!source.url || seen.has(source.url)) return false;
    seen.add(source.url);
    return true;
  });
}
