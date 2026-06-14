"use client";

import {
  CalendarDays,
  Luggage,
  Route,
  Sparkles,
  WalletCards,
} from "lucide-react";
import * as React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LocalChatMessage } from "@/hooks/use-local-chat-history";
import { cn } from "@/lib/utils";

type MessageListProps = {
  messages: LocalChatMessage[];
  isLoading: boolean;
};

const travelTasks = [
  {
    icon: Route,
    title: "Route plans",
    text: "Durg to Delhi, Mumbai to Goa",
  },
  {
    icon: WalletCards,
    title: "Budget ideas",
    text: "Trips by cost, comfort, and pace",
  },
  {
    icon: CalendarDays,
    title: "Itineraries",
    text: "Day-wise plans and stopovers",
  },
  {
    icon: Luggage,
    title: "Travel prep",
    text: "Packing, food, and local tips",
  },
];

function formatTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(undefined, {
    day: "numeric",
    hour: "numeric",
    hour12: true,
    minute: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function MarkdownMessage({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      skipHtml
      components={{
        a: ({ className, ...props }) => (
          <a
            className={cn(
              "font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-200",
              className,
            )}
            rel="noreferrer"
            target="_blank"
            {...props}
          />
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote
            className={cn(
              "my-3 border-l-4 border-blue-200 bg-blue-50 py-2 pl-3 text-slate-600 dark:border-blue-900 dark:bg-blue-950/30 dark:text-slate-300",
              className,
            )}
            {...props}
          />
        ),
        h1: ({ className, ...props }) => (
          <h1
            className={cn(
              "mt-4 mb-2 text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50",
              className,
            )}
            {...props}
          />
        ),
        h2: ({ className, ...props }) => (
          <h2
            className={cn(
              "mt-4 mb-2 text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50",
              className,
            )}
            {...props}
          />
        ),
        h3: ({ className, ...props }) => (
          <h3
            className={cn(
              "mt-3 mb-1.5 text-base font-bold tracking-tight text-slate-900 dark:text-slate-50",
              className,
            )}
            {...props}
          />
        ),
        hr: ({ className, ...props }) => (
          <hr
            className={cn(
              "my-4 border-slate-200 dark:border-slate-800",
              className,
            )}
            {...props}
          />
        ),
        li: ({ className, ...props }) => (
          <li
            className={cn("pl-1 marker:text-blue-500", className)}
            {...props}
          />
        ),
        ol: ({ className, ...props }) => (
          <ol
            className={cn("my-3 list-decimal space-y-1.5 pl-5", className)}
            {...props}
          />
        ),
        p: ({ className, ...props }) => (
          <p
            className={cn(
              "my-2.5 text-slate-700 first:mt-0 last:mb-0 dark:text-slate-300",
              className,
            )}
            {...props}
          />
        ),
        strong: ({ className, ...props }) => (
          <strong
            className={cn(
              "font-semibold text-slate-900 dark:text-slate-50",
              className,
            )}
            {...props}
          />
        ),
        table: ({ className, ...props }) => (
          <table
            className={cn(
              "my-3 w-full border-collapse overflow-hidden rounded-md text-sm",
              className,
            )}
            {...props}
          />
        ),
        td: ({ className, ...props }) => (
          <td
            className={cn(
              "border border-slate-200 px-2 py-1 align-top dark:border-slate-800",
              className,
            )}
            {...props}
          />
        ),
        th: ({ className, ...props }) => (
          <th
            className={cn(
              "border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold dark:border-slate-800 dark:bg-slate-950",
              className,
            )}
            {...props}
          />
        ),
        ul: ({ className, ...props }) => (
          <ul
            className={cn("my-3 list-disc space-y-1.5 pl-5", className)}
            {...props}
          />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  const endRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, []);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  });

  return (
    <ScrollArea className="min-h-0 flex-1 px-4 py-6 md:px-6">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-7">
        {messages.length === 0 ? (
          <div className="mx-auto flex min-h-[55vh] w-full flex-col justify-center py-6">
            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25">
                <Sparkles className="size-7" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 md:text-4xl">
                Hi, I&apos;m Tara
              </h1>
              <p className="mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400 md:text-base">
                Your AI travel buddy. Plan routes, compare budgets, or turn a
                destination idea into a day-wise trip.
              </p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {travelTasks.map((task) => {
                const Icon = task.icon;

                return (
                  <div
                    className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 transition-colors hover:border-blue-200 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-900 dark:hover:bg-blue-950/20"
                    key={task.title}
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300">
                      <Icon className="size-4.5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        {task.text}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {messages.map((message) =>
          message.role === "user" ? (
            <div className="flex flex-col items-end gap-1.5" key={message.id}>
              <span className="px-1 text-xs text-slate-400 dark:text-slate-500">
                {formatTime(message.createdAt)}
              </span>
              <div className="max-w-[85%] rounded-3xl rounded-tr-md bg-gradient-to-br from-blue-500 to-blue-600 px-5 py-3 text-sm leading-6 whitespace-pre-wrap text-white shadow-md shadow-blue-500/20 wrap-break-word">
                {message.content}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2" key={message.id}>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-blue-600 dark:text-blue-300">
                  Tara
                </span>
                <Sparkles className="size-4 text-blue-500 dark:text-blue-300" />
              </div>
              <div className="rounded-3xl rounded-tl-md bg-slate-100 px-5 py-4 text-sm leading-6 wrap-break-word dark:bg-slate-900 dark:text-slate-300">
                <MarkdownMessage content={message.content} />
                {message.usedFallback ? (
                  <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                    Using saved travel context for this response.
                  </div>
                ) : null}
              </div>
            </div>
          ),
        )}

        {isLoading ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-blue-600 dark:text-blue-300">
                Tara
              </span>
              <Sparkles className="size-4 text-blue-500 dark:text-blue-300" />
            </div>
            <div className="flex w-fit items-center gap-1.5 rounded-3xl rounded-tl-md bg-slate-100 px-5 py-4 dark:bg-slate-900">
              <span className="size-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]" />
              <span className="size-2 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]" />
              <span className="size-2 animate-bounce rounded-full bg-blue-400" />
            </div>
          </div>
        ) : null}
        <div ref={endRef} />
      </div>
    </ScrollArea>
  );
}
