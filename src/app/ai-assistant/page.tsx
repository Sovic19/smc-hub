"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Bot, Copy, Info, Plus, Send, Sparkles, Trash2, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useData } from "@/context/DataContext";
import { useToast } from "@/context/ToastContext";
import { AI_DISCLAIMER, QUICK_PROMPTS, generateMockAiResponse } from "@/lib/mockAi";
import { formatDateTime, timeAgo } from "@/lib/format";
import { cn } from "@/lib/cn";

export default function AiAssistantPage() {
  const { players, clubs, contacts, deals, games, alerts, aiConversations, createAiConversation, appendAiMessage, deleteAiConversation } = useData();
  const { showToast } = useToast();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const conversations = useMemo(
    () => [...aiConversations].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [aiConversations]
  );

  useEffect(() => {
    if (!activeId && conversations.length > 0) {
      setActiveId(conversations[0].id);
    }
  }, [activeId, conversations]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length]);

  const ctx = { players, clubs, contacts, deals, games, alerts };

  function send(promptOverride?: string) {
    const prompt = (promptOverride ?? draft).trim();
    if (!prompt) return;

    let conversationId = activeId;
    if (!conversationId) {
      const created = createAiConversation({
        title: prompt.slice(0, 48),
        messages: [],
      });
      conversationId = created.id;
      setActiveId(created.id);
    }

    appendAiMessage(conversationId, { role: "user", content: prompt, timestamp: new Date().toISOString() });
    const response = generateMockAiResponse(prompt, ctx);
    window.setTimeout(() => {
      appendAiMessage(conversationId!, { role: "assistant", content: response, timestamp: new Date().toISOString() });
    }, 250);
    setDraft("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    send();
  }

  function startNewConversation() {
    const created = createAiConversation({ title: "New conversation", messages: [] });
    setActiveId(created.id);
  }

  function copyMessage(text: string) {
    navigator.clipboard.writeText(text).catch(() => undefined);
    showToast("Copied to clipboard", { variant: "success" });
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white">SMC AI Assistant</h2>
        <p className="mt-1 text-sm text-slate-400">Ask questions about your players, clubs, deals, and performance data.</p>
      </div>

      <div className="flex items-start gap-2.5 rounded-lg border border-violet-100 bg-violet-50/60 px-4 py-3 text-sm text-violet-800">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-violet-500" />
        <p>{AI_DISCLAIMER}</p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
        <Card className="flex min-h-0 flex-col overflow-hidden">
          <div className="border-b border-slate-100 p-3">
            <Button size="sm" className="w-full" onClick={startNewConversation}>
              <Plus className="h-4 w-4" />
              New Conversation
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="px-2 py-4 text-center text-xs text-slate-400">No conversations yet.</p>
            ) : (
              <ul className="space-y-1">
                {conversations.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => setActiveId(c.id)}
                      className={cn(
                        "group flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        c.id === activeId ? "bg-brand-50 text-brand-800" : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{c.title}</span>
                        {c.linkedEntityLabel && (
                          <span className="mt-0.5 block truncate text-xs text-slate-400">{c.linkedEntityLabel}</span>
                        )}
                        <span className="mt-0.5 block text-[11px] text-slate-400">{timeAgo(c.updatedAt)}</span>
                      </span>
                      <Trash2
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-300 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteAiConversation(c.id);
                          if (activeId === c.id) setActiveId(null);
                        }}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>

        <Card className="flex min-h-0 flex-col overflow-hidden">
          {active?.linkedEntityLabel && (
            <div className="border-b border-slate-100 px-4 py-2.5">
              <Badge tone="brand">{active.linkedEntityLabel}</Badge>
            </div>
          )}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
            {!active || active.messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
                <Sparkles className="h-6 w-6 text-slate-300" />
                <p>Ask a question or try one of the quick prompts below.</p>
              </div>
            ) : (
              active.messages.map((m) => (
                <div key={m.id} className={cn("flex gap-2.5", m.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                      m.role === "user" ? "bg-slate-200 text-slate-600" : "bg-brand-100 text-brand-700"
                    )}
                  >
                    {m.role === "user" ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                  </div>
                  <div className={cn("group max-w-[80%] space-y-1", m.role === "user" ? "items-end text-right" : "items-start")}>
                    <div
                      className={cn(
                        "whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                        m.role === "user" ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700"
                      )}
                    >
                      {m.content}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>{formatDateTime(m.timestamp)}</span>
                      {m.role === "assistant" && (
                        <button onClick={() => copyMessage(m.content)} className="inline-flex items-center gap-1 opacity-0 transition-opacity hover:text-brand-600 group-hover:opacity-100">
                          <Copy className="h-3 w-3" /> Copy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 p-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {QUICK_PROMPTS.slice(0, 6).map((p) => (
                <button
                  key={p}
                  onClick={() => send(p)}
                  className="rounded-full bg-slate-50 px-2.5 py-1 text-xs text-slate-600 ring-1 ring-inset ring-slate-200 transition-colors hover:bg-slate-100"
                >
                  {p}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Ask the SMC assistant…"
                className="flex-1"
              />
              <Button type="submit" disabled={!draft.trim()}>
                <Send className="h-4 w-4" />
                Send
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
