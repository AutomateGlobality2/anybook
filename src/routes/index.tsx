import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/pages/HomePage";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AnyBook — any book in the world, written and downloadable" },
      {
        name: "description",
        content:
          "Name any book and AnyBook writes it chapter by chapter, then exports it as PDF, EPUB, DOCX and more. Read almost any document offline.",
      },
      { property: "og:title", content: "AnyBook — any book, written for you" },
      {
        property: "og:description",
        content: "AI book generator with web search, 9 export formats and a 20-format offline reader.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
