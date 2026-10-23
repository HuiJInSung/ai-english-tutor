"use client";

import { useState } from "react";
import type { MessageFeedback } from "@/lib/corrections";

type Kind = "grammar" | "better";

type Props = {
  conversationId: string;
  messageId: string;
  feedback: MessageFeedback;
  onChange: (feedback: MessageFeedback) => void;
};

// 使用者訊息下方的「糾正文法」「更好的回答」按鈕與結果
export default function MessageFeedbackPanel({
  conversationId,
  messageId,
  feedback,
  onChange,
}: Props) {
  const [loading, setLoading] = useState<Kind | null>(null);
  const [error, setError] = useState("");

  async function request(kind: Kind) {
    if (feedback[kind] || loading) return;
    setLoading(kind);
    setError("");
    try {
      const res = await fetch(
        `/api/conversations/${conversationId}/messages/${messageId}/${kind}`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onChange({ ...feedback, [kind]: data[kind] });
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "發生錯誤");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-2 flex w-full max-w-[80%] flex-col items-end gap-3">
      <div className="flex gap-2">
        <FeedbackButton
          label="糾正文法"
          icon={
            <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
          }
          loading={loading === "grammar"}
          done={Boolean(feedback.grammar)}
          disabled={loading !== null}
          onClick={() => request("grammar")}
        />
        <FeedbackButton
          label="更好的完整回答"
          icon={
            <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2Z" />
          }
          loading={loading === "better"}
          done={Boolean(feedback.better)}
          disabled={loading !== null}
          onClick={() => request("better")}
        />
      </div>

      {error && <p className="text-xs text-bad">{error}</p>}

      {feedback.grammar && (
        <div className="rise-in w-full overflow-hidden rounded-2xl border border-line bg-surface text-sm shadow-sm">
          <div className="flex items-center gap-2 border-b border-line bg-warn-soft/70 px-4 py-2">
            <span className="size-1.5 rounded-full bg-warn" />
            <span className="text-xs font-semibold tracking-wide text-warn">文法糾正</span>
          </div>
          <div className="px-4 py-3">
            {feedback.grammar.hasErrors ? (
              <>
                <p className="text-[15px] font-medium leading-relaxed">{feedback.grammar.correctedText}</p>
                <ul className="mt-3 space-y-2.5">
                  {feedback.grammar.issues.map((issue, i) => (
                    <li key={i} className="border-l-2 border-warn/40 pl-3">
                      <p>
                        <span className="text-bad line-through decoration-bad/60">{issue.original}</span>
                        <span className="mx-1.5 text-muted">→</span>
                        <span className="font-semibold text-good">{issue.corrected}</span>
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted">{issue.explanation}</p>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="flex items-center gap-2 text-good">
                <span className="text-base">✓</span> 這句沒有文法錯誤，很棒！
              </p>
            )}
          </div>
        </div>
      )}

      {feedback.better && (
        <div className="rise-in w-full overflow-hidden rounded-2xl border border-line bg-surface text-sm shadow-sm">
          <div className="flex items-center gap-2 border-b border-line bg-good-soft/70 px-4 py-2">
            <span className="size-1.5 rounded-full bg-good" />
            <span className="text-xs font-semibold tracking-wide text-good">更好的完整回答</span>
          </div>
          <div className="px-4 py-3">
            <p className="font-serif text-xl leading-snug">“{feedback.better.betterAnswer}”</p>
            {feedback.better.alternatives.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-medium text-muted">其他說法</p>
                <ul className="mt-1.5 space-y-1.5">
                  {feedback.better.alternatives.map((alt, i) => (
                    <li key={i} className="rounded-xl bg-surface-2 px-3 py-2">
                      {alt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {feedback.better.explanation && (
              <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-muted">
                {feedback.better.explanation}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function FeedbackButton({
  label,
  icon,
  loading,
  done,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  loading: boolean;
  done: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || done}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
        done
          ? "border-transparent bg-surface-2 text-muted"
          : "border-line bg-surface text-ink shadow-sm hover:-translate-y-px hover:border-accent/40 hover:text-accent disabled:opacity-50 disabled:hover:translate-y-0"
      }`}
    >
      {loading ? (
        <span className="size-3 animate-spin rounded-full border-[1.5px] border-accent border-t-transparent" />
      ) : (
        <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {done ? <path d="M20 6 9 17l-5-5" /> : icon}
        </svg>
      )}
      {loading ? "分析中…" : label}
    </button>
  );
}
