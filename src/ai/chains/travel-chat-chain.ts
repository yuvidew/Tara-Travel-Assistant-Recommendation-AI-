import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { createGeminiModel } from "@/ai/models/gemini";
import { createGroqModel } from "@/ai/models/groq";
import { createMistralModel } from "@/ai/models/mistral";
import { buildTravelSystemPrompt } from "@/ai/prompts/travel-prompts";
import {
  getAgentLabel,
  selectTravelAgent,
  type TravelAgent,
} from "@/ai/router";
import { searchTravelData } from "@/lib/travel-data/search";
import type { ChatMessage } from "@/lib/validation/chat";

type RunTravelChatInput = {
  message: string;
  recentMessages: ChatMessage[];
  preferredModel?: TravelAgent | "auto";
};

function stringifyContent(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return "";
}

function toLangChainHistory(messages: ChatMessage[]) {
  return messages.slice(-10).map((message) => {
    if (message.role === "assistant") {
      return new AIMessage(message.content);
    }

    return new HumanMessage(message.content);
  });
}

function buildFallbackAnswer(
  message: string,
  _agent: TravelAgent,
  context: string,
) {
  const isDurgDelhi =
    message.toLowerCase().includes("durg") &&
    message.toLowerCase().includes("delhi");

  if (isDurgDelhi) {
    return `A Durg to Delhi road tour can be planned as a heritage-style journey through central and north India. Here is a solid first route using the local starter data:

**Gwalior - Forts, Palaces, And Music Heritage**
Stop here after the long Durg-to-Gwalior stretch. The drive is approximately 12-14 hours, so start early and keep meal/fuel breaks flexible.

- Visit: Gwalior Fort, Man Singh Palace, Jai Vilas Palace, Tansen Tomb
- Food: bedai, jalebi, kachori, poha
- Budget: hotels around 2500-5000 INR/night; 1500-2500 INR/person/day

**Agra - Taj Mahal And Mughal History**
From Gwalior, Agra is roughly 2.5-3.5 hours by road.

- Visit: Taj Mahal, Agra Fort, Mehtab Bagh, Itmad-ud-Daulah
- Food: petha, bedai, mughlai food, chaat
- Budget: hotels around 3000-6000 INR/night; 2000-3500 INR/person/day

**Delhi - Old Delhi, Monuments, Markets**
From Agra, Delhi is roughly 3-4 hours by road, with traffic buffer needed near Delhi.

- Visit: Red Fort, Qutub Minar, India Gate, Humayun's Tomb, Chandni Chowk, Dilli Haat
- Food: paratha, chole bhature, kebabs, chaat, momos
- Budget: hotels around 3500-8000 INR/night; 2500-4500 INR/person/day

Suggested duration: 5 days with 1 night in Gwalior, 1 night in Agra, and 2 nights in Delhi. Timings and costs are approximate, so check maps and hotel prices before final booking.

Would you like this as a day-wise itinerary with departure times and overnight stops?`;
  }

  return `I can help with that. Based on the local travel context available, here is a practical travel-planner answer:

${context}

For live details like hotel availability, flight prices, current weather, visa rules, or exact opening hours, please verify with a live source before booking.

Would you like me to turn this into a day-wise itinerary or a budget plan?`;
}

async function invokeAgent(
  agent: TravelAgent,
  messages: Array<SystemMessage | HumanMessage | AIMessage>,
) {
  if (agent === "gemini") {
    return createGeminiModel().invoke(messages);
  }

  if (agent === "mistral") {
    return createMistralModel().invoke(messages);
  }

  return createGroqModel().invoke(messages);
}

export async function runTravelChat({
  message,
  recentMessages,
  preferredModel = "auto",
}: RunTravelChatInput) {
  const agent = selectTravelAgent(message, preferredModel);
  const travelSearch = searchTravelData(message);
  const systemPrompt = buildTravelSystemPrompt({
    agent,
    travelContext: travelSearch.context,
  });
  const history = toLangChainHistory(recentMessages);
  const langChainMessages = [
    new SystemMessage(systemPrompt),
    ...history,
    new HumanMessage(message),
  ];

  try {
    const response = await invokeAgent(agent, langChainMessages);
    const answer = stringifyContent(response.content);

    if (!answer) {
      throw new Error("The selected model returned an empty response.");
    }

    return {
      answer,
      agent,
      agentLabel: getAgentLabel(agent),
      matchedBudgets: travelSearch.budgets.map((budget) => budget.level),
      matchedDestinations: travelSearch.destinations.map(
        (destination) => destination.name,
      ),
      matchedRoutes: travelSearch.routes.map(
        (route) => `${route.origin} to ${route.destination}`,
      ),
      usedFallback: false,
    };
  } catch (error) {
    return {
      answer: buildFallbackAnswer(message, agent, travelSearch.context),
      agent,
      agentLabel: getAgentLabel(agent),
      error:
        error instanceof Error ? error.message : "Unknown AI provider error",
      matchedBudgets: travelSearch.budgets.map((budget) => budget.level),
      matchedDestinations: travelSearch.destinations.map(
        (destination) => destination.name,
      ),
      matchedRoutes: travelSearch.routes.map(
        (route) => `${route.origin} to ${route.destination}`,
      ),
      usedFallback: true,
    };
  }
}
