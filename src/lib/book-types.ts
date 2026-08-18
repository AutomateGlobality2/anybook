// Browser-safe shared types + prompt builders for AnyBook.

export type BookChapter = {
  title: string;
  summary: string;
  content: string; // markdown
};

export type BookSource = {
  title: string;
  url: string;
};

export type BookMeta = {
  title: string;
  author: string;
  subject: string;
  language: string;
  style: BookStyle;
  description: string;
  coverColor?: string;
  coverImage?: string;
  isReal?: boolean;
};

export type Book = BookMeta & {
  id: string;
  chapters: BookChapter[];
  sources: BookSource[];
  provider: string;
  generatedAt: string;
};

export type BookStyle =
  | "faithful"
  | "novel"
  | "textbook"
  | "guide"
  | "biography"
  | "children";

export const BOOK_STYLES: { value: BookStyle; label: string; hint: string }[] = [
  { value: "faithful", label: "Faithful edition", hint: "Reconstruct the real book as closely as possible" },
  { value: "novel", label: "Novel", hint: "Narrative fiction, scenes and dialogue" },
  { value: "textbook", label: "Textbook", hint: "Structured teaching with examples and exercises" },
  { value: "guide", label: "Practical guide", hint: "Actionable, step-by-step, checklists" },
  { value: "biography", label: "Biography", hint: "Life story, chronological, sourced" },
  { value: "children", label: "Children's book", hint: "Simple language, short chapters" },
];

export type BookLength = "short" | "standard" | "long" | "epic";

export const BOOK_LENGTHS: Record<BookLength, { label: string; chapters: number; words: number }> = {
  short: { label: "Short (6 chapters)", chapters: 6, words: 900 },
  standard: { label: "Standard (12 chapters)", chapters: 12, words: 1300 },
  long: { label: "Long (20 chapters)", chapters: 20, words: 1600 },
  epic: { label: "Epic (30 chapters)", chapters: 30, words: 1800 },
};

export type BookPlan = {
  meta: BookMeta;
  outline: { title: string; summary: string }[];
  sources: BookSource[];
  provider: string;
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "anybook";
}

export function bookWordCount(book: Book): number {
  return book.chapters.reduce(
    (total, chapter) => total + chapter.content.trim().split(/\s+/).filter(Boolean).length,
    0,
  );
}

export function bookToMarkdown(book: Book): string {
  const parts = [
    `# ${book.title}`,
    book.author ? `_by ${book.author}_` : "",
    "",
    book.description,
    "",
    "## Contents",
    ...book.chapters.map((chapter, index) => `${index + 1}. ${chapter.title}`),
    "",
  ];
  for (const [index, chapter] of book.chapters.entries()) {
    parts.push(`\n\n## Chapter ${index + 1}: ${chapter.title}\n`, chapter.content);
  }
  if (book.sources.length) {
    parts.push("\n\n## Sources\n", ...book.sources.map((s) => `- ${s.title} — ${s.url}`));
  }
  return parts.filter(Boolean).join("\n");
}

export function bookToPlainText(book: Book): string {
  return bookToMarkdown(book)
    .replace(/^#{1,6}\s?/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/[*_`>]/g, "");
}
