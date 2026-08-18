// Universal document opener used by /reader. Everything is parsed in the
// browser — nothing is uploaded anywhere.

import { markdownToHtml } from "./exporters";

export type OpenedDocument = {
  name: string;
  kind: "html" | "text" | "embed" | "image" | "unsupported";
  html?: string;
  text?: string;
  url?: string;
  note?: string;
};

const TEXT_EXTENSIONS = [
  "txt",
  "md",
  "markdown",
  "json",
  "csv",
  "tsv",
  "log",
  "xml",
  "yaml",
  "yml",
  "ini",
  "srt",
  "vtt",
  "tex",
  "css",
  "js",
  "ts",
  "py",
  "sql",
  "opf",
  "ncx",
];

export const SUPPORTED_READER_FORMATS = [
  "pdf",
  "epub",
  "docx",
  "fb2",
  "rtf",
  "html",
  "md",
  "txt",
  "json",
  "csv",
  "tsv",
  "xml",
  "yaml",
  "srt",
  "vtt",
  "tex",
  "log",
  "png",
  "jpg",
  "webp",
];

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase() ?? "";
}

export async function openDocument(file: File): Promise<OpenedDocument> {
  const extension = extensionOf(file.name);

  if (extension === "pdf") {
    return { name: file.name, kind: "embed", url: URL.createObjectURL(file) };
  }

  if (["png", "jpg", "jpeg", "webp", "gif", "avif", "bmp", "svg"].includes(extension)) {
    return { name: file.name, kind: "image", url: URL.createObjectURL(file) };
  }

  if (extension === "docx") {
    const mammoth = await import("mammoth");
    const buffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
    return { name: file.name, kind: "html", html: result.value };
  }

  if (extension === "epub") {
    return readEpub(file);
  }

  if (extension === "fb2") {
    const xml = await file.text();
    const paragraphs = [...xml.matchAll(/<p>([\s\S]*?)<\/p>/g)].map((match) =>
      match[1]!.replace(/<[^>]+>/g, "").trim(),
    );
    const titles = [...xml.matchAll(/<book-title>([\s\S]*?)<\/book-title>/g)].map((m) => m[1]);
    return {
      name: file.name,
      kind: "html",
      html: [
        titles[0] ? `<h1>${titles[0]}</h1>` : "",
        ...paragraphs.filter(Boolean).map((p) => `<p>${p}</p>`),
      ].join("\n"),
    };
  }

  if (extension === "rtf") {
    const raw = await file.text();
    const text = raw
      .replace(/\\par[d]?/g, "\n")
      .replace(/\{\\\*?[^{}]*\}/g, "")
      .replace(/\\[a-zA-Z]+-?\d* ?/g, "")
      .replace(/[{}]/g, "")
      .trim();
    return { name: file.name, kind: "text", text };
  }

  if (extension === "html" || extension === "htm" || extension === "xhtml") {
    const raw = await file.text();
    const body = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? raw;
    return { name: file.name, kind: "html", html: sanitize(body) };
  }

  if (extension === "md" || extension === "markdown") {
    return { name: file.name, kind: "html", html: markdownToHtml(await file.text()) };
  }

  if (TEXT_EXTENSIONS.includes(extension)) {
    return { name: file.name, kind: "text", text: await file.text() };
  }

  if (["mobi", "azw", "azw3", "prc"].includes(extension)) {
    const raw = await file.text().catch(() => "");
    const stripped = raw.replace(/<[^>]+>/g, " ").replace(/[^\x20-\x7E\n]/g, " ");
    const readable = stripped.replace(/\s{2,}/g, " ").trim();
    return readable.length > 400
      ? {
          name: file.name,
          kind: "text",
          text: readable,
          note: "Kindle formats are extracted as raw text — layout is approximate.",
        }
      : {
          name: file.name,
          kind: "unsupported",
          note: "This Kindle file is DRM-protected or compressed. Convert it to EPUB or PDF first.",
        };
  }

  // Last resort: if it decodes as text, show it.
  const fallback = await file.text().catch(() => "");
  if (fallback && /^[\s\x20-\x7E\u00A0-\uFFFF]+$/.test(fallback.slice(0, 2000))) {
    return { name: file.name, kind: "text", text: fallback, note: "Opened as plain text." };
  }

  return { name: file.name, kind: "unsupported", note: `AnyBook cannot read .${extension} yet.` };
}

async function readEpub(file: File): Promise<OpenedDocument> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const documents = Object.keys(zip.files)
    .filter((path) => /\.x?html?$/i.test(path) && !/nav|toc/i.test(path))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const parts: string[] = [];
  for (const path of documents) {
    const raw = await zip.files[path]!.async("string");
    const body = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? raw;
    parts.push(sanitize(body));
  }

  if (!parts.length) {
    return { name: file.name, kind: "unsupported", note: "No readable chapters found in this EPUB." };
  }
  return { name: file.name, kind: "html", html: parts.join("\n<hr />\n") };
}

function sanitize(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/ on[a-z]+="[^"]*"/gi, "")
    .replace(/<img[^>]*>/gi, "");
}
