import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { writeChapterImpl } from "@/lib/anybook.server";

const cors = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "POST, OPTIONS",
  "content-type": "application/json",
};

const keysSchema = z.object({
  searchProvider: z.enum(["tavily", "serper", "brave", "none"]).optional(),
  searchKey: z.string().max(400).optional(),
  geminiKey: z.string().max(400).optional(),
  geminiModel: z.string().max(120).optional(),
  openaiKey: z.string().max(400).optional(),
  openaiModel: z.string().max(120).optional(),
});

const schema = z.object({
  bookTitle: z.string().min(1).max(300),
  author: z.string().max(200).optional(),
  style: z.string().max(60),
  language: z.string().max(60),
  words: z.number().int().min(400).max(3000),
  index: z.number().int().min(0),
  total: z.number().int().min(1),
  chapterTitle: z.string().max(300),
  chapterSummary: z.string().max(2000),
  previousSummary: z.string().max(4000).optional(),
  outline: z.array(z.string().max(300)).max(40),
  keys: keysSchema,
});

export const Route = createFileRoute("/api/public/anybook/chapter")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const data = schema.parse(await request.json());
          const result = await writeChapterImpl(data);
          return new Response(JSON.stringify(result), { headers: cors });
        } catch (error) {
          return new Response(JSON.stringify({ error: (error as Error).message }), {
            status: 400,
            headers: cors,
          });
        }
      },
    },
  },
});
