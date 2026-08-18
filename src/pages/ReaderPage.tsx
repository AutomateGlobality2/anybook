import { useState } from "react";
import { FileUp } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { link } from "@/lib/api";
import { openDocument, SUPPORTED_READER_FORMATS, type OpenedDocument } from "@/lib/document-reader";

export function ReaderPage() {
  const [doc, setDoc] = useState<OpenedDocument | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <Toaster />
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <a href={link("/")} className="font-serif text-xl font-semibold text-foreground">
            AnyBook
          </a>
          <Button asChild variant="ghost" size="sm">
            <a href={link("/")}>Generator</a>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-4 py-10">
        <div>
          <h1 className="font-serif text-3xl font-semibold text-foreground">Reader</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Supports {SUPPORTED_READER_FORMATS.join(", ")}. Files never leave your device.
          </p>
        </div>

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <FileUp className="size-6 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Choose a document to open</span>
          <input
            type="file"
            className="hidden"
            onChange={async (event) => {
              const file = event.target.files?.[0];
              if (file) setDoc(await openDocument(file));
            }}
          />
        </label>

        {doc && (
          <article className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-serif text-lg text-card-foreground">{doc.name}</h2>
            {doc.note && <p className="mt-1 text-sm text-muted-foreground">{doc.note}</p>}
            {doc.kind === "embed" && doc.url && (
              <iframe src={doc.url} title={doc.name} className="mt-4 h-[70vh] w-full rounded-lg" />
            )}
            {doc.kind === "image" && doc.url && (
              <img src={doc.url} alt={doc.name} className="mt-4 w-full rounded-lg" />
            )}
            {doc.kind === "html" && doc.html && (
              <div
                className="prose mt-4 max-w-none text-card-foreground"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: doc.html }}
              />
            )}
            {doc.kind === "text" && doc.text && (
              <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-card-foreground">
                {doc.text}
              </pre>
            )}
          </article>
        )}
      </main>
    </div>
  );
}
