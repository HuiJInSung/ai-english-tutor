import { getCurrentUser, unauthorized } from "@/lib/auth";
import { findUserMessage, toBetterAnswerResult } from "@/lib/corrections";
import { suggestBetterAnswer } from "@/lib/openai";
import { getScenario } from "@/lib/scenarios";
import { Correction } from "@/models/Correction";

// 針對使用者某一句英文，給出更好、更完整的回答
export async function POST(
  _request: Request,
  ctx: RouteContext<"/api/conversations/[id]/messages/[messageId]/better">
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id, messageId } = await ctx.params;

  try {
    const found = await findUserMessage(user.id, id, messageId);
    const scenario = found && getScenario(found.conversation.scenario);
    if (!found || !scenario) {
      return Response.json({ error: "找不到這則訊息" }, { status: 404 });
    }

    // 同一句話已經產生過就直接回傳，不重複呼叫 OpenAI
    const existing = await Correction.findOne({
      userId: user.id,
      messageId,
      type: "expression",
    }).lean();
    if (existing) {
      return Response.json({ better: toBetterAnswerResult(existing) });
    }

    const { message, previousQuestion } = found;
    const better = await suggestBetterAnswer(scenario, message.content, previousQuestion);

    await Correction.create({
      userId: user.id,
      conversationId: id,
      messageId,
      type: "expression",
      originalText: message.content,
      correctedText: better.betterAnswer,
      explanation: better.explanation,
      alternatives: better.alternatives,
    });

    return Response.json({ better });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "產生更好的回答失敗，請稍後再試" }, { status: 500 });
  }
}
