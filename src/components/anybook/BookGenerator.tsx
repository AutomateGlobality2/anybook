import { useEffect, useState } from "react";
import { BookOpen, Loader2, Sparkles, Timer } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { callApi } from "@/lib/api";
import {
  BOOK_LENGTHS,
  BOOK_STYLES,
  type Book,
  type BookLength,
  type BookStyle,
} from "@/lib/book-types";
import type { AiKeys } from "@/lib/ai-keys";
import { addUsage, formatSeconds, secondsLeft } from "@/lib/usage";
import { saveToLibrary } from "@/lib/storage";

type PlanResult = {
  meta: Omit<Book, "id" | "chapters" | "sources" | "provider" | "generatedAt">;
  outline: { title: string; summary: string }[];
  sources: Book["sources"];
  provider: string;
};

export function BookGenerator({
  keys,
  onBook,
  onLimit,
}: {
  keys: AiKeys;
  onBook: (book: Book) => void;
  onLimit: () => void;
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [style, setStyle] = useState<BookStyle>("faithful");
  const [length, setLength] = useState<BookLength>("standard");
  const [language, setLanguage] = useState("English");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [left, setLeft] = useState<number | null>(null);

  // Show the real remaining free time for today (localStorage is client-only).
  useEffect(() => {
    setLeft(secondsLeft());
  }, []);



  async function run() {
    if (!title.trim()) {
      toast.error("Type the name of the book you want.");
      return;
    }
    if (secondsLeft() <= 0) {
      onLimit();
      return;
    }

    const startedAt = Date.now();
    setBusy(true);
    setProgress(2);
    setStatus("Researching the book…");

    try {
      const spec = BOOK_LENGTHS[length];
      const planned = await callApi<PlanResult>("plan", {
          title: title.trim(),
          author: author.trim() || undefined,
          style,
          language,
          chapters: spec.chapters,
        notes: notes.trim() || undefined,
        keys,
      });

      setStatus(`Outline ready — ${planned.outline.length} chapters. ${planned.provider}`);
      const chapters: Book["chapters"] = [];
      const outlineTitles = planned.outline.map((chapter) => chapter.title);

      for (const [index, chapter] of planned.outline.entries()) {
        setStatus(`Writing chapter ${index + 1}/${planned.outline.length}: ${chapter.title}`);
        const written = await callApi<{ content: string }>("chapter", {
            bookTitle: planned.meta.title,
            author: planned.meta.author,
            style,
            language,
            words: spec.words,
            index,
            total: planned.outline.length,
            chapterTitle: chapter.title,
            chapterSummary: chapter.summary,
            previousSummary: chapters
              .slice(-2)
              .map((previous) => `${previous.title}: ${previous.summary}`)
              .join(" "),
          outline: outlineTitles,
          keys,
        });
        chapters.push({ title: chapter.title, summary: chapter.summary, content: written.content });
        setProgress(Math.round(((index + 1) / planned.outline.length) * 100));

        const used = (Date.now() - startedAt) / 1000;
        if (secondsLeft() - used <= 0 && index + 1 < planned.outline.length) {
          setLeft(0);
          toast.warning("Free time for today ran out — keeping the chapters written so far.");
          break;
        }

      }

      const book: Book = {
        ...planned.meta,
        id: `${Date.now()}`,
        chapters,
        sources: planned.sources,
        provider: planned.provider,
        generatedAt: new Date().toISOString(),
      };
      saveToLibrary(book);
      onBook(book);
      setStatus(`Done — ${chapters.length} chapters.`);
      toast.success(`"${book.title}" is ready to download.`);
    } catch (error) {
      toast.error((error as Error).message || "Generation failed.");
      setStatus("Failed — try again, or add a key in the AI proxy box.");
    } finally {
      const used = (Date.now() - startedAt) / 1000;
      const state = addUsage(used);
      setLeft(Math.max(0, 300 - state.seconds));
      setBusy(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-muted-foreground" />
        <h2 className="font-semibold text-card-foreground">Make any book</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Name a real book and AnyBook reconstructs it chapter by chapter, or describe one that
        doesn't exist yet and it writes it from nothing.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="title">Book name or idea</Label>
          <Input
            id="title"
            placeholder="e.g. Meditations by Marcus Aurelius"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="author">Author (optional)</Label>
          <Input
            id="author"
            placeholder="Leave blank to detect"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Edition style</Label>
          <Select value={style} onValueChange={(value) => setStyle(value as BookStyle)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BOOK_STYLES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} — {option.hint}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Length</Label>
          <Select value={length} onValueChange={(value) => setLength(value as BookLength)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(BOOK_LENGTHS).map(([value, spec]) => (
                <SelectItem key={value} value={value}>
                  {spec.label} · ~{spec.words} words each
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label htmlFor="notes">Extra instructions (optional)</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="Keep the original chapter order, add a translator's note, simplify for a 12-year-old…"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button onClick={run} disabled={busy}>
          {busy ? <Loader2 className="mr-1.5 size-4 animate-spin" /> : <BookOpen className="mr-1.5 size-4" />}
          {busy ? "Writing…" : "Write the whole book"}
        </Button>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Timer className="size-4" />
          Free today: {formatSeconds(left ?? 300)} left
        </span>
      </div>

      {(busy || progress > 0) && (
        <div className="mt-4 space-y-2">
          <Progress value={progress} />
          <p className="text-sm text-muted-foreground">{status}</p>
        </div>
      )}
    </div>
  );
}
