import { useState } from "react";
import { Download, Library, Lock, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { AiKeysPanel } from "@/components/anybook/AiKeysPanel";
import { BookGenerator } from "@/components/anybook/BookGenerator";
import { InstallPrompt, useInstallRecommendation } from "@/components/anybook/InstallPrompt";
import { EXPORT_FORMATS, exportBook, type ExportFormat } from "@/lib/exporters";
import { PREMADE_BOOKS } from "@/lib/premade-books";
import type { AiKeys } from "@/lib/ai-keys";
import type { Book } from "@/lib/book-types";
import { goToHubLogin, hubLoginUrl, hubUnlockUrl } from "@/lib/hub";
import { link } from "@/lib/api";

export function HomePage() {
  const [keys, setKeys] = useState<AiKeys>({ searchProvider: "none" });
  const [book, setBook] = useState<Book | null>(null);
  const [paywall, setPaywall] = useState(false);
  const install = useInstallRecommendation();

  async function download(target: Book, format: ExportFormat) {
    await exportBook(target, format);
    install.recommend();
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <span className="font-serif text-xl font-semibold text-foreground">AnyBook</span>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <a href={link("/reader")}>
                <FileText className="mr-1.5 size-4" /> Reader
              </a>
            </Button>
            <Button
              size="sm"
              asChild
              onClick={(event) => {
                event.preventDefault();
                goToHubLogin();
              }}
            >
              <a href={hubLoginUrl()}>Sign in at the hub</a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
        <section>
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Any book in the world, written out for you.
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Type a title. AnyBook researches it on the web, writes every chapter, and hands you the
            finished book in the format you want — free for five minutes of writing every day.
          </p>
        </section>

        <BookGenerator keys={keys} onBook={setBook} onLimit={() => setPaywall(true)} />
        <AiKeysPanel onChange={setKeys} />

        {book && (
          <section className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-xl font-semibold text-card-foreground">{book.title}</h2>
            <p className="text-sm text-muted-foreground">
              {book.author} · {book.chapters.length} chapters · written by {book.provider}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {EXPORT_FORMATS.map((format) => (
                <Button
                  key={format.value}
                  size="sm"
                  variant="secondary"
                  onClick={() => download(book, format.value)}
                >
                  <Download className="mr-1.5 size-4" /> {format.label}
                </Button>
              ))}
            </div>
            <div className="mt-5 max-h-96 space-y-4 overflow-y-auto pr-2">
              {book.chapters.map((chapter) => (
                <article key={chapter.title}>
                  <h3 className="font-serif text-lg text-card-foreground">{chapter.title}</h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {chapter.content}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-foreground">
            <Library className="size-5" /> Ready to read now
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PREMADE_BOOKS.map((premade) => (
              <article key={premade.id} className="overflow-hidden rounded-xl border border-border bg-card">
                <img
                  src={premade.coverImage}
                  alt={`Cover of ${premade.title}`}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover"
                />
                <div className="p-3">
                  <h3 className="font-serif text-base text-card-foreground">{premade.title}</h3>
                  <p className="text-xs text-muted-foreground">{premade.author}</p>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2 w-full"
                    onClick={() => download(premade, "pdf")}
                  >
                    <Download className="mr-1.5 size-4" /> PDF
                  </Button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-5">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold text-card-foreground">
            <Lock className="size-5" /> After the free five minutes
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Everyone gets 5 minutes of writing time per day, free. Beyond that you unlock at the hub:
            a Hub Pass covers every tool, or unlock AnyBook alone if it's the only one you need.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <a href={hubUnlockUrl("all")}>Hub Pass — all tools</a>
            </Button>
            <Button asChild size="sm" variant="secondary">
              <a href={hubUnlockUrl("tool")}>Unlock AnyBook only</a>
            </Button>
          </div>
        </section>
      </main>

      {(paywall || install.visible) && install.visible && (
        <InstallPrompt onInstall={install.install} onDismiss={install.dismiss} />
      )}
    </div>
  );
}
