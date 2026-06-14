"use client";

import * as React from "react";

export type LocalChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  agentLabel?: string;
  usedFallback?: boolean;
};

const storageKey = "tara-travel-chat-history";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
        setMessages(JSON.parse(stored) as LocalChatMessage[]);
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
