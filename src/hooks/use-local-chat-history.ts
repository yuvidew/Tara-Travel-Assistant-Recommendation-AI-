"use client";

import * as React from "react";

export type LocalChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  agent?: "gemini" | "mistral" | "groq";
  agentLabel?: string;
  matchedBudgets?: string[];
  matchedDestinations?: string[];
  matchedRoutes?: string[];
  usedFallback?: boolean;
};

const storageKey = "tara-travel-chat-history";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function parseStoredMessages(stored: string) {
  try {
    const parsed = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (message): message is LocalChatMessage =>
        Boolean(message) &&
        typeof message === "object" &&
        "id" in message &&
        "role" in message &&
        "content" in message &&
        "createdAt" in message &&
        typeof message.id === "string" &&
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        typeof message.createdAt === "string",
    );
  } catch {
    window.localStorage.removeItem(storageKey);
    return [];
  }
}

export function createChatMessage(
  message: Omit<LocalChatMessage, "id" | "createdAt">,
): LocalChatMessage {
  return {
    ...message,
    createdAt: new Date().toISOString(),
    id: createId(),
  };
}

export function useLocalChatHistory() {
  const [messages, setMessages] = React.useState<LocalChatMessage[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setMessages(parseStoredMessages(stored));
      }
    } finally {
      setIsLoaded(true);
    }
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(messages.slice(-50)),
      );
    }
  }, [isLoaded, messages]);

  const clearMessages = React.useCallback(() => {
    setMessages([]);
    window.localStorage.removeItem(storageKey);
  }, []);

  return {
    clearMessages,
    isLoaded,
    messages,
    setMessages,
  };
}
