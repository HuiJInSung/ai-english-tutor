"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import MessageFeedbackPanel from "@/components/MessageFeedbackPanel";
import type { MessageFeedback } from "@/lib/corrections";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Props = {
  conversationId: string;
  scenarioName: string;
  scenarioEmoji: string;
  initialMessages: Message[];
  initialFeedback: Record<string, MessageFeedback>;
};

export default function ChatRoom({
  conversationId,
  scenarioName,
  scenarioEmoji,
  initialMessages,
  initialFeedback,
}: Props) {
  const [messages, setMessages] = useState(initialMessages);
  const [feedback, setFeedback] = useState(initialFeedback);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  async function send(e?: React.FormEvent) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    // 先把使用者的訊息顯示出來，等 API 回來再換成正式的
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "user", content: text }]);
    setInput("");
    setSending(true);
    setError("");

    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        data.userMessage,
        data.reply,
      ]);
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setInput(text);
      setError(err instanceof Error && err.message ? err.message : "發生錯誤");
    } finally {
      setSending(false);
    }
  }

  // Enter 送出、Shift+Enter 換行；中文輸入法選字時不送出
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  const userTurns = messages.filter((m) => m.role === "user").length;

  return (
    <div className="flex h-dvh flex-col">
      <header className="z-10 border-b border-line bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-3xl items-center gap-3 px-4 py-3">
          <Link
            href="/practice"
            aria-label="換場景"
            className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2 hover:text-ink"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <span className="grid size-10 place-items-center rounded-2xl bg-surface-2 text-xl">{scenarioEmoji}</span>
          <div className="min-w-0">
            <h1 className="font-semibold leading-tight">{scenarioName}</h1>
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="size-1.5 rounded-full bg-good" />
              AI 角色扮演中 · 你說了 {userTurns} 句
            </p>
          </div>
          <Link
            href="/history"
            className="ml-auto rounded-full border border-line px-3 py-1.5 text-sm text-muted transition hover:border-ink/30 hover:text-ink"
          >
            練習紀錄
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-line px-4 py-3 text-center text-xs leading-relaxed text-muted">
            用英文回覆 AI 的問題。每句話下方都可以按
            <span className="font-medium text-ink">「糾正文法」</span>或
            <span className="font-medium text-ink">「更好的完整回答」</span>。
          </div>

          {messages.map((m) =>
            m.role === "assistant" ? (
              <div key={m.id} className="rise-in flex items-end gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-lg shadow-sm">
                  {scenarioEmoji}
                </span>
                <p className="max-w-[80%] whitespace-pre-wrap rounded-3xl rounded-bl-md border border-line bg-surface px-5 py-3 text-[15px] leading-relaxed shadow-sm">
                  {m.content}
                </p>
              </div>
            ) : (
              <div key={m.id} className="rise-in flex flex-col items-end">
                <p className="max-w-[80%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-gradient-to-br from-accent to-accent-2 px-5 py-3 text-[15px] leading-relaxed text-white shadow-md shadow-accent/20">
                  {m.content}
                </p>
                {!m.id.startsWith("temp-") && (
                  <MessageFeedbackPanel
                    conversationId={conversationId}
                    messageId={m.id}
                    feedback={feedback[m.id] ?? {}}
                    onChange={(f) => setFeedback((prev) => ({ ...prev, [m.id]: f }))}
                  />
                )}
              </div>
            )
          )}

          {sending && (
            <div className="rise-in flex items-end gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-surface text-lg shadow-sm">
                {scenarioEmoji}
              </span>
              <div className="flex gap-1.5 rounded-3xl rounded-bl-md border border-line bg-surface px-5 py-4 shadow-sm">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="typing-dot size-2 rounded-full bg-muted"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-line bg-canvas/80 backdrop-blur-md">
        <div className="mx-auto w-full max-w-3xl px-4 pb-5 pt-3">
          {error && (
            <p className="mb-3 rounded-xl border border-bad/20 bg-bad/5 px-4 py-2 text-sm text-bad">{error}</p>
          )}
          <form
            onSubmit={send}
            className="flex items-end gap-2 rounded-3xl border border-line bg-surface p-2 shadow-lg shadow-black/5 transition focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your reply in English…"
              rows={1}
              className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-muted/70 [field-sizing:content]"
              autoFocus
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="送出"
              className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-white shadow-md shadow-accent/25 transition hover:scale-105 disabled:scale-100 disabled:opacity-40 disabled:shadow-none"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </form>
          <p className="mt-2 text-center text-[11px] text-muted">Enter 送出 · Shift + Enter 換行</p>
        </div>
      </div>
    </div>
  );
}
