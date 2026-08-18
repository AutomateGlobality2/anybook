import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { planBookImpl, writeChapterImpl } from "./anybook.server";

const keysSchema = z.object({
  searchProvider: z.enum(["tavily", "serper", "brave", "none"]).optional(),
  searchKey: z.string().optional(),
  geminiKey: z.string().optional(),
  geminiModel: z.string().optional(),
  openaiKey: z.string().optional(),
  openaiModel: z.string().optional(),
});

export const planBook = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        title: z.string().min(1).max(300),
        author: z.string().max(200).optional(),
        style: z.string().min(1),
        language: z.string().min(1),
        chapters: z.number().int().min(3).max(30),
        notes: z.string().max(2000).optional(),
        keys: keysSchema,
      })
      .parse(data),
  )
  .handler(async ({ data }) => planBookImpl(data));

export const writeChapter = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z
      .object({
        bookTitle: z.string().min(1),
        author: z.string().optional(),
        style: z.string(),
        language: z.string(),
        words: z.number().int().min(400).max(3000),
        index: z.number().int().min(0),
        total: z.number().int().min(1),
        chapterTitle: z.string(),
        chapterSummary: z.string(),
        previousSummary: z.string().optional(),
        outline: z.array(z.string()).max(40),
        keys: keysSchema,
      })
      .parse(data),
  )
  .handler(async ({ data }) => writeChapterImpl(data));
