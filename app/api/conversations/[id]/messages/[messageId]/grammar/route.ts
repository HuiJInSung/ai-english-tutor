import { getCurrentUser, unauthorized } from "@/lib/auth";
import { findUserMessage, toGrammarResult } from "@/lib/corrections";
import { checkGrammar } from "@/lib/openai";
import { Correction } from "@/models/Correction";

// 糾正使用者某一句英文的文法
export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/conversations/[id]/messages/[messageId]/grammar">
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id, messageId } = await ctx.params;

  try {
    const found = await findUserMessage(user.id, id, messageId);
    if (!found) {
      return Response.json({ error: "找不到這則訊息" }, { status: 404 });
    }

    // 同一句話已經糾正過就直接回傳，不重複呼叫 OpenAI
    const existing = await Correction.findOne({
      userId: user.id,
      messageId,
      type: "grammar",
    }).lean();
    if (existing) {
      return Response.json({ grammar: toGrammarResult(existing) });
    }

    const { message, previousQuestion } = found;
    const grammar = await checkGrammar(message.content, previousQuestion);

    await Correction.create({
      userId: user.id,
      conversationId: id,
      messageId,
      type: "grammar",
      originalText: message.content,
      correctedText: grammar.correctedText,
      explanation: grammar.issues.map((i) => i.explanation).join("\n"),
      issues: grammar.issues,
    });

    return Response.json({ grammar });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "文法糾正失敗，請稍後再試" }, { status: 500 });
  }
}
