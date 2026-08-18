// Client-side export pipeline. Every format is generated in the browser, so no
// server round-trip and no upload of the reader's book.

import { bookToMarkdown, bookToPlainText, slugify, type Book } from "./book-types";

export type ExportFormat =
  | "pdf"
  | "epub"
  | "docx"
  | "md"
  | "txt"
  | "html"
  | "rtf"
  | "json"
  | "fb2";

export const EXPORT_FORMATS: { value: ExportFormat; label: string; hint: string }[] = [
  { value: "pdf", label: "PDF", hint: "Print-ready, opens anywhere" },
  { value: "epub", label: "EPUB", hint: "Reflowable e-reader format" },
  { value: "docx", label: "DOCX", hint: "Word / Google Docs" },
  { value: "md", label: "Markdown", hint: "Plain structured text" },
  { value: "txt", label: "TXT", hint: "Universal plain text" },
  { value: "html", label: "HTML", hint: "Self-contained web book" },
  { value: "rtf", label: "RTF", hint: "Opens in any word processor" },
  { value: "fb2", label: "FB2", hint: "FictionBook e-reader XML" },
  { value: "json", label: "JSON", hint: "Structured data / re-import" },
];

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function markdownToHtml(markdown: string): string {
  const lines = markdown.split("\n");
  const html: string[] = [];
  let inList = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    const inline = escapeXml(line)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|\s)_(.+?)_(?=\s|$)/g, "$1<em>$2</em>");
    if (/^#{1,6}\s/.test(line)) {
      if (inList) (html.push("</ul>"), (inList = false));
      const level = line.match(/^#+/)![0].length;
      html.push(`<h${level}>${inline.replace(/^#{1,6}\s?/, "")}</h${level}>`);
      continue;
    }
    if (/^[-*]\s/.test(line)) {
      if (!inList) (html.push("<ul>"), (inList = true));
      html.push(`<li>${inline.replace(/^[-*]\s/, "")}</li>`);
      continue;
    }
    if (inList) (html.push("</ul>"), (inList = false));
    if (!line.trim()) continue;
    html.push(`<p>${inline}</p>`);
  }
  if (inList) html.push("</ul>");
  return html.join("\n");
}

function bookHtml(book: Book): string {
  return `<!doctype html>
<html lang="${book.language || "en"}"><head><meta charset="utf-8">
<title>${escapeXml(book.title)}</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
body{font-family:Georgia,'Iowan Old Style',serif;max-width:38rem;margin:0 auto;padding:3rem 1.25rem;line-height:1.75;color:#22201c;background:#fbf8f2}
h1{font-size:2.2rem;line-height:1.15}h2{margin-top:3rem;border-top:1px solid #e0d8c8;padding-top:1.5rem}
em.byline{display:block;margin-bottom:2rem;color:#6b6355}
</style></head><body>
<h1>${escapeXml(book.title)}</h1><em class="byline">by ${escapeXml(book.author)}</em>
${markdownToHtml(bookToMarkdown(book).replace(/^# .*$/m, ""))}
</body></html>`;
}

async function exportPdf(book: Book) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a5" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 40;
  const width = pageWidth - margin * 2;
  let y = margin;

  const write = (text: string, size: number, style: "normal" | "bold" | "italic", gap = 6) => {
    doc.setFont("times", style);
    doc.setFontSize(size);
    for (const line of doc.splitTextToSize(text, width) as string[]) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size * 1.45;
    }
    y += gap;
  };

  // Title page
  y = pageHeight / 3;
  write(book.title, 26, "bold", 14);
  write(`by ${book.author}`, 13, "italic", 20);
  if (book.description) write(book.description, 10, "normal");

  for (const [index, chapter] of book.chapters.entries()) {
    doc.addPage();
    y = margin;
    write(`Chapter ${index + 1}`, 10, "italic", 2);
    write(chapter.title, 18, "bold", 12);
    const body = chapter.content
      .replace(/^#{1,6}\s?/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/[*_`]/g, "");
    for (const paragraph of body.split(/\n{2,}/)) {
      if (paragraph.trim()) write(paragraph.trim(), 11, "normal", 8);
    }
  }

  if (book.sources.length) {
    doc.addPage();
    y = margin;
    write("Sources", 16, "bold", 10);
    for (const source of book.sources) write(`• ${source.title} — ${source.url}`, 9, "normal", 4);
  }

  download(doc.output("blob"), `${slugify(book.title)}.pdf`);
}

async function exportDocx(book: Book) {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import("docx");
  const children = [
    new Paragraph({ text: book.title, heading: HeadingLevel.TITLE }),
    new Paragraph({ children: [new TextRun({ text: `by ${book.author}`, italics: true })] }),
    ...(book.description ? [new Paragraph({ text: book.description })] : []),
  ];
  for (const [index, chapter] of book.chapters.entries()) {
    children.push(
      new Paragraph({
        text: `Chapter ${index + 1}: ${chapter.title}`,
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: true,
      }),
    );
    for (const paragraph of chapter.content.split(/\n{2,}/)) {
      const clean = paragraph.replace(/^#{1,6}\s?/gm, "").replace(/[*_`]/g, "").trim();
      if (clean) children.push(new Paragraph({ text: clean }));
    }
  }
  if (book.sources.length) {
    children.push(new Paragraph({ text: "Sources", heading: HeadingLevel.HEADING_1 }));
    for (const source of book.sources) {
      children.push(new Paragraph({ text: `${source.title} — ${source.url}` }));
    }
  }
  const doc = new Document({ sections: [{ children }] });
  download(await Packer.toBlob(doc), `${slugify(book.title)}.docx`);
}

async function exportEpub(book: Book) {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();
  const uid = `urn:uuid:${book.id}`;
  zip.file("mimetype", "application/epub+zip");
  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0"?><container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container"><rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles></container>`,
  );

  const chapterFiles = book.chapters.map((chapter, index) => ({
    id: `ch${index + 1}`,
    href: `ch${index + 1}.xhtml`,
    title: chapter.title,
    body: `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml"><head><title>${escapeXml(chapter.title)}</title></head><body>
<h2>Chapter ${index + 1}: ${escapeXml(chapter.title)}</h2>
${markdownToHtml(chapter.content)}
</body></html>`,
  }));

  for (const file of chapterFiles) zip.file(`OEBPS/${file.href}`, file.body);

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="utf-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="bookid">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="bookid">${uid}</dc:identifier>
<dc:title>${escapeXml(book.title)}</dc:title>
<dc:creator>${escapeXml(book.author)}</dc:creator>
<dc:language>${book.language || "en"}</dc:language>
<meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d+Z$/, "Z")}</meta>
</metadata>
<manifest>
<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
${chapterFiles.map((f) => `<item id="${f.id}" href="${f.href}" media-type="application/xhtml+xml"/>`).join("\n")}
</manifest>
<spine>
${chapterFiles.map((f) => `<itemref idref="${f.id}"/>`).join("\n")}
</spine></package>`,
  );

  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="utf-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops"><head><title>Contents</title></head>
<body><nav epub:type="toc" id="toc"><h1>Contents</h1><ol>
${chapterFiles.map((f) => `<li><a href="${f.href}">${escapeXml(f.title)}</a></li>`).join("\n")}
</ol></nav></body></html>`,
  );

  const blob = await zip.generateAsync({ type: "blob", mimeType: "application/epub+zip" });
  download(blob, `${slugify(book.title)}.epub`);
}

function exportFb2(book: Book) {
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<FictionBook xmlns="http://www.gribuser.ru/xml/fictionbook/2.0">
<description><title-info>
<book-title>${escapeXml(book.title)}</book-title>
<author><nickname>${escapeXml(book.author)}</nickname></author>
<annotation><p>${escapeXml(book.description)}</p></annotation>
<lang>${book.language || "en"}</lang>
</title-info></description>
<body>
${book.chapters
  .map(
    (chapter, index) => `<section><title><p>Chapter ${index + 1}: ${escapeXml(chapter.title)}</p></title>
${chapter.content
  .split(/\n{2,}/)
  .filter((p) => p.trim())
  .map((p) => `<p>${escapeXml(p.replace(/^#{1,6}\s?/gm, "").replace(/[*_`]/g, "").trim())}</p>`)
  .join("\n")}
</section>`,
  )
  .join("\n")}
</body></FictionBook>`;
  download(new Blob([xml], { type: "application/x-fictionbook+xml" }), `${slugify(book.title)}.fb2`);
}

function exportRtf(book: Book) {
  const escape = (value: string) =>
    value.replace(/\\/g, "\\\\").replace(/[{}]/g, "\\$&").replace(/\n/g, "\\par\n");
  const body = [
    `\\b\\fs40 ${escape(book.title)}\\b0\\fs24\\par`,
    `\\i by ${escape(book.author)}\\i0\\par\\par`,
    ...book.chapters.map(
      (chapter, index) =>
        `\\page\\b\\fs32 Chapter ${index + 1}: ${escape(chapter.title)}\\b0\\fs24\\par\\par ${escape(
          chapter.content.replace(/^#{1,6}\s?/gm, "").replace(/[*_`]/g, ""),
        )}\\par`,
    ),
  ].join("\n");
  download(
    new Blob([`{\\rtf1\\ansi\\deff0 ${body}}`], { type: "application/rtf" }),
    `${slugify(book.title)}.rtf`,
  );
}

export async function exportBook(book: Book, format: ExportFormat): Promise<void> {
  const name = slugify(book.title);
  switch (format) {
    case "pdf":
      return exportPdf(book);
    case "docx":
      return exportDocx(book);
    case "epub":
      return exportEpub(book);
    case "fb2":
      return exportFb2(book);
    case "rtf":
      return exportRtf(book);
    case "html":
      return download(new Blob([bookHtml(book)], { type: "text/html" }), `${name}.html`);
    case "md":
      return download(
        new Blob([bookToMarkdown(book)], { type: "text/markdown" }),
        `${name}.md`,
      );
    case "txt":
      return download(new Blob([bookToPlainText(book)], { type: "text/plain" }), `${name}.txt`);
    case "json":
      return download(
        new Blob([JSON.stringify(book, null, 2)], { type: "application/json" }),
        `${name}.json`,
      );
  }
}
