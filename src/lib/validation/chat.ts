import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(1500),
  recentMessages: z.array(chatMessageSchema).max(20).optional().default([]),
  preferredModel: z
    .enum(["gemini", "mistral", "groq", "auto"])
    .optional()
    .default("auto"),
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
