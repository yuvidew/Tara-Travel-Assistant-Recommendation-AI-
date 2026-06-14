export type TravelAgent = "gemini" | "mistral" | "groq";

const itineraryKeywords = [
  "itinerary",
  "day",
  "days",
  "plan",
  "tour",
  "route",
  "road trip",
  "trip",
  "from",
  " to ",
];
const budgetKeywords = [
  "budget",
  "cheap",
  "affordable",
  "under",
  "cost",
  "low price",
  "economical",
  "rupees",
  "inr",
];
const simpleAdviceKeywords = [
  "pack",
  "packing",
  "wear",
  "tips",
  "safe",
  "food",
  "weather general",
  "best time",
];

export function selectTravelAgent(
  message: string,
  preferredModel: TravelAgent | "auto" = "auto",
): TravelAgent {
  if (preferredModel !== "auto") {
    return preferredModel;
  }

  const text = message.toLowerCase();

  if (itineraryKeywords.some((keyword) => text.includes(keyword))) {
    return "gemini";
  }

  if (budgetKeywords.some((keyword) => text.includes(keyword))) {
    return "mistral";
  }

  if (simpleAdviceKeywords.some((keyword) => text.includes(keyword))) {
    return "groq";
  }

  return "groq";
}

export function getAgentLabel(agent: TravelAgent) {
  if (agent === "gemini") {
    return "Gemini itinerary agent";
  }

  if (agent === "mistral") {
    return "Mistral recommendation agent";
  }

  return "Groq quick-answer agent";
}
