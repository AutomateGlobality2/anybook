import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { planBookImpl } from "@/lib/anybook.server";

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
  title: z.string().min(1).max(300),
  author: z.string().max(200).optional(),
  style: z.string().min(1).max(60),
  language: z.string().min(1).max(60),
  chapters: z.number().int().min(3).max(30),
  notes: z.string().max(2000).optional(),
  keys: keysSchema,
});

export const Route = createFileRoute("/api/public/anybook/plan")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      POST: async ({ request }) => {
        try {
          const data = schema.parse(await request.json());
          const result = await planBookImpl(data);
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
