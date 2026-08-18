import type { Book } from "./book-types";
import type { AiKeys } from "./ai-keys";

const LIBRARY_KEY = "anybook.library.v1";
const KEYS_KEY = "anybook.keys.v1";

export function loadLibrary(): Book[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(localStorage.getItem(LIBRARY_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as Book[]) : [];
  } catch {
    return [];
  }
}

export function saveToLibrary(book: Book): Book[] {
  const next = [book, ...loadLibrary().filter((existing) => existing.id !== book.id)].slice(0, 40);
  if (typeof window !== "undefined") localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
  return next;
}

export function removeFromLibrary(id: string): Book[] {
  const next = loadLibrary().filter((book) => book.id !== id);
  if (typeof window !== "undefined") localStorage.setItem(LIBRARY_KEY, JSON.stringify(next));
  return next;
}

export function loadKeys(): AiKeys {
  if (typeof window === "undefined") return { searchProvider: "none" };
  try {
    const parsed = JSON.parse(localStorage.getItem(KEYS_KEY) ?? "{}") as AiKeys;
    return { searchProvider: "none", ...parsed };
  } catch {
    return { searchProvider: "none" };
  }
}

export function saveKeys(keys: AiKeys): void {
  if (typeof window !== "undefined") localStorage.setItem(KEYS_KEY, JSON.stringify(keys));
}
