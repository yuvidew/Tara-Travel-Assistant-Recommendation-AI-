"use client";

import { Sparkles } from "lucide-react";
import * as React from "react";
import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageList } from "@/components/chat/message-list";
import { ModeToggle } from "@/components/theme/mode-toggle";
import {
  createChatMessage,
  type LocalChatMessage,
  useLocalChatHistory,
} from "@/hooks/use-local-chat-history";

type ChatApiResponse = {
  answer?: string;
  agentLabel?: string;
  usedFallback?: boolean;
  error?: string;
};

export function ChatInterface() {
  const { clearMessages, isLoaded, messages, setMessages } =
    useLocalChatHistory();
  const [isLoading, setIsLoading] = React.useState(false);

  async function sendMessage(content: string) {
    const userMessage = createChatMessage({ content, role: "user" });
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const recentMessages = nextMessages.slice(-10).map((message) => ({
        content: message.content,
        role: message.role,
      }));

      const response = await fetch("/api/chat", {
        body: JSON.stringify({
          message: content,
          preferredModel: "auto",
          recentMessages,
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
        agentLabel: data.agentLabel,
        content:
          data.answer ?? "I could not create a travel answer for that request.",
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

  const hydratedMessages = isLoaded ? messages : ([] as LocalChatMessage[]);

  return (
    <main className="relative flex min-h-dvh flex-1 flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-50">
      <div className="relative flex h-dvh flex-col">
        <header className="border-b border-slate-100 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 md:px-6">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25">
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
        />
        <ChatComposer
          disabled={isLoading || !isLoaded}
          onClear={clearMessages}
          onSend={sendMessage}
        />
      </div>
    </main>
  );
}
