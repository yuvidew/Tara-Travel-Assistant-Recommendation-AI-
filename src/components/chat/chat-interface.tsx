"use client";

import { Sparkles } from "lucide-react";
import * as React from "react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageList } from "@/components/chat/message-list";
import { ModeToggle } from "@/components/theme/mode-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createChatMessage,
  type LocalChatMessage,
  useLocalChatHistory,
} from "@/hooks/use-local-chat-history";

type PreferredModel = "auto" | "gemini" | "mistral" | "groq";

type ChatApiResponse = {
  answer?: string;
  agent?: "gemini" | "mistral" | "groq";
  agentLabel?: string;
  matchedBudgets?: string[];
  matchedDestinations?: string[];
  matchedRoutes?: string[];
  usedFallback?: boolean;
  error?: string;
};

const modelOptions: Array<{ label: string; value: PreferredModel }> = [
  { label: "Auto", value: "auto" },
  { label: "Gemini", value: "gemini" },
  { label: "Mistral", value: "mistral" },
  { label: "Groq", value: "groq" },
];

function toRecentMessages(messages: LocalChatMessage[]) {
  return messages.slice(-10).map((message) => ({
    content: message.content,
    role: message.role,
  }));
}

export function ChatInterface() {
  const { clearMessages, isLoaded, messages, setMessages } =
    useLocalChatHistory();
  const [isLoading, setIsLoading] = React.useState(false);
  const [selectedModel, setSelectedModel] =
    React.useState<PreferredModel>("auto");

  async function requestAssistantResponse(
    content: string,
    conversationMessages: LocalChatMessage[],
  ) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        body: JSON.stringify({
          message: content,
          preferredModel: selectedModel,
          recentMessages: toRecentMessages(conversationMessages),
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok || (!data.answer && data.error)) {
        throw new Error(
          data.error ?? "The travel assistant could not answer right now.",
        );
      }

      const assistantMessage = createChatMessage({
        agent: data.agent,
        agentLabel: data.agentLabel,
        content:
          data.answer ?? "I could not create a travel answer for that request.",
        matchedBudgets: data.matchedBudgets,
        matchedDestinations: data.matchedDestinations,
        matchedRoutes: data.matchedRoutes,
        role: "assistant",
        usedFallback: data.usedFallback,
      });

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (error) {
      const errorMessage = createChatMessage({
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong while planning your trip.",
        role: "assistant",
        usedFallback: true,
      });

      setMessages((currentMessages) => [...currentMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage(content: string) {
    const userMessage = createChatMessage({ content, role: "user" });
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    await requestAssistantResponse(content, nextMessages);
  }

  async function regenerateMessage(messageId: string) {
    if (isLoading) {
      return;
    }

    const messageIndex = messages.findIndex(
      (message) => message.id === messageId,
    );
    const previousUserMessage = messages
      .slice(0, messageIndex)
      .reverse()
      .find((message) => message.role === "user");

    if (messageIndex < 0 || !previousUserMessage) {
      return;
    }

    const nextMessages = messages.slice(0, messageIndex);
    setMessages(nextMessages);
    await requestAssistantResponse(previousUserMessage.content, nextMessages);
  }

  const hydratedMessages = isLoaded ? messages : ([] as LocalChatMessage[]);
  const hasMessages = hydratedMessages.length > 0;

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="relative flex h-dvh flex-col">
        <header className="border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:px-6">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25">
                <Sparkles className="size-4.5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Tara
                </p>
                <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                  Your AI trip planner
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                disabled={isLoading || !isLoaded}
                onValueChange={(value) => {
                  setSelectedModel(value as PreferredModel);
                }}
                value={selectedModel}
              >
                <SelectTrigger
                  aria-label="Choose travel AI model"
                  className="hidden h-8 rounded-full border-slate-200 bg-white px-3 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 sm:flex"
                  size="sm"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="hidden items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-600 dark:bg-blue-950/50 dark:text-blue-300 sm:flex">
                <span className="size-1.5 rounded-full bg-blue-500 dark:bg-blue-300" />
                Online
              </div>
              <ModeToggle />
            </div>
          </div>
        </header>
        <MessageList
          isLoading={isLoading || !isLoaded}
          messages={hydratedMessages}
          onPromptSelect={sendMessage}
          onRegenerate={regenerateMessage}
        />
        <ChatComposer
          disabled={isLoading || !isLoaded}
          hasMessages={hasMessages}
          onClear={clearMessages}
          onSend={sendMessage}
        />
      </div>
    </main>
  );
}
