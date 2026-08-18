import { createFileRoute } from "@tanstack/react-router";

import { ReaderPage } from "@/pages/ReaderPage";

export const Route = createFileRoute("/reader")({
  head: () => ({
    meta: [
      { title: "AnyBook Reader — open almost any document offline" },
      {
        name: "description",
        content:
          "Open EPUB, PDF, DOCX, FB2, RTF, Markdown and 15 more formats right in your browser, even offline.",
      },
      { property: "og:title", content: "AnyBook Reader" },
      { property: "og:description", content: "A universal document reader for 20+ formats." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReaderPage,
});
