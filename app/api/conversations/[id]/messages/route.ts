import { isValidObjectId } from "mongoose";
import { getCurrentUser, unauthorized } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { generateReply } from "@/lib/openai";
import { getScenario } from "@/lib/scenarios";
import { Conversation } from "@/models/Conversation";

// 使用者送出一句英文，AI 依情境人設回應
export async function POST(
  request: Request,
  ctx: RouteContext<"/api/conversations/[id]/messages">
) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const { id } = await ctx.params;
  const { content } = await request.json();
  const text = typeof content === "string" ? content.trim() : "";

  if (!text) {
    return Response.json({ error: "請輸入內容" }, { status: 400 });
  }
  if (!isValidObjectId(id)) {
    return Response.json({ error: "找不到這場練習" }, { status: 404 });
  }

  try {
    await connectDB();

    // 只找得到自己的對話
    const conversation = await Conversation.findOne({ _id: id, userId: user.id });
    const scenario = conversation && getScenario(conversation.scenario);
    if (!conversation || !scenario) {
      return Response.json({ error: "找不到這場練習" }, { status: 404 });
    }

    conversation.messages.push({ role: "user", content: text });
    const userMessage = conversation.messages.at(-1)!;

    const history = conversation.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    const reply = await generateReply(scenario, conversation.level, history);

    conversation.messages.push({ role: "assistant", content: reply });
    const assistantMessage = conversation.messages.at(-1)!;
    await conversation.save();

    return Response.json({
      userMessage: { id: userMessage._id.toString(), role: "user", content: text },
      reply: { id: assistantMessage._id.toString(), role: "assistant", content: reply },
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "AI 回應失敗，請稍後再試" }, { status: 500 });
  }
}
