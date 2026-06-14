import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export function createGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY");
  }

  return new ChatGoogleGenerativeAI({
    apiKey,
    maxOutputTokens: 1200,
    model: "gemini-2.5-flash",
    temperature: 0.7,
  });
}
