import { Suspense } from "react";
import Link from "next/link";
import { Types } from "mongoose";
import AppHeader from "@/components/AppHeader";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { getScenario } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";
import { Correction } from "@/models/Correction";

export default function HistoryPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted">載入中…</p>}>
      <HistoryContent />
    </Suspense>
  );
}

async function HistoryContent() {
  const user = await requireUser();

  await connectDB();
  const conversations = await Conversation.find({ userId: user.id })
    .sort({ updatedAt: -1 })
    .lean();

  // 每場練習有幾筆糾錯紀錄
  const counts = await Correction.aggregate<{ _id: unknown; count: number }>([
    // aggregate 不會自動轉型，要手動轉成 ObjectId
    { $match: { userId: new Types.ObjectId(user.id) } },
    { $group: { _id: "$conversationId", count: { $sum: 1 } } },
  ]);
  const correctionCount = new Map(counts.map((c) => [String(c._id), c.count]));

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-12 sm:py-16">
        <p className="font-serif text-lg italic text-accent">Your journey</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">練習紀錄</h1>
        <p className="mt-3 text-muted">
          共 {conversations.length} 場練習，點進去可以複習或繼續對話。
        </p>

        {conversations.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="mt-10 grid gap-4 md:grid-cols-2">
            {conversations.map((c) => {
              const scenario = getScenario(c.scenario);
              const id = c._id.toString();
              const userTurns = c.messages.filter((m) => m.role === "user");
              const lastUserMessage = userTurns.at(-1)?.content;
              const corrections = correctionCount.get(id) ?? 0;
              return (
                <li key={id}>
                  <Link
                    href={`/chat/${id}`}
                    className="group flex h-full flex-col rounded-3xl border border-line bg-surface p-5 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/10"
                  >
                    <div className="flex items-center gap-3">
                      <span className="grid size-11 place-items-center rounded-2xl bg-surface-2 text-xl">
                        {scenario?.emoji}
                      </span>
                      <div>
                        <p className="font-semibold">{scenario?.name ?? c.title}</p>
                        <p className="text-xs text-muted">{c.updatedAt.toLocaleString("zh-TW")}</p>
                      </div>
                      <span className="ml-auto text-accent opacity-0 transition group-hover:opacity-100">→</span>
                    </div>
                    <p className="mt-4 line-clamp-2 flex-1 text-[15px] leading-relaxed">
                      {lastUserMessage ? (
                        <>“{lastUserMessage}”</>
                      ) : (
                        <span className="text-muted">還沒有回覆，點進去開始對話</span>
                      )}
                    </p>
                    <div className="mt-4 flex gap-2 text-xs">
                      <span className="rounded-full bg-accent-soft px-2.5 py-1 font-medium text-accent">
                        你說了 {userTurns.length} 句
                      </span>
                      <span className="rounded-full bg-warn-soft px-2.5 py-1 font-medium text-warn">
                        糾錯 {corrections} 筆
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 rounded-3xl border border-dashed border-line px-6 py-16 text-center">
      <p className="text-4xl">💬</p>
      <p className="mt-4 font-semibold">還沒有練習紀錄</p>
      <p className="mt-1 text-sm text-muted">選一個場景，開始你的第一場英文對話吧。</p>
      <Link
        href="/practice"
        className="mt-6 inline-block rounded-full bg-gradient-to-r from-accent to-accent-2 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-accent/25"
      >
        開始第一場練習
      </Link>
    </div>
  );
}
