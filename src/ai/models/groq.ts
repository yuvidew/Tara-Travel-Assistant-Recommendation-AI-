import { ChatGroq } from "@langchain/groq";

export function createGroqModel() {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GROQ_API_KEY");
  }

  return new ChatGroq({
    apiKey,
    maxTokens: 900,
    model: "llama-3.1-8b-instant",
    temperature: 0.6,
  });
}
