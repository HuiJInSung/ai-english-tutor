"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { scenarios } from "@/lib/scenarios";

export default function ScenarioPicker() {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function start(scenarioId: string) {
    setLoadingId(scenarioId);
    setError("");
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenario: scenarioId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push(`/chat/${data.conversationId}`);
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : "發生錯誤");
      setLoadingId(null);
    }
  }

  return (
    <>
      {error && (
        <p className="mt-6 rounded-2xl border border-bad/20 bg-bad/5 px-4 py-3 text-sm text-bad">{error}</p>
      )}
      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {scenarios.map((s) => {
          const isLoading = loadingId === s.id;
          return (
            <button
              key={s.id}
              onClick={() => start(s.id)}
              disabled={loadingId !== null}
              className={`group relative flex flex-col items-start rounded-3xl border bg-surface p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10 disabled:cursor-not-allowed ${
                isLoading ? "border-accent shadow-xl shadow-accent/15" : "border-line"
              } ${loadingId !== null && !isLoading ? "opacity-50" : ""}`}
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-2xl transition group-hover:scale-110">
                {s.emoji}
              </span>
              <span className="mt-5 font-semibold">{s.name}</span>
              <span className="mt-1 text-sm leading-snug text-muted">{s.description}</span>
              <span className="mt-4 text-sm font-medium text-accent">
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="size-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                    AI 準備中…
                  </span>
                ) : (
                  <span className="opacity-0 transition group-hover:opacity-100">開始對話 →</span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
