import { Suspense } from "react";
import Link from "next/link";
import AppHeader from "@/components/AppHeader";
import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { Correction } from "@/models/Correction";

export default function CorrectionsPage() {
  return (
    <Suspense fallback={<p className="p-10 text-center text-muted">載入中…</p>}>
      <CorrectionsContent />
    </Suspense>
  );
}

async function CorrectionsContent() {
  const user = await requireUser();

  await connectDB();
  const corrections = await Correction.find({ userId: user.id })
    .sort({ createdAt: -1 })
    .lean();

  const grammarCount = corrections.filter((c) => c.type === "grammar").length;

  return (
    <>
      <AppHeader user={user} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12 sm:py-16">
        <p className="font-serif text-lg italic text-accent">Learn from every sentence</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">糾錯紀錄</h1>
        <p className="mt-3 text-muted">
          文法糾正 {grammarCount} 筆 · 更好的回答 {corrections.length - grammarCount} 筆
        </p>

        {corrections.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-line px-6 py-16 text-center">
            <p className="text-4xl">✏️</p>
            <p className="mt-4 font-semibold">還沒有糾錯紀錄</p>
            <p className="mt-1 text-sm text-muted">
              在對話中按下自己訊息下方的「糾正文法」或「更好的完整回答」，結果就會收藏在這裡。
            </p>
          </div>
        ) : (
          <ul className="mt-10 space-y-4">
            {corrections.map((c) => {
              const isGrammar = c.type === "grammar";
              return (
                <li
                  key={c._id.toString()}
                  className="overflow-hidden rounded-3xl border border-line bg-surface shadow-sm"
                >
                  <div
                    className={`flex items-center gap-2 border-b border-line px-5 py-2.5 ${
                      isGrammar ? "bg-warn-soft/70" : "bg-good-soft/70"
                    }`}
                  >
                    <span className={`size-1.5 rounded-full ${isGrammar ? "bg-warn" : "bg-good"}`} />
                    <span className={`text-xs font-semibold tracking-wide ${isGrammar ? "text-warn" : "text-good"}`}>
                      {isGrammar ? "文法糾正" : "更好的完整回答"}
                    </span>
                    <span className="ml-auto text-xs text-muted">{c.createdAt.toLocaleString("zh-TW")}</span>
                  </div>

                  <div className="px-5 py-4 text-sm">
                    <p className="text-xs font-medium text-muted">你說</p>
                    <p className="mt-1 text-muted">{c.originalText}</p>

                    <p className="mt-4 text-xs font-medium text-muted">{isGrammar ? "修正後" : "更好的說法"}</p>
                    {isGrammar && c.issues.length === 0 ? (
                      <p className="mt-1 text-good">✓ 沒有文法錯誤</p>
                    ) : (
                      <p className={`mt-1 ${isGrammar ? "text-[15px] font-medium" : "font-serif text-xl leading-snug"}`}>
                        {isGrammar ? c.correctedText : `“${c.correctedText}”`}
                      </p>
                    )}

                    {isGrammar && c.issues.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {c.issues.map((issue, i) => (
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
                    )}

                    {!isGrammar && c.alternatives.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {c.alternatives.map((alt, i) => (
                          <li key={i} className="rounded-xl bg-surface-2 px-3 py-2">
                            {alt}
                          </li>
                        ))}
                      </ul>
                    )}

                    {!isGrammar && c.explanation && (
                      <p className="mt-3 whitespace-pre-wrap text-xs leading-relaxed text-muted">{c.explanation}</p>
                    )}

                    <Link
                      href={`/chat/${c.conversationId.toString()}`}
                      className="mt-4 inline-block text-xs font-medium text-accent hover:underline"
                    >
                      查看這場對話 →
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
