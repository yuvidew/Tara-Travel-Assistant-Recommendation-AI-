import { ChatMistralAI } from "@langchain/mistralai";

export function createMistralModel() {
  const apiKey = process.env.MISTRAL_API_KEY;

  if (!apiKey) {
    throw new Error("Missing MISTRAL_API_KEY");
  }

  return new ChatMistralAI({
    apiKey,
    maxTokens: 1000,
    model: "mistral-small-latest",
    temperature: 0.65,
  });
}
